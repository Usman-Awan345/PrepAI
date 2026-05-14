import mongoose from 'mongoose';

const questionAnswerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Frontend', 'Backend', 'MERN Stack', 'JavaScript', 'React', 'Node.js', 'DSA', 'HR Interview'],
    required: true
  },
  mode: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  questions: [questionAnswerSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

interviewSchema.pre('save', function(next) {
  if (this.questions.length > 0) {
    const totalScore = this.questions.reduce((sum, q) => sum + q.score, 0);
    this.overallScore = totalScore / this.questions.length;
  }
  next();
});

export default mongoose.model('Interview', interviewSchema);