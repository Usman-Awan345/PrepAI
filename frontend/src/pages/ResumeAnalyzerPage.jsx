import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUpload, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle,
  FiTrendingUp,
  FiXCircle,
  FiZap,
  FiMessageCircle,
  FiDownload
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResumeAnalyzerPage = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [targetRole, setTargetRole] = useState('MERN Stack Developer');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf' && droppedFile.size <= 5 * 1024 * 1024) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a PDF file under 5MB');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf' && selectedFile.size <= 5 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a PDF file under 5MB');
    }
  };

  const uploadResume = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    formData.append('analysisDepth', 'fast');
    formData.append('responseMode', 'summary-first');

    setUploading(true);
    try {
      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 45000
      });
      setAnalysis(response.data.analysis);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      toast.error(error.code === 'ECONNABORTED' ? 'Resume analysis timed out. Please upload a smaller PDF.' : 'Failed to analyze resume');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const safeList = (value) => Array.isArray(value) ? value : [];
  const atsScore = Number(analysis?.atsScore || 0);
  const scoreLabel = atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs Work';
  const priorityFixes = [
    ...safeList(analysis?.weakAreas).slice(0, 2),
    ...safeList(analysis?.grammarIssues).slice(0, 1),
    ...safeList(analysis?.suggestions).slice(0, 2),
  ].filter(Boolean).slice(0, 5);

  if (analysis) {
    return (
      <div className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 gradient-text">Resume Analysis</h1>
              <p className="text-zinc-400">AI-powered insights to improve your resume</p>
            </div>
            <button
              onClick={() => { setAnalysis(null); setFile(null); }}
              className="btn-secondary"
            >
              Analyze Another Resume
            </button>
          </div>

          {/* ATS Score Card */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">ATS Compatibility Score</h2>
              <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
                {atsScore}/100
              </div>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  atsScore >= 80 ? 'bg-green-500' :
                  atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(atsScore, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-zinc-400 mt-3">
              {atsScore >= 80 ? 'Excellent! Your resume is well-optimized.' :
               atsScore >= 60 ? "Good, but there's room for improvement." :
               'Needs significant improvement to pass ATS filters.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-5">
              <p className="text-sm text-zinc-400">Target Role</p>
              <h3 className="text-xl font-bold mt-1">{targetRole}</h3>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-zinc-400">Resume Status</p>
              <h3 className={`text-xl font-bold mt-1 ${getScoreColor(atsScore)}`}>{scoreLabel}</h3>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-zinc-400">Priority Fixes</p>
              <h3 className="text-xl font-bold mt-1">{priorityFixes.length || 0}</h3>
            </div>
          </div>

          {priorityFixes.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Top Priority Fixes</h3>
              <ol className="space-y-2 list-decimal list-inside">
                {priorityFixes.map((fix, idx) => (
                  <li key={idx} className="text-zinc-300">{fix}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Missing Skills */}
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <FiAlertCircle className="text-yellow-400 mr-2" />
                <h3 className="text-lg font-semibold">Missing Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(analysis.missingSkills || []).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <FiTrendingUp className="text-red-400 mr-2" />
                <h3 className="text-lg font-semibold">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2">
                {(analysis.weakAreas || []).map((area, idx) => (
                  <li key={idx} className="text-zinc-300 flex items-start">
                    <FiXCircle className="text-red-400 mr-2 mt-1 flex-shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grammar Issues */}
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <FiAlertCircle className="text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold">Grammar & Style Issues</h3>
              </div>
              <ul className="space-y-2">
                {(analysis.grammarIssues || []).map((issue, idx) => (
                  <li key={idx} className="text-zinc-300 text-sm">{issue}</li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <FiZap className="text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold">Improvement Suggestions</h3>
              </div>
              <ul className="space-y-2">
                {(analysis.suggestions || []).map((suggestion, idx) => (
                  <li key={idx} className="text-zinc-300 flex items-start">
                    <FiCheckCircle className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Projects */}
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <FiFileText className="text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold">Suggested Projects</h3>
              </div>
              <ul className="space-y-2">
                {(analysis.suggestedProjects || []).map((project, idx) => (
                  <li key={idx} className="text-zinc-300">• {project}</li>
                ))}
              </ul>
            </div>

            {/* Interview Questions */}
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <FiMessageCircle className="text-pink-400 mr-2" />
                <h3 className="text-lg font-semibold">Potential Interview Questions</h3>
              </div>
              <ul className="space-y-2">
                {(analysis.interviewQuestions || []).map((question, idx) => (
                  <li key={idx} className="text-zinc-300 text-sm">• {question}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiFileText className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Resume Analyzer
            <span className="gradient-text"> AI-Powered</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Upload your resume (PDF) and get detailed AI analysis including ATS score, missing skills, and improvement suggestions.
          </p>
        </div>

        <div className="glass-card p-5 mb-6">
          <label className="block text-sm font-medium mb-2">Target Job Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="input-modern"
            placeholder="Example: MERN Stack Developer, React Developer"
          />
          <p className="text-xs text-zinc-500 mt-2">Analyzer will score your resume according to this role.</p>
        </div>

        <div
          className={`glass-card p-8 text-center transition-all ${
            dragActive ? 'border-2 border-purple-500' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <FiUpload className="text-purple-500 text-4xl" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            {file ? file.name : 'Drag & drop your resume here'}
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            Supports PDF files only (Max 5MB)
          </p>
          
          {!file && (
            <label className="btn-primary cursor-pointer inline-block">
              Browse Files
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
          
          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <FiCheckCircle />
                <span>File selected: {file.name}</span>
              </div>
              <div className="flex justify-center space-x-4">
                <button onClick={() => setFile(null)} className="btn-secondary">
                  Change File
                </button>
                <button
                  onClick={uploadResume}
                  disabled={uploading}
                  className="btn-primary flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Resume'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FiTrendingUp className="text-white" />
            </div>
            <h3 className="font-semibold mb-1">ATS Score</h3>
            <p className="text-sm text-zinc-400">Get a compatibility score for applicant tracking systems</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FiAlertCircle className="text-white" />
            </div>
            <h3 className="font-semibold mb-1">Skill Gap Analysis</h3>
            <p className="text-sm text-zinc-400">Identify missing skills for your target role</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FiZap className="text-white" />
            </div>
            <h3 className="font-semibold mb-1">Actionable Insights</h3>
            <p className="text-sm text-zinc-400">Get specific suggestions to improve your resume</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeAnalyzerPage;