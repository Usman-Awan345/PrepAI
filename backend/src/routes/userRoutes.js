import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.put('/preferences', async (req, res) => {
  try {
    const { theme, notifications } = req.body;
    const user = await User.findById(req.user.id);
    user.preferences = { theme, notifications };
    await user.save();
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    res.json(req.user.stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;