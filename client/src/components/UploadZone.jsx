import { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function UploadZone({ file, onFile }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handle = (f) => {
    if (!f) return;
    const ok = /\.(pdf|docx|txt)$/i.test(f.name);
    if (!ok) return alert('Please upload a PDF, DOCX or TXT file');
    if (f.size > 5 * 1024 * 1024) return alert('File must be under 5 MB');
    onFile(f);
  };

  if (file) {
    return (
      <div className="file-chip">
        <FileText size={22} />
        <div>
          <strong>{file.name}</strong>
          <small>{(file.size / 1024).toFixed(0)} KB</small>
        </div>
        <button type="button" className="icon-btn" onClick={() => onFile(null)} aria-label="Remove file">
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`dropzone ${drag ? 'drag' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files[0]);
      }}
    >
      <UploadCloud size={44} />
      <p><strong>Drag & drop your resume</strong> or click to browse</p>
      <small>PDF, DOCX or TXT · max 5 MB</small>
      <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={(e) => handle(e.target.files[0])} />
    </div>
  );
}
