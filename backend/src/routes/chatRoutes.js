import express from 'express';
import {
  getChats,
  getChat,
  createChat,
  sendMessage,
  deleteChat
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getChats)
  .post(createChat);

router.post('/message', sendMessage);
router.route('/:id')
  .get(getChat)
  .delete(deleteChat);

export default router;