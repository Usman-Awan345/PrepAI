import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  analysis: {
    atsScore: {
      type: Number,
      min: 0,
      max: 100
    },
    missingSkills: [String],
    weakAreas: [String],
    grammarIssues: [String],
    suggestions: [String],
    suggestedProjects: [String],
    interviewQuestions: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);