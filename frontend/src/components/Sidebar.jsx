import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  FiZap,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
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

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  // Mobile: slide in/out from left as overlay
  // Desktop: always visible, collapsible to icon-only
  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-20';
  const mobileClass = isMobile
    ? `fixed z-50 top-0 left-0 h-full w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `fixed z-40 top-0 left-0 h-full transition-all duration-300 ${sidebarWidth}`;

  return (
    <aside className={`${mobileClass} bg-zinc-950 border-r border-zinc-800 flex flex-col`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 h-16 flex-shrink-0">
        {(sidebarOpen || isMobile) ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiZap className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Interview
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto">
            <FiZap className="text-white text-sm" />
          </div>
        )}

        {/* Close button on mobile, collapse button on desktop */}
        {isMobile ? (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <FiX size={20} />
          </button>
        ) : (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            {sidebarOpen ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) => `
              flex items-center px-3 py-2.5 mx-2 mb-1 rounded-xl transition-all duration-200
              ${isActive
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
              }
              ${(!sidebarOpen && !isMobile) ? 'justify-center' : ''}
            `}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${(sidebarOpen || isMobile) ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-zinc-800 flex-shrink-0">
        {(sidebarOpen || isMobile) && user && (
          <div className="mb-2 px-3 py-2 bg-zinc-900 rounded-xl">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
            (!sidebarOpen && !isMobile) ? 'justify-center' : 'justify-start'
          }`}
        >
          <FiLogOut className={`w-5 h-5 flex-shrink-0 ${(sidebarOpen || isMobile) ? 'mr-3' : ''}`} />
          {(sidebarOpen || isMobile) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;