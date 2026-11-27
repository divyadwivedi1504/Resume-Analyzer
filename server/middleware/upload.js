const multer = require('multer');

// Keep the file in memory – we only need to extract text, not store the file.
const storage = multer.memoryStorage();

const allowed = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Only PDF, DOCX or TXT files are allowed');
    err.status = 400;
    cb(err);
  },
});

module.exports = upload;
