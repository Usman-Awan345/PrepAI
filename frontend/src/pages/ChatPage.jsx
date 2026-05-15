import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiPlus, 
  FiMessageSquare, 
  FiTrash2, 
  FiCopy,
  FiCheck,
  FiMenu,
  FiX,
  FiChevronLeft
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
    } else {
      setCurrentChat(null);
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchChat = async (id) => {
    try {
      const response = await api.get(`/chat/${id}`);
      setCurrentChat(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await api.post('/chat', { title: 'New Conversation' });
      navigate(`/chat/${response.data._id}`);
      fetchChats();
      if (isMobile) setSidebarOpen(false);
    } catch (error) {
      toast.error('Failed to create new chat');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      let chatIdToUse = chatId;
      if (!chatIdToUse) {
        const newChat = await api.post('/chat', { title: userMessage.slice(0, 30) });
        chatIdToUse = newChat.data._id;
        navigate(`/chat/${chatIdToUse}`);
        fetchChats();
      }

      const response = await api.post('/chat/message', {
        chatId: chatIdToUse,
        message: userMessage
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      setCurrentChat(response.data.chat);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/chat/${id}`);
        fetchChats();
        if (chatId === id) {
          navigate('/chat');
        }
        toast.success('Chat deleted');
      } catch (error) {
        toast.error('Failed to delete chat');
      }
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MessageContent = ({ content }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const ChatSidebar = () => (
    <div className="h-full glass border-r border-zinc-800 flex flex-col">
      <div className="p-3 md:p-4 border-b border-zinc-800">
        <button
          onClick={createNewChat}
          className="w-full btn-primary flex items-center justify-center space-x-2 text-sm md:text-base py-2 md:py-3"
        >
          <FiPlus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`group flex items-center justify-between p-2 md:p-3 rounded-xl cursor-pointer transition-all ${
              chatId === chat._id
                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                : 'hover:bg-zinc-800/50'
            }`}
            onClick={() => {
              navigate(`/chat/${chat._id}`);
              if (isMobile) setSidebarOpen(false);
            }}
          >
            <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
              <FiMessageSquare className="text-zinc-400 flex-shrink-0 text-sm md:text-base" />
              <span className="truncate text-xs md:text-sm">{chat.title}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat._id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
        {chats.length === 0 && (
          <div className="text-center text-zinc-500 py-8">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-2">Start a new chat!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {!isMobile && sidebarOpen && (
        <div className="w-72 flex-shrink-0 transition-all duration-300">
          <ChatSidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="glass border-b border-zinc-800 px-3 md:px-6 py-3 md:py-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 md:p-2 hover:bg-zinc-800 rounded-lg transition mr-2"
            aria-label="Toggle Sidebar"
          >
            <FiMenu size={20} className="md:w-5 md:h-5 text-white" />
          </button>
          
          {isMobile && chatId && (
            <button
              onClick={() => navigate('/chat')}
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition mr-2"
            >
              <FiChevronLeft size={18} />
            </button>
          )}
          
          <div className="flex-1 text-center">
            <h1 className="text-sm md:text-lg font-semibold truncate px-2">
              {currentChat?.title || 'AI Interview Assistant'}
            </h1>
            <p className="text-[10px] md:text-xs text-zinc-500">Powered by AI</p>
          </div>
          
          <div className="w-8 md:w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                <FiMessageSquare className="text-white text-3xl md:text-4xl" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold mb-2 gradient-text">AI Interview Assistant</h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-md">
                Ask me anything about DSA, system design, JavaScript, React, Node.js, or interview preparation!
              </p>
              <div className="grid grid-cols-2 gap-2 md:gap-3 mt-6 md:mt-8 w-full max-w-md">
                {[
                  "Explain React hooks",
                  "What's closure in JavaScript?",
                  "How to prepare for system design?",
                  "Common Node.js interview questions"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputMessage(suggestion)}
                    className="glass-card px-2 md:px-4 py-2 text-xs md:text-sm hover:bg-zinc-800 transition truncate"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl p-3 md:p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'glass border border-zinc-800'
                  }`}>
                    <div className="text-sm md:text-base prose prose-invert max-w-none">
                      <MessageContent content={message.content} />
                    </div>
                  </div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, index)}
                      className="mt-1 md:mt-2 text-[10px] md:text-xs text-zinc-500 hover:text-zinc-300 transition flex items-center"
                    >
                      {copiedIndex === index ? (
                        <>
                          <FiCheck size={10} className="mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy size={10} className="mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass border border-zinc-800 rounded-2xl p-3 md:p-4">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-zinc-800 p-3 md:p-4 glass">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-2 md:space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about coding interviews..."
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none text-sm md:text-base"
                  rows="1"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="btn-primary p-2 md:p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend size={16} className="md:w-5 md:h-5" />
              </button>
            </div>
            <p className="text-[10px] md:text-xs text-zinc-500 text-center mt-2 md:mt-3">
              AI may make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-72 z-50"
            >
              <ChatSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;