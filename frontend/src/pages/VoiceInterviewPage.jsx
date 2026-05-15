import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 FiArrowRight,
 FiAward,
 FiCheckCircle,
 FiMic,
 FiMicOff,
 FiRefreshCw,
 FiSend,
 FiVolume2,
 FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const TOTAL_QUESTIONS = 12;

const interviewTypes = [
 { id: 'Frontend', name: 'Frontend', color: 'from-blue-500 to-cyan-500' },
 { id: 'Backend', name: 'Backend', color: 'from-green-500 to-emerald-500' },
 { id: 'MERN Stack', name: 'MERN Stack', color: 'from-purple-500 to-pink-500' },
 { id: 'JavaScript', name: 'JavaScript', color: 'from-yellow-500 to-orange-500' },
 { id: 'React', name: 'React', color: 'from-cyan-500 to-blue-500' },
 { id: 'Node.js', name: 'Node.js', color: 'from-green-500 to-teal-500' },
 { id: 'DSA', name: 'DSA', color: 'from-red-500 to-pink-500' },
 { id: 'HR Interview', name: 'HR Interview', color: 'from-indigo-500 to-purple-500' },
];

const levels = [
 { id: 'beginner', title: 'Beginner', description: 'Basic concepts, simple definitions, and small examples.' },
 { id: 'medium', title: 'Medium', description: 'Project-level scenarios, practical debugging, and trade-offs.' },
 { id: 'expert', title: 'Expert', description: 'Architecture, performance, scaling, and senior-level reasoning.' },
];

const createInterviewChat = async (title) => {
 const response = await api.post('/chat', { title }, { timeout: 12000 });
 return response?.data?._id;
};

const askAI = async ({ chatId, message, maxTokens = 900 }) => {
 const response = await api.post(
 '/chat/message',
 {
  chatId,
  message,
  responseMode: 'fast',
  maxTokens,
 },
 { timeout: 30000 }
 );

 return response?.data?.response || response?.data?.message || '';
};

const parseJSON = (text) => {
 if (!text) return null;
 const cleaned = text.replace(/```json|```/gi, '').trim();
 const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
 const objectMatch = cleaned.match(/\{[\s\S]*\}/);
 const candidate = arrayMatch?.[0] || objectMatch?.[0];
 if (!candidate) return null;

 try {
 return JSON.parse(candidate);
 } catch {
 return null;
 }
};

const normalizeQuestions = (data) => {
 const rawQuestions = Array.isArray(data) ? data : data?.questions;
 if (!Array.isArray(rawQuestions)) return [];

 const unique = [];
 const seen = new Set();

 rawQuestions.forEach((item) => {
 const questionText = typeof item === 'string' ? item : item?.question;
 const question = questionText?.trim().replace(/^\d+[.)]\s*/, '');
 const key = question?.toLowerCase();

 if (question && question.length <= 140 && !seen.has(key)) {
  seen.add(key);
  unique.push({ id: `${Date.now()}-${unique.length}`, question });
 }
 });

 return unique.slice(0, TOTAL_QUESTIONS);
};

const buildQuestionSetPrompt = ({ topic, level, seed }) => `
You are a senior technical interviewer conducting a voice interview.
Generate ${TOTAL_QUESTIONS} fresh and unique spoken interview questions.
Topic: ${topic}
Candidate level: ${level}
Random seed: ${seed}

Rules:
- Every run must create a different question set.
- Do not use common repeated questions only like "What is React?" or "What is JavaScript?".
- Questions must move from easy to hard.
- Keep each question short, maximum 16 words.
- Ask one thing per question.
- Do not include answers.
- Questions must sound natural when spoken aloud.

Return only valid JSON in this exact shape:
{
 "questions": [
 {"question":"Question 1"},
 {"question":"Question 2"}
 ]
}
`;

const buildEvaluationPrompt = ({ topic, level, question, answer }) => `
You are a strict but helpful voice interview evaluator.
Topic: ${topic}
Candidate level: ${level}
Question: ${question}
Candidate answer transcript: ${answer}

Evaluate only according to the candidate answer.
Give a realistic numeric score from 0 to 10. The score must be a plain number, for example 7, not "7/10".
Always write a short correctAnswer for the question, even when the candidate answer is good.
If the answer is wrong, incomplete, or vague, correct the mistake first in one sentence, then give the ideal answer.
The correctAnswer must be specific, authentic, and interview-ready.
Keep correctAnswer under 70 words. Use simple language.
Never write long tutorials, markdown tables, long code blocks, or generic advice in correctAnswer.
Never leave correctAnswer empty, null, undefined, or as generic advice.
Do not give high marks for empty, unrelated, memorized, or copied answers.
Keep the response practical and interview-focused.

Return only valid JSON in this exact shape:
{
 "score": 7,
 "status": "Good answer",
 "feedback": "Feedback based on the candidate answer.",
 "correctAnswer": "Correct answer with clear guidance.",
 "improvementTips": ["Tip 1", "Tip 2", "Tip 3"]
}
`;


const buildCorrectAnswerPrompt = ({ topic, level, question, answer }) => `
You are a technical interview coach.
Topic: ${topic}
Candidate level: ${level}
Question: ${question}
Candidate answer: ${answer}

Write the correct answer for this exact question.
If the candidate answer is wrong or incomplete, correct the misunderstanding briefly, then give the ideal answer.
Keep it authentic, simple, and interview-ready.
Maximum 70 words. No markdown table. No long tutorial. No long code block.
Return only valid JSON in this exact shape:
{
 "correctAnswer": "The correct answer for this exact question."
}
`;

const stripMarkdown = (text = '') =>
 text
 .replace(/```[\s\S]*?```/g, '')
 .replace(/\*\*/g, '')
 .replace(/`/g, '')
 .replace(/#{1,6}\s/g, '')
 .replace(/\s+/g, ' ')
 .trim();

const makeAnswerConcise = (text = '') => {
 const cleaned = stripMarkdown(text);
 if (!cleaned) return '';

 const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
 const shortText = sentences.slice(0, 3).join(' ').trim();
 const words = shortText.split(/\s+/).filter(Boolean);
 return words.length > 75 ? `${words.slice(0, 75).join(' ')}...` : shortText;
};

const getCorrectAnswerFromData = (data) => {
 const value = data?.correctAnswer || data?.correct_answer || data?.idealAnswer || data?.modelAnswer || data?.answer;
 if (typeof value !== 'string') return '';
 const concise = makeAnswerConcise(value);
 return concise.length > 15 ? concise : '';
};

const extractScore = (value) => {
 if (typeof value === 'number') return value;
 if (typeof value === 'string') {
 const match = value.match(/\d+(?:\.\d+)?/);
 return match ? Number(match[0]) : 0;
 }
 return 0;
};

const compactText = (text, maxWords = 80) => {
 if (!text || typeof text !== 'string') return '';

 const cleaned = text
 .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, '').trim())
 .replace(/[*_#>]/g, '')
 .replace(/`/g, '')
 .replace(/\s+/g, ' ')
 .trim();

 const words = cleaned.split(' ').filter(Boolean);
 if (words.length <= maxWords) return cleaned;
 return `${words.slice(0, maxWords).join(' ')}...`;
};

const estimateFallbackScore = (answer) => {
 const words = answer.trim().split(/\s+/).filter(Boolean);
 if (words.length < 4) return 1;
 if (words.length < 10) return 3;
 if (words.length < 22) return 5;
 return 6;
};

const safeEvaluation = (data, answerText = '', forcedCorrectAnswer = '') => {
 const rawScore = extractScore(data?.score);
 const fallbackScore = estimateFallbackScore(answerText);
 const score = Math.max(0, Math.min(10, rawScore || fallbackScore));
 const correctAnswer = compactText(forcedCorrectAnswer || getCorrectAnswerFromData(data), 80);

 return {
 score,
 status: data?.status || (score >= 7 ? 'Good answer' : score >= 5 ? 'Partially correct' : 'Needs improvement'),
 feedback: compactText(data?.feedback, 55) || 'Your answer was evaluated based on accuracy, clarity, completeness, and practical understanding.',
 correctAnswer: correctAnswer || 'Correct answer could not be generated right now. Please try submitting again after checking your AI backend connection.',
 improvementTips: Array.isArray(data?.improvementTips)
  ? data.improvementTips.slice(0, 3)
  : ['Start with a clear definition.', 'Mention the main technical points.', 'Add one practical example.'],
 };
};

const VoiceInterviewPage = () => {
 const [selectedType, setSelectedType] = useState(null);
 const [selectedLevel, setSelectedLevel] = useState(null);
 const [showLevelModal, setShowLevelModal] = useState(false);
 const [chatId, setChatId] = useState(null);
 const [questions, setQuestions] = useState([]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [transcript, setTranscript] = useState('');
 const [isListening, setIsListening] = useState(false);
 const [isSpeaking, setIsSpeaking] = useState(false);
 const [loadingQuestions, setLoadingQuestions] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [latestResult, setLatestResult] = useState(null);
 const [results, setResults] = useState([]);
 const [completed, setCompleted] = useState(false);

 const recognitionRef = useRef(null);
 const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

 const currentQuestion = questions[currentIndex] || null;
 const progress = useMemo(() => ((currentIndex + 1) / TOTAL_QUESTIONS) * 100, [currentIndex]);
 const averageScore = useMemo(() => {
 if (!results.length) return 0;
 return results.reduce((sum, item) => sum + item.score, 0) / results.length;
 }, [results]);

 const stopSpeaking = () => {
 if (synthRef.current) {
  synthRef.current.cancel();
  setIsSpeaking(false);
 }
 };

 const speakText = (text) => {
 if (!text || !synthRef.current) return;
 stopSpeaking();
 const utterance = new SpeechSynthesisUtterance(text);
 utterance.rate = 0.95;
 utterance.pitch = 1;
 utterance.onstart = () => setIsSpeaking(true);
 utterance.onend = () => setIsSpeaking(false);
 utterance.onerror = () => setIsSpeaking(false);
 synthRef.current.speak(utterance);
 };

 useEffect(() => {
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 if (!SpeechRecognition) return undefined;

 const recognition = new SpeechRecognition();
 recognition.continuous = true;
 recognition.interimResults = true;
 recognition.lang = 'en-US';

 recognition.onresult = (event) => {
  let text = '';
  for (let i = 0; i < event.results.length; i += 1) {
  text += event.results[i][0].transcript;
  }
  if (text.trim()) stopSpeaking();
  setTranscript(text.trim());
 };

 recognition.onerror = () => {
  setIsListening(false);
  toast.error('Microphone error. Please check permissions.');
 };

 recognition.onend = () => setIsListening(false);
 recognitionRef.current = recognition;

 return () => {
  recognition.stop();
  stopSpeaking();
 };
 }, []);

 const generateQuestionSet = async (topic, level) => {
 setLoadingQuestions(true);
 const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}-${topic}-${level}`;

 try {
  const newChatId = await createInterviewChat(`Voice Interview ${topic} ${seed.slice(0, 8)}`);
  if (!newChatId) throw new Error('Chat was not created');
  setChatId(newChatId);

  const text = await askAI({
  chatId: newChatId,
  message: buildQuestionSetPrompt({ topic, level, seed }),
  maxTokens: 1200,
  });

  const parsed = parseJSON(text);
  const aiQuestions = normalizeQuestions(parsed);

  if (aiQuestions.length < 8) {
  throw new Error('AI did not return enough unique questions');
  }

  setQuestions(aiQuestions);
  toast.success('Fresh AI voice questions generated.');
  speakText(aiQuestions[0].question);
 } catch (error) {
  toast.error('AI questions were not generated. Please check backend and OpenRouter/OpenAI API key.');
  setQuestions([]);
  setChatId(null);
  throw error;
 } finally {
  setLoadingQuestions(false);
 }
 };

 const chooseTopic = (type) => {
 setSelectedType(type);
 setShowLevelModal(true);
 };

 const startInterview = async (level) => {
 if (!selectedType) return;
 setSelectedLevel(level);
 setShowLevelModal(false);
 setQuestions([]);
 setResults([]);
 setLatestResult(null);
 setTranscript('');
 setCurrentIndex(0);
 setCompleted(false);

 try {
  await generateQuestionSet(selectedType, level);
 } catch {
  setShowLevelModal(true);
 }
 };

 const startListening = () => {
 if (!recognitionRef.current) {
  toast.error('Speech recognition is not supported in this browser.');
  return;
 }
 stopSpeaking();
 setTranscript('');
 setLatestResult(null);
 try {
  recognitionRef.current.start();
  setIsListening(true);
 } catch {
  setIsListening(true);
 }
 };

 const stopListening = () => {
 if (recognitionRef.current) recognitionRef.current.stop();
 setIsListening(false);
 };

 const submitAnswer = async () => {
 if (!transcript.trim() || !currentQuestion || submitting) return;
 stopListening();
 setSubmitting(true);

 try {
  const activeChatId = chatId || await createInterviewChat(`Voice Evaluation ${Date.now()}`);
  if (!chatId) setChatId(activeChatId);

  const text = await askAI({
  chatId: activeChatId,
  message: buildEvaluationPrompt({
   topic: selectedType,
   level: selectedLevel,
   question: currentQuestion.question,
   answer: transcript.trim(),
  }),
  maxTokens: 420,
  });

  const parsedEvaluation = parseJSON(text);
  let forcedCorrectAnswer = getCorrectAnswerFromData(parsedEvaluation);

  if (!forcedCorrectAnswer) {
  const correctAnswerText = await askAI({
   chatId: activeChatId,
   message: buildCorrectAnswerPrompt({
   topic: selectedType,
   level: selectedLevel,
   question: currentQuestion.question,
   answer: transcript.trim(),
   }),
   maxTokens: 260,
  });
  forcedCorrectAnswer = getCorrectAnswerFromData(parseJSON(correctAnswerText));
  }

  const evaluation = safeEvaluation(parsedEvaluation, transcript.trim(), forcedCorrectAnswer);
  const result = {
  ...evaluation,
  question: currentQuestion.question,
  answer: transcript.trim(),
  };

  setLatestResult(result);
  setResults((prev) => [...prev, result]);
 } catch {
  toast.error('Answer evaluation failed. Please check backend AI API.');
 } finally {
  setSubmitting(false);
 }
 };

 const goToNextQuestion = () => {
 const nextIndex = currentIndex + 1;
 setLatestResult(null);
 setTranscript('');

 if (nextIndex >= questions.length || nextIndex >= TOTAL_QUESTIONS) {
  setCompleted(true);
  stopSpeaking();
  return;
 }

 setCurrentIndex(nextIndex);
 speakText(questions[nextIndex].question);
 };

 const resetInterview = () => {
 stopSpeaking();
 stopListening();
 setSelectedType(null);
 setSelectedLevel(null);
 setShowLevelModal(false);
 setChatId(null);
 setQuestions([]);
 setCurrentIndex(0);
 setTranscript('');
 setLatestResult(null);
 setResults([]);
 setCompleted(false);
 };

 if (completed) {
 return (
  <div className="p-4 md:p-8 max-w-6xl mx-auto">
  <div className="rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-white via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 md:p-8 shadow-2xl ">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
   <div>
    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-bold text-green-400">
    <FiCheckCircle /> Voice interview completed
    </div>
    <h1 className="text-3xl md:text-5xl font-black">Final Score: {averageScore.toFixed(1)}/10</h1>
    <p className="mt-2 text-zinc-600 dark:text-zinc-400 ">{selectedType} · {selectedLevel} · {results.length} evaluated answers</p>
   </div>
   <button onClick={resetInterview} className="btn-primary flex items-center justify-center gap-2">
    <FiRefreshCw /> Start New Interview
   </button>
   </div>

   <div className="mt-8 grid gap-4">
   {results.map((item, index) => (
    <div key={`${item.question}-${index}`} className="rounded-3xl border border-zinc-200 dark:border-zinc-800/70 bg-purple-50/70 dark:bg-white/[0.04] p-5 ">
    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
     <h3 className="font-bold">Q{index + 1}. {item.question}</h3>
     <span className="rounded-full bg-purple-500/10 px-3 py-1 text-sm font-bold text-purple-400">{item.score}/10</span>
    </div>
    <p className="text-sm text-zinc-600 dark:text-zinc-400"><b>Your answer:</b> {item.answer}</p>
    <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 "><b>Feedback:</b> {item.feedback}</p>
    <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm shadow-sm ">
     <div className="mb-2 flex items-center gap-2">
     <FiCheckCircle className="text-emerald-700 dark:text-emerald-400 " />
     <p className="font-black text-emerald-700 dark:text-emerald-300 ">Correct Answer</p>
     </div>
     <p className="leading-7 text-zinc-800 dark:text-zinc-100 ">{item.correctAnswer}</p>
    </div>
    </div>
   ))}
   </div>
  </div>
  </div>
 );
 }

 if (loadingQuestions) {
 return (
  <div className="flex min-h-[70vh] items-center justify-center p-6">
  <div className="rounded-[2rem] border border-purple-500/20 bg-white dark:bg-zinc-950 p-8 text-center shadow-2xl ">
   <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
   <h2 className="text-2xl font-black">Preparing your voice interview...</h2>
   <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 ">Please wait a moment.</p>
  </div>
  </div>
 );
 }

 if (currentQuestion) {
 return (
  <div className="p-4 md:p-8 max-w-7xl mx-auto">
  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
   <section className="relative overflow-hidden rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-white via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-5 md:p-7 shadow-2xl ">
   <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
   <div className="relative">
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300 ">
     <FiZap /> {selectedLevel} level
     </div>
     <h1 className="text-2xl md:text-4xl font-black">{selectedType} Voice Interview</h1>
     <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 ">Speak your answer, then submit it for AI scoring and guidance.</p>
    </div>
    <div className="min-w-[180px] rounded-3xl border border-zinc-200 dark:border-zinc-800/70 bg-zinc-50 dark:bg-black/30 p-4 ">
     <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
     <span>Progress</span>
     <span>{currentIndex + 1}/{questions.length}</span>
     </div>
     <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
     <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${progress}%` }} />
     </div>
    </div>
    </div>

    <div className="mb-6 rounded-[2rem] border border-purple-500/20 bg-purple-50/70 dark:bg-white/[0.04] p-5 md:p-6 shadow-inner ">
    <div className="flex gap-4">
     <button onClick={() => speakText(currentQuestion.question)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
     <FiVolume2 className="text-xl" />
     </button>
     <div>
     <p className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-400">Question {currentIndex + 1}</p>
     <p className="text-xl md:text-2xl font-bold leading-snug text-zinc-950 dark:text-white ">{currentQuestion.question}</p>
     {isSpeaking && <p className="mt-2 text-xs text-purple-700 dark:text-purple-300">AI voice is speaking. It will stop when you start answering.</p>}
     </div>
    </div>
    </div>

    {!latestResult ? (
    <>
     <div className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/20 p-4 ">
     <div className="mb-3 flex items-center justify-between gap-3">
      <label className="block text-sm font-bold">Your Voice Answer</label>
      <div className="flex gap-2">
      <button onClick={isListening ? stopListening : startListening} className={`rounded-2xl px-4 py-2 text-sm font-bold ${isListening ? 'bg-red-500 text-white' : 'bg-purple-600 text-white'}`}>
       {isListening ? <><FiMicOff className="mr-2 inline" />Stop</> : <><FiMic className="mr-2 inline" />Speak</>}
      </button>
      <button onClick={submitAnswer} disabled={submitting || !transcript.trim()} className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60" title="Submit answer">
       {submitting ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiArrowRight className="text-xl" />}
      </button>
      </div>
     </div>
     <textarea
      value={transcript}
      onChange={(event) => setTranscript(event.target.value)}
      className="input-modern min-h-[180px] resize-none"
      placeholder="Your spoken answer will appear here. You can edit it before submitting."
      disabled={submitting}
     />
     <p className="mt-3 text-xs text-zinc-950 dark:text-zinc-500"><FiSend className="mr-1 inline" />Use the arrow button to submit your voice answer for AI evaluation.</p>
     </div>
    </>
    ) : (
    <div className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-950/80 p-5 shadow-xl ">
     <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
     <div>
      <p className={`text-sm font-bold ${latestResult.score >= 6 ? 'text-green-400' : 'text-red-400'}`}>{latestResult.status}</p>
      <h3 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 ">Score: {latestResult.score}/10</h3>
     </div>
     <button onClick={goToNextQuestion} className="btn-primary">
      {currentIndex >= questions.length - 1 ? 'Finish Interview' : 'Next Question'}
     </button>
     </div>
     <div className="mb-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/[0.03] p-4 ">
     <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-600 dark:text-zinc-400 ">Feedback on your answer</p>
     <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 ">{latestResult.feedback}</p>
     </div>

     <div className="rounded-3xl border border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-950/30 p-5 shadow-sm ">
     <div className="mb-3 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 ">
      <FiCheckCircle className="text-emerald-700 dark:text-emerald-300 " />
      </div>
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300 ">Correct Answer</p>
     </div>
     <p className="text-sm leading-7 text-zinc-800 dark:text-zinc-100 ">{latestResult.correctAnswer}</p>
     </div>
    </div>
    )}
   </div>
   </section>

   <aside className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-950/80 p-5 ">
   <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><FiAward className="text-purple-400" /> Live Evaluation</h2>
   <div className="grid gap-3">
    {results.length === 0 ? (
    <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-sm text-zinc-950 dark:text-zinc-500 ">Submit your first voice answer to see marks and feedback.</p>
    ) : results.map((item, index) => (
    <div key={`${item.question}-voice-side-${index}`} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/[0.03] p-4 ">
     <div className="flex items-center justify-between gap-3">
     <p className="line-clamp-1 text-sm font-semibold">Q{index + 1}. {item.question}</p>
     <span className="text-sm font-black text-purple-400">{item.score}/10</span>
     </div>
    </div>
    ))}
   </div>
   </aside>
  </div>
  </div>
 );
 }

 return (
 <div className="p-4 md:p-8 max-w-7xl mx-auto">
  <div className="mb-8">
  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-700 dark:text-purple-300 ">
   <FiMic /> AI Voice Interview
  </div>
  <h1 className="text-3xl md:text-5xl font-black">Choose Voice Interview Topic</h1>
  <p className="mt-2 text-zinc-600 dark:text-zinc-400 ">Every session generates fresh spoken AI questions.</p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {interviewTypes.map((type) => (
   <motion.button
   key={type.id}
   whileHover={{ y: -5, scale: 1.02 }}
   whileTap={{ scale: 0.98 }}
   onClick={() => chooseTopic(type.id)}
   className="group rounded-[2rem] border border-zinc-200 bg-white p-5 text-left text-zinc-950 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/60 hover:bg-purple-50 hover:shadow-2xl dark:border-zinc-800/70 dark:bg-zinc-950/80 dark:text-white dark:hover:bg-purple-950/20"
   >
   <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${type.color} text-white shadow-lg`}>
    <FiMic className="text-2xl" />
   </div>
   <h3 className="text-xl font-black">{type.name}</h3>
   <p className="mt-2 text-sm text-zinc-950 dark:text-zinc-500">Generate new AI voice questions for this topic.</p>
   </motion.button>
  ))}
  </div>

  <AnimatePresence>
  {showLevelModal && (
   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
   <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} className="w-full max-w-3xl rounded-[2rem] border border-purple-500/20 bg-white dark:bg-zinc-950 p-6 shadow-2xl ">
    <h2 className="text-2xl md:text-3xl font-black">Choose your level</h2>
    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 ">AI will generate a fresh easy-to-hard voice interview for your selected level.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-3">
    {levels.map((level) => (
     <button key={level.id} onClick={() => startInterview(level.id)} className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/[0.03] p-5 text-left transition hover:border-purple-500 hover:bg-purple-500/10 ">
     <h3 className="text-xl font-black capitalize">{level.title}</h3>
     <p className="mt-2 text-sm text-zinc-950 dark:text-zinc-500">{level.description}</p>
     </button>
    ))}
    </div>
    <button onClick={() => setShowLevelModal(false)} className="mt-5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white ">Cancel</button>
   </motion.div>
   </motion.div>
  )}
  </AnimatePresence>
 </div>
 );
};

export default VoiceInterviewPage;
