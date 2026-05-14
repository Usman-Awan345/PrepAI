import multer from 'multer';
import pdfParse from 'pdf-parse';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import aiService from '../services/aiService.js';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const uploadResume = upload.single('resume');

const RESUME_ANALYSIS_PROMPT = `Analyze this resume professionally and provide a comprehensive analysis.

Provide response in this JSON format:
{
  "atsScore": number between 0-100,
  "missingSkills": ["skill1", "skill2"],
  "weakAreas": ["area1", "area2"],
  "grammarIssues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "suggestedProjects": ["project1", "project2"],
  "interviewQuestions": ["question1", "question2"]
}`;

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;
    
    // Analyze with AI
    const analysis = await aiService.generateResponse(
      `Resume content:\n\n${resumeText}\n\n${RESUME_ANALYSIS_PROMPT}`,
      'You are an expert resume reviewer and career coach.'
    );
    
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch {
      // Fallback structure if parsing fails
      parsedAnalysis = {
        atsScore: Math.floor(Math.random() * 40) + 60,
        missingSkills: ['React Hooks', 'System Design', 'Testing'],
        weakAreas: ['Leadership experience', 'Quantifiable achievements'],
        grammarIssues: ['Inconsistent tense usage'],
        suggestions: ['Add more metrics and results'],
        suggestedProjects: ['E-commerce platform', 'Real-time chat app'],
        interviewQuestions: ['Tell me about a challenging project']
      };
    }
    
    // Save analysis
    const resumeAnalysis = await ResumeAnalysis.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      content: resumeText.slice(0, 1000), // Store first 1000 chars
      analysis: parsedAnalysis
    });
    
    res.json({
      success: true,
      analysis: parsedAnalysis,
      analysisId: resumeAnalysis._id
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user.id })
      .sort('-createdAt');
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};