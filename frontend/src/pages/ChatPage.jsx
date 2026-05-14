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
  FiX
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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
      const response = await axios.get('/api/chat');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchChat = async (id) => {
    try {
      const response = await axios.get(`/api/chat/${id}`);
      setCurrentChat(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await axios.post('/api/chat', { title: 'New Conversation' });
      navigate(`/chat/${response.data._id}`);
      fetchChats();
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

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      let chatIdToUse = chatId;
      if (!chatIdToUse) {
        const newChat = await axios.post('/api/chat', { title: userMessage.slice(0, 30) });
        chatIdToUse = newChat.data._id;
        navigate(`/chat/${chatIdToUse}`);
        fetchChats();
      }

      const response = await axios.post('/api/chat/message', {
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
        await axios.delete(`/api/chat/${id}`);
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

  return (
    <div className="flex h-full bg-black">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 glass border-r border-zinc-800 flex flex-col"
          >
            <div className="p-4 border-b border-zinc-800">
              <button
                onClick={createNewChat}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <FiPlus size={20} />
                <span>New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    chatId === chat._id
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                      : 'hover:bg-zinc-800/50'
                  }`}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FiMessageSquare className="text-zinc-400 flex-shrink-0" />
                    <span className="truncate text-sm">{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
              {chats.length === 0 && (
                <div className="text-center text-zinc-500 py-8">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a new chat!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass border-b border-zinc-800 px-6 py-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold">
              {currentChat?.title || 'AI Interview Assistant'}
            </h1>
            <p className="text-xs text-zinc-500">Powered by AI</p>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <FiMessageSquare className="text-white text-4xl" />
              </div>
              <h2 className="text-3xl font-bold mb-2 gradient-text">AI Interview Assistant</h2>
              <p className="text-zinc-400 max-w-md">
                Ask me anything about DSA, system design, JavaScript, React, Node.js, or interview preparation!
              </p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {[
                  "Explain React hooks",
                  "What's closure in JavaScript?",
                  "How to prepare for system design?",
                  "Common Node.js interview questions"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputMessage(suggestion)}
                    className="glass-card px-4 py-2 text-sm hover:bg-zinc-800 transition"
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
                <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'glass border border-zinc-800'
                  }`}>
                    <MessageContent content={message.content} />
                  </div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, index)}
                      className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition flex items-center"
                    >
                      {copiedIndex === index ? (
                        <>
                          <FiCheck size={12} className="mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy size={12} className="mr-1" />
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
              <div className="glass border border-zinc-800 rounded-2xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-800 p-4 glass">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about coding interviews..."
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                  rows="1"
                  style={{ minHeight: '48px', maxHeight: '150px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend size={20} />
              </button>
            </div>
            <p className="text-xs text-zinc-500 text-center mt-3">
              AI may make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;