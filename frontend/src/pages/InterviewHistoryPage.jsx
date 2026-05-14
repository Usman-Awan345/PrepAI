import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiTrendingUp, 
  FiChevronRight,
  FiStar,
  FiClock,
  FiBarChart2,
  FiAward,
  FiSearch
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const InterviewHistoryPage = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get('/api/interview');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    return interview.type.toLowerCase().includes(filter.toLowerCase());
  });

  const interviewTypes = ['all', ...new Set(interviews.map(i => i.type))];

  const stats = {
    total: interviews.length,
    averageScore: interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / (interviews.length || 1),
    completed: interviews.filter(i => i.status === 'completed').length,
    bestScore: Math.max(...interviews.map(i => i.overallScore || 0), 0)
  };

  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Interview History</h1>
          <p className="text-zinc-400">Track your progress and review past interviews</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <FiCalendar className="text-purple-400 text-xl" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-zinc-400">Total Interviews</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="text-blue-400 text-xl" />
              <span className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</span>
            </div>
            <p className="text-sm text-zinc-400">Avg Score/10</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <FiStar className="text-yellow-400 text-xl" />
              <span className="text-2xl font-bold">{stats.bestScore.toFixed(1)}</span>
            </div>
            <p className="text-sm text-zinc-400">Best Score</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <FiAward className="text-green-400 text-xl" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-sm text-zinc-400">Completed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {interviewTypes.map((type, idx) => (
            <button
              key={idx}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === type
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'glass hover:bg-zinc-800'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>

        {/* Interviews List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 skeleton h-24"></div>
            ))}
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FiBarChart2 className="text-6xl text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
            <p className="text-zinc-400 mb-4">Start your first mock interview to see your history</p>
            <a href="/mock-interview" className="btn-primary inline-block">
              Start Interview
            </a>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {filteredInterviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6 cursor-pointer hover:scale-[1.02] transition-all"
                  onClick={() => setSelectedInterview(selectedInterview?._id === interview._id ? null : interview)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          interview.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {interview.status}
                        </span>
                        <span className="text-sm text-zinc-400">
                          <FiClock className="inline mr-1" size={12} />
                          {format(new Date(interview.startedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{interview.type} Interview</h3>
                      <p className="text-sm text-zinc-400">
                        {interview.questions?.length || 0} questions • {interview.mode} mode
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(interview.overallScore || 0)}`}>
                        {interview.overallScore?.toFixed(1) || 0}/10
                      </div>
                      <p className="text-sm text-zinc-400">{getScoreBadge(interview.overallScore || 0)}</p>
                    </div>
                    <FiChevronRight className={`text-zinc-400 transition-transform ${
                      selectedInterview?._id === interview._id ? 'rotate-90' : ''
                    }`} />
                  </div>

                  <AnimatePresence>
                    {selectedInterview?._id === interview._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-zinc-800 space-y-4"
                      >
                        <h4 className="font-semibold mb-3">Interview Details</h4>
                        {interview.questions?.map((q, idx) => (
                          <div key={idx} className="p-4 bg-zinc-900/50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-purple-400">Question {idx + 1}</span>
                              <span className={`text-sm font-bold ${getScoreColor(q.score)}`}>
                                Score: {q.score}/10
                              </span>
                            </div>
                            <p className="text-white mb-2">{q.question}</p>
                            {q.answer && (
                              <details className="mt-2">
                                <summary className="text-sm text-zinc-400 cursor-pointer">View your answer</summary>
                                <p className="mt-2 text-zinc-300 text-sm">{q.answer}</p>
                              </details>
                            )}
                            {q.feedback && (
                              <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-sm text-zinc-300">{q.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default InterviewHistoryPage;