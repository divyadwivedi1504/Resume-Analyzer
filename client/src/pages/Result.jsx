import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import {
  AlertOctagon, AlertTriangle, Lightbulb, PartyPopper, Mail, Phone, Linkedin, Github,
  CheckCircle2, XCircle, Printer, RefreshCw,
} from 'lucide-react';
import ScoreRing, { scoreColor } from '../components/ScoreRing';
import api, { errMsg } from '../api';
import toast from 'react-hot-toast';

const sugMeta = {
  critical: { icon: AlertOctagon, cls: 'sug-critical', label: 'Critical' },
  warning: { icon: AlertTriangle, cls: 'sug-warning', label: 'Improve' },
  tip: { icon: Lightbulb, cls: 'sug-tip', label: 'Tip' },
  success: { icon: PartyPopper, cls: 'sug-success', label: 'Nice' },
};

const subLabels = {
  contact: 'Contact info',
  sections: 'Sections',
  skills: 'Skills',
  impact: 'Impact & metrics',
  readability: 'Length & clarity',
};

const rise = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.1, duration: 0.45 },
});

export default function Result() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/analysis/${id}`).then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e)));
  }, [id]);

  if (!data) return <div className="center muted" style={{ padding: 80 }}>Loading analysis…</div>;

  const radarData = Object.entries(data.scores).map(([k, v]) => ({ subject: subLabels[k], value: v }));
  const roleData = data.roleFit.slice(0, 5);
  const { contact } = data;

  return (
    <div className="result">
      <motion.div className="result-head" {...rise(0)}>
        <div>
          <h2>Analysis report</h2>
          <p className="muted">{data.fileName} · {data.wordCount} words{data.targetRole ? ` · ${data.targetRole}` : ''}</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
          <Link to="/analyze" className="btn btn-primary"><RefreshCw size={16} /> Analyze another</Link>
        </div>
      </motion.div>

      {/* Score cards */}
      <div className="grid-3">
        <motion.div className="glass card center" {...rise(1)}>
          <h4>Overall Score</h4>
          <ScoreRing score={data.overallScore} />
        </motion.div>
        <motion.div className="glass card center" {...rise(2)}>
          <h4>ATS Compatibility</h4>
          <ScoreRing score={data.atsScore} label="ATS" />
        </motion.div>
        <motion.div className="glass card center" {...rise(3)}>
          <h4>Job Match</h4>
          {data.jdMatchScore !== null && data.jdMatchScore !== undefined ? (
            <ScoreRing score={data.jdMatchScore} label="Match" />
          ) : (
            <p className="muted" style={{ marginTop: 40 }}>Add a job description to see your match score.</p>
          )}
        </motion.div>
      </div>

      {/* Radar + role fit */}
      <div className="grid-2">
        <motion.div className="glass card" {...rise(4)}>
          <h4>Score breakdown</h4>
          <div style={{ height: 290 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#b9b9d3', fontSize: 12 }} />
                <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="glass card" {...rise(5)}>
          <h4>Best role fit</h4>
          <div style={{ height: 290 }}>
            <ResponsiveContainer>
              <BarChart data={roleData} layout="vertical" margin={{ left: 30 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="role" width={150} tick={{ fill: '#b9b9d3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#1b1b2f', border: '1px solid #2e2e4d', borderRadius: 8 }} />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20}>
                  {roleData.map((r, i) => <Cell key={i} fill={scoreColor(r.score)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Suggestions */}
      <motion.div className="glass card" {...rise(6)}>
        <h4>Suggestions to improve ({data.suggestions.length})</h4>
        <div className="sug-list">
          {data.suggestions.map((s, i) => {
            const m = sugMeta[s.type] || sugMeta.tip;
            return (
              <div key={i} className={`sug ${m.cls}`}>
                <m.icon size={20} />
                <div><b>{m.label}</b><p>{s.text}</p></div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div className="glass card" {...rise(7)}>
        <h4>Skills detected ({data.skills.length})</h4>
        {Object.keys(data.skillsByCategory || {}).length === 0 && <p className="muted">No known skills detected. Add a clear "Skills" section.</p>}
        {Object.entries(data.skillsByCategory || {}).map(([cat, list]) => (
          <div key={cat} className="skill-group">
            <small>{cat}</small>
            <div className="chips">{list.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </div>
        ))}
      </motion.div>

      {/* Keywords */}
      {(data.matchedKeywords?.length > 0 || data.missingKeywords?.length > 0) && (
        <motion.div className="glass card" {...rise(8)}>
          <h4>Job description keywords</h4>
          <div className="grid-2">
            <div>
              <small className="ok-text"><CheckCircle2 size={14} /> Matched ({data.matchedKeywords.length})</small>
              <div className="chips">{data.matchedKeywords.map((k) => <span key={k} className="chip chip-ok">{k}</span>)}</div>
            </div>
            <div>
              <small className="bad-text"><XCircle size={14} /> Missing ({data.missingKeywords.length})</small>
              <div className="chips">{data.missingKeywords.map((k) => <span key={k} className="chip chip-bad">{k}</span>)}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Details */}
      <div className="grid-2">
        <motion.div className="glass card" {...rise(9)}>
          <h4>Contact details found</h4>
          <ul className="detail-list">
            <li className={contact.email ? 'ok' : 'bad'}><Mail size={16} /> {contact.email || 'Email missing'}</li>
            <li className={contact.phone ? 'ok' : 'bad'}><Phone size={16} /> {contact.phone || 'Phone missing'}</li>
            <li className={contact.linkedin ? 'ok' : 'bad'}><Linkedin size={16} /> {contact.linkedin || 'LinkedIn missing'}</li>
            <li className={contact.github ? 'ok' : 'bad'}><Github size={16} /> {contact.github || 'GitHub missing'}</li>
          </ul>
        </motion.div>

        <motion.div className="glass card" {...rise(10)}>
          <h4>Resume sections</h4>
          <div className="chips">
            {data.sectionsFound.map((s) => <span key={s} className="chip chip-ok">✓ {s}</span>)}
            {data.sectionsMissing.map((s) => <span key={s} className="chip chip-bad">✗ {s}</span>)}
          </div>
          <div className="stat-row">
            <div><b>{data.actionVerbCount}</b><small>Action verbs</small></div>
            <div><b>{data.quantifiedCount}</b><small>Quantified results</small></div>
            <div><b>{data.weakPhrases.length}</b><small>Weak phrases</small></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
