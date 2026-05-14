import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiMessageSquare, 
  FiMic, 
  FiFileText, 
  FiCalendar, 
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/chat', icon: FiMessageSquare, label: 'AI Chat' },
    { path: '/mock-interview', icon: FiZap, label: 'Mock Interview' },
    { path: '/voice-interview', icon: FiMic, label: 'Voice Interview' },
    { path: '/resume-analyzer', icon: FiFileText, label: 'Resume Analyzer' },
    { path: '/interview-history', icon: FiCalendar, label: 'Interview History' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside 
      className={`fixed left-0 top-0 h-full glass border-r border-zinc-800 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FiZap className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AI Interview</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto">
              <FiZap className="text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-zinc-800">
          {sidebarOpen && user && (
            <div className="mb-3 px-3 py-2 glass rounded-xl">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <FiLogOut className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 glass rounded-full border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-all"
        >
          {sidebarOpen ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;