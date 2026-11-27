import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Wand2 } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import api, { errMsg } from '../api';

const steps = ['Reading your resume…', 'Extracting skills…', 'Checking ATS rules…', 'Scoring & building tips…'];

export default function Analyze() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    api.get('/analysis/roles').then((r) => setRoles(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 900);
    return () => clearInterval(t);
  }, [loading]);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload your resume first');
    const fd = new FormData();
    fd.append('resume', file);
    fd.append('targetRole', targetRole);
    fd.append('jobDescription', jd);
    setLoading(true);
    try {
      const { data } = await api.post('/analysis', fd);
      navigate(`/result/${data._id}`);
    } catch (err) {
      toast.error(errMsg(err));
      setLoading(false);
    }
  };

  return (
    <motion.form className="analyze glass" onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2>Analyze your resume</h2>
      <p className="muted">Upload your file. Add a target role or paste a job description for a sharper match score.</p>

      <UploadZone file={file} onFile={setFile} />

      <div className="grid-2">
        <label>Target role (optional)
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            <option value="">— Select a role —</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
      </div>

      <label>Job description (optional)
        <textarea rows={7} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here to see matched and missing keywords…" />
      </label>

      <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
        {loading ? <><Loader2 className="spin" size={18} /> {steps[step]}</> : <><Wand2 size={18} /> Analyze now</>}
      </button>
    </motion.form>
  );
}
