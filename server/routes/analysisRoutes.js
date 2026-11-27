const router = require('express').Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  roles, createAnalysis, listAnalyses, getAnalysis, deleteAnalysis,
} = require('../controllers/analysisController');

router.get('/roles', roles);
router.use(protect);
router.route('/').get(listAnalyses).post(upload.single('resume'), createAnalysis);
router.route('/:id').get(getAnalysis).delete(deleteAnalysis);

module.exports = router;
