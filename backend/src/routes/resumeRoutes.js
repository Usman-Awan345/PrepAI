import express from 'express';
import { uploadResume, analyzeResume, getAnalyses } from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/upload', uploadResume, analyzeResume);
router.get('/analyses', getAnalyses);

export default router;