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
  FiActivity
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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
        axios.get('/api/interview'),
        axios.get('/api/chat')
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
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 85 },
  ];

  const interviewDistribution = [
    { name: 'Technical', value: 60, color: '#8b5cf6' },
    { name: 'DSA', value: 25, color: '#ec4899' },
    { name: 'HR', value: 15, color: '#06b6d4' },
  ];

  const quickActions = [
    { icon: FiZap, label: 'Mock Interview', path: '/mock-interview', color: 'from-purple-500 to-pink-500' },
    { icon: FiMic, label: 'Voice Interview', path: '/voice-interview', color: 'from-blue-500 to-cyan-500' },
    { icon: FiMessageSquare, label: 'AI Chat', path: '/chat', color: 'from-green-500 to-emerald-500' },
    { icon: FiFileText, label: 'Resume Analysis', path: '/resume-analyzer', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
        </h1>
        <p className="text-zinc-400">Ready to ace your next interview? Let's continue your preparation journey.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FiCalendar className="text-white text-xl" />
            </div>
            <span className="text-3xl font-bold gradient-text">{stats.totalInterviews}</span>
          </div>
          <h3 className="text-sm font-medium text-zinc-400">Total Interviews</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FiAward className="text-white text-xl" />
            </div>
            <span className="text-3xl font-bold gradient-text">{stats.averageScore.toFixed(1)}/10</span>
          </div>
          <h3 className="text-sm font-medium text-zinc-400">Average Score</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FiMessageSquare className="text-white text-xl" />
            </div>
            <span className="text-3xl font-bold gradient-text">{stats.totalChats}</span>
          </div>
          <h3 className="text-sm font-medium text-zinc-400">Total Conversations</h3>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-purple-400" />
            Performance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiActivity className="mr-2 text-purple-400" />
            Interview Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={interviewDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {interviewDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {interviewDistribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-zinc-400">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.path}
              className="glass-card p-4 text-center hover:scale-105 transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                <action.icon className="text-white text-xl" />
              </div>
              <h3 className="font-semibold">{action.label}</h3>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Recent Interviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-2xl font-bold mb-4">Recent Interviews</h2>
        <div className="space-y-3">
          {stats.recentInterviews.length > 0 ? (
            stats.recentInterviews.map((interview, index) => (
              <div key={index} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{interview.type} Interview</h3>
                  <p className="text-sm text-zinc-400">
                    {new Date(interview.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold gradient-text">
                    {interview.overallScore?.toFixed(1) || 0}/10
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    interview.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {interview.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-zinc-400">No interviews yet. Start your first interview to see it here!</p>
              <a href="/mock-interview" className="btn-primary inline-block mt-4">Start Interview</a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;