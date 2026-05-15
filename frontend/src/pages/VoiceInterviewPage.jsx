import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMic, 
  FiMicOff, 
  FiVolume2, 
  FiVolumeX,
  FiSend,
  FiCheckCircle,
  FiLoader,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const VoiceInterviewPage = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  const interviewTypes = [
    { id: 'Frontend', name: 'Frontend', color: 'from-blue-500 to-cyan-500' },
    { id: 'Backend', name: 'Backend', color: 'from-green-500 to-emerald-500' },
    { id: 'MERN Stack', name: 'MERN Stack', color: 'from-purple-500 to-pink-500' },
    { id: 'JavaScript', name: 'JavaScript', color: 'from-yellow-500 to-orange-500' },
    { id: 'React', name: 'React', color: 'from-cyan-500 to-blue-500' },
    { id: 'Node.js', name: 'Node.js', color: 'from-green-500 to-teal-500' },
    { id: 'DSA', name: 'DSA', color: 'from-red-500 to-pink-500' },
    { id: 'HR Interview', name: 'HR Interview', color: 'from-indigo-500 to-purple-500' }
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserResponse(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Microphone error. Please check permissions.');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await api.post('/interview/start', {
        type: selectedType,
        mode: 'voice'
      });
      setInterview(response.data.interview);
      setCurrentQuestion(response.data.currentQuestion);
      setConversation([{ role: 'assistant', content: response.data.currentQuestion }]);
      speakText(response.data.currentQuestion);
      toast.success('Voice interview started! Speak your answers.');
    } catch (error) {
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... Speak your answer');
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserResponse = async (userAnswer) => {
    if (!userAnswer.trim() || !interview) return;
    
    stopListening();
    
    setConversation(prev => [...prev, { role: 'user', content: userAnswer }]);
    setLoading(true);
    
    try {
      const response = await api.post('/interview/answer', {
        interviewId: interview._id,
        answer: userAnswer
      });
      
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.feedback,
        feedback: true 
      }]);
      
      if (response.data.isComplete) {
        setCompleted(true);
        toast.success('Interview completed!');
        speakText('Thank you for completing the interview. You can view your results now.');
      } else {
        const nextQuestionText = response.data.nextQuestion;
        setCurrentQuestion(nextQuestionText);
        setTimeout(() => {
          setConversation(prev => [...prev, { role: 'assistant', content: nextQuestionText }]);
          speakText(nextQuestionText);
        }, 1000);
      }
    } catch (error) {
      toast.error('Failed to process answer');
    } finally {
      setLoading(false);
    }
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (completed && interview) {
    const totalScore = interview.questions.reduce((sum, q) => sum + q.score, 0) / interview.questions.length;
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-white text-5xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Voice Interview Complete!</h1>
          <p className="text-zinc-400 mb-8">Great job completing your voice interview</p>
          
          <div className="glass-card p-6 mb-6">
            <div className="text-5xl font-bold gradient-text mb-2">{totalScore.toFixed(1)}/10</div>
            <p className="text-zinc-400">Overall Score</p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Start New Interview
            </button>
            <button onClick={() => window.location.href = '/interview-history'} className="btn-primary">
              View History
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentQuestion && interview) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Voice Interview</h1>
              <p className="text-zinc-400">Question {interview.questions.length}/5</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMicrophone}
                className={`p-4 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'glass hover:bg-zinc-800'
                }`}
              >
                {isListening ? <FiMic size={24} /> : <FiMicOff size={24} />}
              </button>
              <button
                onClick={() => speakText(currentQuestion)}
                className="p-4 glass rounded-full hover:bg-zinc-800 transition"
              >
                {isSpeaking ? <FiVolume2 size={24} className="animate-pulse" /> : <FiVolumeX size={24} />}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FiZap className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-400 mb-2">AI Interviewer</p>
                <p className="text-lg leading-relaxed">{currentQuestion}</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="glass-card p-6 text-center mb-6"
              >
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                      <FiMic className="text-red-500 text-3xl" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-red-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>
                <p className="text-zinc-400">Listening...</p>
                {transcript && (
                  <p className="mt-4 text-white">{transcript}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div className="glass-card p-6 text-center">
              <FiLoader className="animate-spin text-purple-500 text-3xl mx-auto mb-3" />
              <p className="text-zinc-400">Processing your answer...</p>
            </div>
          )}

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Conversation History</h3>
            {conversation.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 ml-8'
                    : msg.feedback
                    ? 'glass border-l-4 border-green-500'
                    : 'glass mr-8'
                }`}
              >
                <p className="text-sm text-zinc-400 mb-1">
                  {msg.role === 'user' ? 'You' : msg.feedback ? 'Feedback' : 'AI Interviewer'}
                </p>
                <p className="text-white">{msg.content}</p>
              </motion.div>
            ))}
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
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiMic className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Voice Interview
          <span className="gradient-text"> Practice</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Practice speaking answers naturally. Our AI will listen, respond, and provide feedback.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {interviewTypes.map((type, index) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-4 text-center transition-all ${
              selectedType === type.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className={`w-10 h-10 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <FiMic className="text-white" />
            </div>
            <span className="text-sm font-medium">{type.name}</span>
          </motion.button>
        ))}
      </div>

      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={startInterview}
            disabled={loading}
            className="btn-primary px-8 py-4 text-lg flex items-center mx-auto"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Starting...
              </>
            ) : (
              <>
                <FiMic className="mr-2" />
                Start Voice Interview
              </>
            )}
          </button>
          <p className="text-xs text-zinc-500 mt-4">
            Make sure to allow microphone access when prompted
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceInterviewPage;