import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiMic, 
  FiFileText, 
  FiZap,
  FiTrendingUp,
  FiCalendar,
  FiAward,
  FiActivity,
  FiBarChart2,
  FiClock,
  FiStar,
  FiArrowRight,
  FiThumbsUp
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    totalChats: 0,
    recentInterviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [interviewsRes, chatsRes] = await Promise.all([
        api.get('/interview'),
        api.get('/chat')
      ]);
      
      const interviews = interviewsRes.data;
      const chats = chatsRes.data;
      
      const totalScore = interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0);
      const avgScore = interviews.length > 0 ? totalScore / interviews.length : 0;
      
      setStats({
        totalInterviews: interviews.length,
        averageScore: avgScore,
        totalChats: chats.length,
        recentInterviews: interviews.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = [
    { name: 'Week 1', score: 65, interviews: 2 },
    { name: 'Week 2', score: 72, interviews: 3 },
    { name: 'Week 3', score: 78, interviews: 4 },
    { name: 'Week 4', score: 85, interviews: 5 },
  ];

  const interviewDistribution = [
    { name: 'Technical', value: 60, color: '#8b5cf6' },
    { name: 'DSA', value: 25, color: '#ec4899' },
    { name: 'HR', value: 15, color: '#06b6d4' },
  ];

  const quickActions = [
    { icon: FiZap, label: 'Mock Interview', path: '/mock-interview', color: 'from-purple-500 to-pink-500', description: 'Practice with AI' },
    { icon: FiMic, label: 'Voice Interview', path: '/voice-interview', color: 'from-blue-500 to-cyan-500', description: 'Speak naturally' },
    { icon: FiMessageSquare, label: 'AI Chat', path: '/chat', color: 'from-green-500 to-emerald-500', description: 'Ask anything' },
    { icon: FiFileText, label: 'Resume Analysis', path: '/resume-analyzer', color: 'from-orange-500 to-red-500', description: 'Get insights' },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    }),
    hover: { 
      scale: 1.02, 
      transition: { duration: 0.2 },
      boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)"
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.4, type: "spring" }
    })
  };

  return (
    <div className="py-8 md:pb-0 px-5">
      <div className="relative mb-8 md:mb-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-card p-6 md:p-8 rounded-2xl border border-purple-500/30"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0]}!
                </span>
              </h1>
              <p className="text-zinc-400 text-sm md:text-base">
                Your interview preparation journey is going great. Keep up the momentum!
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-purple-500/10 rounded-full px-4 py-2 border border-purple-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-zinc-300">Ready for practice</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8 md:mb-10">
        <motion.div
          custom={0}
          variants={statCardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative glass-card p-6 rounded-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <FiCalendar className="text-white text-xl" />
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold gradient-text">{stats.totalInterviews}</span>
                <span className="text-sm text-zinc-500 ml-1">total</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Total Interviews</h3>
            <p className="text-xs text-zinc-500">Completed mock interviews</p>
            <div className="mt-3 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={statCardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative glass-card p-6 rounded-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FiAward className="text-white text-xl" />
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold gradient-text">{stats.averageScore.toFixed(1)}</span>
                <span className="text-sm text-zinc-500 ml-1">/10</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Average Score</h3>
            <p className="text-xs text-zinc-500">Performance rating</p>
            <div className="mt-3 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`w-3 h-3 ${i < Math.round(stats.averageScore / 2) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={2}
          variants={statCardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative glass-card p-6 rounded-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <FiMessageSquare className="text-white text-xl" />
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold gradient-text">{stats.totalChats}</span>
                <span className="text-sm text-zinc-500 ml-1">chats</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Total Conversations</h3>
            <p className="text-xs text-zinc-500">AI learning sessions</p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-zinc-900"></div>
                <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-zinc-900"></div>
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-zinc-900"></div>
              </div>
              <span className="text-xs text-zinc-500">+{stats.totalChats} interactions</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card p-6 rounded-2xl hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-white text-sm" />
                </div>
                Performance Trend
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Last 4 weeks progress</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-zinc-400">+20% improvement</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#8b5cf6', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-xs text-zinc-500">
            <span>⬤ 65% starting score</span>
            <span>⭐ 85% current score</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-6 rounded-2xl hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <FiActivity className="text-white text-sm" />
                </div>
                Interview Distribution
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Focus areas breakdown</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-zinc-400">60% Technical focus</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interviewDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {interviewDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#1f1f1f" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {interviewDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-zinc-400">{item.name}</span>
                <span className="text-xs text-white font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-8 md:mb-10"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <FiZap className="text-purple-500" />
              Quick Actions
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Start your practice instantly</p>
          </div>
          <a href="/mock-interview" className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
          {quickActions.map((action, index) => (
            <motion.a
              key={index}
              href={action.path}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative glass-card p-5 text-center rounded-2xl transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg transition-transform group-hover:scale-110`}>
                  <action.icon className="text-white text-2xl" />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1">{action.label}</h3>
                <p className="text-xs text-zinc-500">{action.description}</p>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-purple-400 flex items-center justify-center gap-1">
                    Start now <FiArrowRight size={10} />
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <FiClock className="text-purple-500" />
              Recent Interviews
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Your latest practice sessions</p>
          </div>
          <a href="/interview-history" className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1">
            View history <FiArrowRight size={14} />
          </a>
        </div>
        
        <div className="space-y-3">
          {stats.recentInterviews.length > 0 ? (
            stats.recentInterviews.map((interview, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.01, x: 5 }}
                className="glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                      <FiCalendar className="text-purple-400 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{interview.type} Interview</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <FiClock size={10} />
                          {new Date(interview.startedAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          interview.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold gradient-text">
                          {interview.overallScore?.toFixed(1) || 0}
                        </span>
                        <span className="text-xs text-zinc-500">/10</span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`w-3 h-3 ${i < (interview.overallScore || 0) / 2 ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`} />
                        ))}
                      </div>
                    </div>
                    <FiArrowRight className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 text-center rounded-2xl"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBarChart2 className="text-purple-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
              <p className="text-zinc-400 text-sm mb-6">Start your first mock interview to begin your journey</p>
              <a href="/mock-interview" className="btn-primary inline-flex items-center gap-2">
                Start Interview <FiArrowRight />
              </a>
            </motion.div>
          )}
        </div>

        {stats.recentInterviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl border border-purple-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <FiThumbsUp className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Pro Tip</h4>
                <p className="text-xs text-zinc-400">Practice consistently! Your score improved by 20% over the last 4 weeks.</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;