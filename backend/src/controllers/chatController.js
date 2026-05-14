import Chat from '../models/Chat.js';
import aiService from '../services/aiService.js';

const CHAT_SYSTEM_PROMPT = `You are an expert AI coding mentor helping students prepare for software engineering interviews.

You help with:
- DSA (Data Structures and Algorithms)
- JavaScript and its frameworks
- React and frontend technologies
- Node.js and backend development
- MERN stack development
- System design principles
- HR interview preparation
- Resume building guidance

Always explain concepts clearly with examples, use code snippets when helpful, and maintain a supportive, encouraging tone.
Keep responses concise but comprehensive.`;

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort('-updatedAt')
      .select('title createdAt updatedAt');
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      userId: req.user.id,
      title: req.body.title || 'New Conversation',
      messages: []
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    
    let chat = await Chat.findOne({
      _id: chatId,
      userId: req.user.id
    });
    
    if (!chat) {
      chat = await Chat.create({
        userId: req.user.id,
        title: message.slice(0, 30) + '...',
        messages: []
      });
    }
    
    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    });
    
    // Get AI response
    const aiResponse = await aiService.generateResponse(message, CHAT_SYSTEM_PROMPT);
    
    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse
    });
    
    await chat.save();
    
    res.json({
      chat,
      response: aiResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};