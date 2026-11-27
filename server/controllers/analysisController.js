const Analysis = require('../models/Analysis');
const extractText = require('../utils/extractText');
const { analyzeResume, ROLES } = require('../utils/analyzer');

exports.roles = (req, res) => res.json(ROLES);

// POST /api/analysis  (multipart: resume file, targetRole, jobDescription)
exports.createAnalysis = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a resume file' });

    const text = await extractText(req.file);
    if (!text || text.trim().length < 50) {
      return res.status(422).json({
        message: 'Could not read text from this file. If it is a scanned image PDF, export a text-based PDF instead.',
      });
    }

    const { targetRole = '', jobDescription = '' } = req.body;
    const result = analyzeResume(text, { targetRole, jobDescription });

    const saved = await Analysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      targetRole,
      jobDescription,
      ...result,
    });

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// GET /api/analysis  – history
exports.listAnalyses = async (req, res, next) => {
  try {
    const items = await Analysis.find({ user: req.user._id })
      .select('fileName targetRole overallScore atsScore jdMatchScore createdAt')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/analysis/:id
exports.getAnalysis = async (req, res, next) => {
  try {
    const item = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Analysis not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/analysis/:id
exports.deleteAnalysis = async (req, res, next) => {
  try {
    const item = await Analysis.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
