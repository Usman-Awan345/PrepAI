import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCode, 
  FiServer, 
  FiBox, 
  FiHexagon, 
  FiCpu,
  FiMessageCircle,
  FiSend,
  FiCheckCircle,
  FiAward,
  FiTrendingUp,
  FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const MockInterviewPage = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);

  const interviewTypes = [
    { id: 'Frontend', name: 'Frontend', icon: FiCode, color: 'from-blue-500 to-cyan-500', description: 'React, Vue, Angular, HTML, CSS, JavaScript' },
    { id: 'Backend', name: 'Backend', icon: FiServer, color: 'from-green-500 to-emerald-500', description: 'Node.js, Python, Databases, APIs, Architecture' },
    { id: 'MERN Stack', name: 'MERN Stack', icon: FiBox, color: 'from-purple-500 to-pink-500', description: 'MongoDB, Express, React, Node.js' },
    { id: 'JavaScript', name: 'JavaScript', icon: FiHexagon, color: 'from-yellow-500 to-orange-500', description: 'Core JS, ES6+, Async, Closures, Prototypes' },
    { id: 'React', name: 'React', icon: FiCpu, color: 'from-cyan-500 to-blue-500', description: 'Hooks, State, Context, Performance, Testing' },
    { id: 'Node.js', name: 'Node.js', icon: FiServer, color: 'from-green-500 to-teal-500', description: 'Express, APIs, Middleware, Security' },
    { id: 'DSA', name: 'DSA', icon: FiTrendingUp, color: 'from-red-500 to-pink-500', description: 'Arrays, Trees, Graphs, DP, Algorithms' },
    { id: 'HR Interview', name: 'HR Interview', icon: FiMessageCircle, color: 'from-indigo-500 to-purple-500', description: 'Behavioral, Leadership, Cultural Fit' }
  ];

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/interview/start', {
        type: selectedType,
        mode: 'text'
      });
      setInterview(response.data.interview);
      setCurrentQuestion(response.data.currentQuestion);
      toast.success('Interview started! Answer the first question.');
    } catch (error) {
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/interview/answer', {
        interviewId: interview._id,
        answer: answer
      });
      
      setFeedback({
        score: response.data.score,
        feedback: response.data.feedback
      });
      
      if (response.data.isComplete) {
        setCompleted(true);
        toast.success('Interview completed! Check your results.');
      } else {
        setCurrentQuestion(response.data.nextQuestion);
        setAnswer('');
        toast.success(`Question ${response.data.questionNumber}/5 - Ready for next question`);
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const resetInterview = () => {
    setSelectedType(null);
    setInterview(null);
    setCurrentQuestion(null);
    setAnswer('');
    setFeedback(null);
    setCompleted(false);
  };

  if (completed && interview) {
    const totalScore = interview.questions.reduce((sum, q) => sum + q.score, 0) / interview.questions.length;
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-white text-5xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-zinc-400">Great job completing your {selectedType} interview</p>
        </motion.div>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold gradient-text">Your Results</h2>
            <div className="text-4xl font-bold">{totalScore.toFixed(1)}/10</div>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${totalScore * 10}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
          {interview.questions.map((q, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-purple-400">Question {idx + 1}</span>
                <span className={`font-bold ${q.score >= 7 ? 'text-green-400' : q.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  Score: {q.score}/10
                </span>
              </div>
              <p className="text-white mb-3">{q.question}</p>
              <p className="text-zinc-400 text-sm mb-2">Your answer: {q.answer}</p>
              {q.feedback && (
                <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-sm text-zinc-300">{q.feedback}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button onClick={resetInterview} className="btn-secondary">
            Start New Interview
          </button>
          <button onClick={() => window.location.href = '/interview-history'} className="btn-primary">
            View History
          </button>
        </div>
      </div>
    );
  }

  if (currentQuestion && interview) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">{selectedType} Interview</h1>
              <p className="text-zinc-400">Question {interview.questions.length}/5</p>
            </div>
            {feedback && (
              <div className="glass-card px-4 py-2">
                <span className="text-green-400">Previous score: {feedback.score}/10</span>
              </div>
            )}
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FiMessageCircle className="text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-400 mb-2">Interviewer</p>
                <p className="text-lg leading-relaxed">{currentQuestion}</p>
              </div>
            </div>
          </div>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 mb-6 border-l-4 border-green-500"
            >
              <h3 className="font-semibold mb-2">Feedback on your answer:</h3>
              <p className="text-zinc-300">{feedback.feedback}</p>
            </motion.div>
          )}

          <div className="glass-card p-6">
            <label className="block text-sm font-medium mb-3">Your Answer:</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 min-h-[200px]"
              placeholder="Type your answer here..."
              disabled={submitting}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={submitAnswer}
                disabled={submitting || !answer.trim()}
                className="btn-primary flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Mock Interview
          <span className="gradient-text"> Practice</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Choose your interview type and practice with our AI interviewer. Get real-time feedback and improve your skills.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviewTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedType === type.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-4`}>
              <type.icon className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
            <p className="text-sm text-zinc-400">{type.description}</p>
          </motion.div>
        ))}
      </div>

      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={startInterview}
            disabled={loading}
            className="btn-primary px-8 py-4 text-lg flex items-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Starting Interview...
              </>
            ) : (
              <>
                Start {selectedType} Interview
                <FiRefreshCw className="ml-2" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MockInterviewPage;