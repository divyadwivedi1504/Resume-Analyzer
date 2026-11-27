import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, FileText, Plus } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { scoreColor } from '../components/ScoreRing';

export default function Dashboard() {
  const [items, setItems] = useState(null);

  const load = () => api.get('/analysis').then((r) => setItems(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Delete this analysis?')) return;
    try {
      await api.delete(`/analysis/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Deleted');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (!items) return <div className="center muted" style={{ padding: 80 }}>Loading…</div>;

  const chart = [...items].reverse().map((i, n) => ({
    name: `#${n + 1}`,
    score: i.overallScore,
    date: new Date(i.createdAt).toLocaleDateString(),
  }));
  const best = items.length ? Math.max(...items.map((i) => i.overallScore)) : 0;

  return (
    <div>
      <div className="result-head">
        <div>
          <h2>Your history</h2>
          <p className="muted">{items.length} analyses · best score {best}</p>
        </div>
        <Link to="/analyze" className="btn btn-primary"><Plus size={16} /> New analysis</Link>
      </div>

      {items.length === 0 ? (
        <div className="glass card center" style={{ padding: 60 }}>
          <p className="muted">No analyses yet. Upload your first resume!</p>
        </div>
      ) : (
        <>
          {items.length > 1 && (
            <div className="glass card" style={{ marginBottom: 24 }}>
              <h4>Score progress</h4>
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={chart}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: '#b9b9d3', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#b9b9d3', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1b1b2f', border: '1px solid #2e2e4d', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="history">
            {items.map((i, n) => (
              <motion.div key={i._id} className="glass history-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: n * 0.05 }}>
                <FileText size={22} className="muted" />
                <Link to={`/result/${i._id}`} className="history-main">
                  <strong>{i.fileName}</strong>
                  <small>{new Date(i.createdAt).toLocaleString()}{i.targetRole ? ` · ${i.targetRole}` : ''}</small>
                </Link>
                <div className="score-badge" style={{ borderColor: scoreColor(i.overallScore), color: scoreColor(i.overallScore) }}>
                  {i.overallScore}
                </div>
                <button className="icon-btn" onClick={() => remove(i._id)} aria-label="Delete"><Trash2 size={18} /></button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
