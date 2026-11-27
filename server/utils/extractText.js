const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractText(file) {
  const { mimetype, buffer } = file;

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  // text/plain
  return buffer.toString('utf-8');
}

module.exports = extractText;
