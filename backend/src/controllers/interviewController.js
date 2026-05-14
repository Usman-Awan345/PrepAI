import Interview from '../models/Interview.js';
import User from '../models/User.js';
import aiService from '../services/aiService.js';

const INTERVIEW_SYSTEM_PROMPT = `You are a senior technical interviewer conducting a professional interview.

Rules:
- Ask one interview question at a time
- Wait for candidate response
- Analyze answers carefully
- Give constructive feedback
- Give score out of 10
- Increase difficulty gradually
- Be professional and realistic
- Focus on practical understanding
- Ask follow-up questions when needed

Keep questions relevant to the selected interview type.`;

export const startInterview = async (req, res) => {
  try {
    const { type, mode = 'text' } = req.body;
    
    const interview = await Interview.create({
      userId: req.user.id,
      type,
      mode,
      questions: [],
      status: 'in-progress'
    });
    
    // Generate first question
    const prompt = `Start a ${type} interview. Ask the first technical question. Keep it concise but challenging.`;
    const firstQuestion = await aiService.generateResponse(prompt, INTERVIEW_SYSTEM_PROMPT);
    
    interview.questions.push({
      question: firstQuestion
    });
    
    await interview.save();
    
    res.json({
      interview,
      currentQuestion: firstQuestion,
      questionNumber: 1
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;
    
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.id
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    const currentQ = interview.questions[interview.questions.length - 1];
    currentQ.answer = answer;
    
    // Analyze answer
    const analysisPrompt = `As an interviewer, analyze this answer to the question: "${currentQ.question}"
    
Candidate's answer: "${answer}"

Provide:
1. Score out of 10
2. Constructive feedback
3. Key points missed (if any)
4. What was good about the answer

Format as JSON with keys: score, feedback, missedPoints, strengths.`;
    
    const analysis = await aiService.generateResponse(analysisPrompt, INTERVIEW_SYSTEM_PROMPT);
    let parsedAnalysis;
    try {
      // Clean up JSON if wrapped in code blocks
      const cleaned = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedAnalysis = JSON.parse(cleaned);
    } catch {
      parsedAnalysis = {
        score: Math.floor(Math.random() * 5) + 5,
        feedback: analysis
      };
    }
    
    currentQ.score = parsedAnalysis.score || 7;
    currentQ.feedback = typeof parsedAnalysis.feedback === 'string' 
      ? parsedAnalysis.feedback 
      : JSON.stringify(parsedAnalysis.feedback);
    
    // Generate next question or end interview
    let nextQuestion;
    let isComplete = false;
    
    if (interview.questions.length >= 5) {
      isComplete = true;
      interview.status = 'completed';
      interview.completedAt = new Date();
      
      // Update user stats
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          user.stats.totalInterviews += 1;
          const scores = interview.questions.map(q => q.score || 0);
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          user.stats.averageScore = ((user.stats.averageScore * (user.stats.totalInterviews - 1)) + avg) / user.stats.totalInterviews;
          await user.save();
        }
      } catch (statsError) {
        console.error('Stats update error:', statsError);
      }
    } else {
      const nextPrompt = `Based on the candidate's performance in the ${interview.type} interview, ask the next question.
Current question number: ${interview.questions.length + 1}
Previous answer score: ${currentQ.score}/10
Make the next question appropriately challenging.`;
      
      nextQuestion = await aiService.generateResponse(nextPrompt, INTERVIEW_SYSTEM_PROMPT);
      interview.questions.push({
        question: nextQuestion
      });
    }
    
    await interview.save();
    
    res.json({
      interview,
      feedback: currentQ.feedback,
      score: currentQ.score,
      nextQuestion,
      isComplete,
      questionNumber: interview.questions.length
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .sort('-startedAt');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};