import express from 'express';
import {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterview
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/start', startInterview);
router.post('/answer', submitAnswer);
router.get('/', getInterviews);
router.get('/:id', getInterview);

export default router;