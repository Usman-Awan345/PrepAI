import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);
  if (isAuthPage) return <Outlet />;

  const contentMargin = isMobile ? '0px' : sidebarOpen ? '256px' : '80px';

  return (
    <div className="min-h-screen bg-black">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className="min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: contentMargin }}
      >
        {isMobile && (
          <div className="sticky top-0 z-30 flex items-center h-14 px-4 bg-zinc-950 border-b border-zinc-800">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <FiMenu size={22} />
            </button>
            <span className="ml-3 text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Interview
            </span>
          </div>
        )}

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;