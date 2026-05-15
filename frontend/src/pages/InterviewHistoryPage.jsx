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
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiThumbsUp,
  FiTarget,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';

const InterviewHistoryPage = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interview');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 6) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 4) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getScoreBadge = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 7) return 'Very Good';
    if (score >= 6) return 'Good';
    if (score >= 5) return 'Average';
    return 'Needs Improvement';
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return <FiAward className="text-emerald-400" />;
    if (score >= 6) return <FiThumbsUp className="text-yellow-400" />;
    return <FiTarget className="text-orange-400" />;
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter !== 'all' && !interview.type.toLowerCase().includes(filter.toLowerCase())) return false;
    if (searchTerm && !interview.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const interviewTypes = ['all', ...new Set(interviews.map(i => i.type))];

  const stats = {
    total: interviews.length,
    averageScore: interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / (interviews.length || 1),
    completed: interviews.filter(i => i.status === 'completed').length,
    bestScore: Math.max(...interviews.map(i => i.overallScore || 0), 0),
    totalQuestions: interviews.reduce((sum, i) => sum + (i.questions?.length || 0), 0)
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-6 md:mb-8 lg:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  Interview <span className="gradient-text">History</span>
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Track your progress and review past interviews
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 text-sm sm:text-base" />
                  <input
                    type="text"
                    placeholder="Search interviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-purple-500 w-40 sm:w-48 md:w-56"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 glass rounded-xl text-sm hover:bg-zinc-800 transition md:hidden"
                >
                  <FiFilter size={16} />
                  <span>Filter</span>
                  <FiChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8 lg:mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 sm:p-5 rounded-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <FiCalendar className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{stats.total}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Total Interviews</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">Completed sessions</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 sm:p-5 rounded-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <FiTrendingUp className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{stats.averageScore.toFixed(1)}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Average Score</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">Out of 10</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 sm:p-5 rounded-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                  <FiStar className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{stats.bestScore.toFixed(1)}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Best Score</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">Top performance</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-4 sm:p-5 rounded-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <FiAward className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{stats.completed}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">Completed</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">Successfully finished</p>
            </motion.div>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-6 md:mb-8`}>
            <div className="flex flex-wrap gap-2">
              {interviewTypes.map((type, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setFilter(type)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                    filter === type
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'glass hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'All Interviews' : type}
                </motion.button>
              ))}
            </div>
          </div>

          {filteredInterviews.length > 0 && (
            <div className="mb-4 md:mb-6 p-3 sm:p-4 glass rounded-xl border border-purple-500/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FiZap className="text-purple-400 text-lg sm:text-xl" />
                  <span className="text-xs sm:text-sm text-zinc-400">
                    Showing <span className="text-white font-semibold">{filteredInterviews.length}</span> interviews
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-zinc-500">Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-zinc-500">In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 sm:p-6 skeleton h-24 sm:h-28 rounded-xl"></div>
              ))}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 sm:p-12 md:p-16 text-center rounded-2xl"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FiBarChart2 className="text-4xl sm:text-5xl text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">No interviews yet</h3>
              <p className="text-zinc-400 text-sm sm:text-base mb-4 sm:mb-6">Start your first mock interview to see your history</p>
              <a href="/mock-interview" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                Start Interview <FiChevronRight size={18} />
              </a>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {filteredInterviews.map((interview, index) => (
                  <motion.div
                    key={interview._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div 
                      className="p-4 sm:p-5 md:p-6 cursor-pointer"
                      onClick={() => setSelectedInterview(selectedInterview?._id === interview._id ? null : interview)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                              interview.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {interview.status === 'completed' ? '✓ Completed' : '⟳ In Progress'}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-500">
                              <FiClock size={10} className="sm:w-3 sm:h-3" />
                              {format(new Date(interview.startedAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1">{interview.type} Interview</h3>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-400">
                            <span className="flex items-center gap-1">
                              <FiBarChart2 size={12} />
                              {interview.questions?.length || 0} questions
                            </span>
                            <span className="capitalize flex items-center gap-1">
                              <FiZap size={12} />
                              {interview.mode} mode
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                          <div className={`px-3 sm:px-4 py-2 rounded-xl ${getScoreBgColor(interview.overallScore || 0)} border`}>
                            <div className="flex items-center gap-2">
                              {getScoreIcon(interview.overallScore || 0)}
                              <div>
                                <div className="text-xl sm:text-2xl font-bold">{interview.overallScore?.toFixed(1) || 0}<span className="text-xs text-zinc-500">/10</span></div>
                                <div className="text-[10px] sm:text-xs text-zinc-400">{getScoreBadge(interview.overallScore || 0)}</div>
                              </div>
                            </div>
                          </div>
                          <FiChevronRight className={`text-zinc-500 transition-transform duration-300 flex-shrink-0 ${
                            selectedInterview?._id === interview._id ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedInterview?._id === interview._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-zinc-800 bg-zinc-900/30"
                        >
                          <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                            <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                              <FiStar className="text-purple-400" />
                              Detailed Feedback
                            </h4>
                            <div className="space-y-3 sm:space-y-4">
                              {interview.questions?.map((q, idx) => (
                                <motion.div 
                                  key={idx} 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="p-3 sm:p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-all"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                                    <span className="text-xs sm:text-sm text-purple-400 font-medium">Question {idx + 1}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 sm:w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-500 ${
                                            q.score >= 7 ? 'bg-green-500' : q.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${(q.score / 10) * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className={`text-xs sm:text-sm font-bold ${getScoreColor(q.score)}`}>
                                        Score: {q.score}/10
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-white text-sm sm:text-base mb-2 sm:mb-3 leading-relaxed">{q.question}</p>
                                  {q.answer && (
                                    <details className="mt-2">
                                      <summary className="text-xs sm:text-sm text-zinc-400 cursor-pointer hover:text-zinc-300 transition">
                                        📝 View your answer
                                      </summary>
                                      <p className="mt-2 text-zinc-300 text-xs sm:text-sm p-2 sm:p-3 bg-zinc-900/50 rounded-lg">
                                        {q.answer}
                                      </p>
                                    </details>
                                  )}
                                  {q.feedback && (
                                    <div className="mt-3 p-2 sm:p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                      <p className="text-xs sm:text-sm text-zinc-300">
                                        <span className="text-purple-400 font-semibold">💡 Feedback:</span> {q.feedback}
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
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
    </div>
  );
};

export default InterviewHistoryPage;