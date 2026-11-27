const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: String,
    targetRole: String,
    jobDescription: String,
    wordCount: Number,
    overallScore: Number,
    atsScore: Number,
    scores: {
      contact: Number,
      sections: Number,
      skills: Number,
      impact: Number,
      readability: Number,
    },
    contact: {
      email: String,
      phone: String,
      linkedin: String,
      github: String,
    },
    sectionsFound: [String],
    sectionsMissing: [String],
    skills: [{ name: String, category: String }],
    skillsByCategory: mongoose.Schema.Types.Mixed,
    matchedKeywords: [String],
    missingKeywords: [String],
    jdMatchScore: Number,
    actionVerbCount: Number,
    quantifiedCount: Number,
    weakPhrases: [String],
    suggestions: [{ type: { type: String }, text: String }],
    roleFit: [{ role: String, score: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);
