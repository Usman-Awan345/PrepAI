import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiBell, 
  FiMoon, 
  FiSun, 
  FiLock, 
  FiSave,
  FiShield,
  FiGlobe,
  FiMonitor
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    notifications: true,
    language: 'en'
  });

  const updateProfile = async () => {
    setLoading(true);
    try {
      await axios.put('/api/user/profile', {
        name: profileForm.name
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.put('/api/user/password', {
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword
      });
      toast.success('Password updated successfully');
      setProfileForm({
        ...profileForm,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    setLoading(true);
    try {
      await axios.put('/api/user/preferences', preferences);
      localStorage.setItem('theme', preferences.theme);
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'preferences', label: 'Preferences', icon: FiMonitor },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ];

  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Settings</h1>
          <p className="text-zinc-400">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64">
            <div className="glass-card p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="input-modern opacity-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                    </div>
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <FiSave className="mr-2" />}
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input
                        type="password"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                        className="input-modern"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                        className="input-modern"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                        className="input-modern"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={updatePassword}
                      disabled={loading || !profileForm.currentPassword || !profileForm.newPassword}
                      className="btn-primary flex items-center"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <FiShield className="mr-2" />}
                      Update Password
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">App Preferences</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Theme</label>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setPreferences({...preferences, theme: 'light'})}
                          className={`flex-1 p-4 rounded-xl border transition ${
                            preferences.theme === 'light'
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <FiSun className="text-xl mx-auto mb-2" />
                          <span className="text-sm">Light</span>
                        </button>
                        <button
                          onClick={() => setPreferences({...preferences, theme: 'dark'})}
                          className={`flex-1 p-4 rounded-xl border transition ${
                            preferences.theme === 'dark'
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <FiMoon className="text-xl mx-auto mb-2" />
                          <span className="text-sm">Dark</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Language</label>
                      <div className="relative">
                        <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                          className="input-modern pl-10"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={updatePreferences}
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <FiSave className="mr-2" />}
                      Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl">
                      <div>
                        <h3 className="font-semibold">Email Notifications</h3>
                        <p className="text-sm text-zinc-400">Receive interview reminders and tips</p>
                      </div>
                      <button
                        onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})}
                        className={`relative w-12 h-6 rounded-full transition ${
                          preferences.notifications ? 'bg-purple-500' : 'bg-zinc-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                          preferences.notifications ? 'right-1' : 'left-1'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl opacity-50">
                      <div>
                        <h3 className="font-semibold">Push Notifications</h3>
                        <p className="text-sm text-zinc-400">Coming soon</p>
                      </div>
                      <div className="w-12 h-6 bg-zinc-600 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;