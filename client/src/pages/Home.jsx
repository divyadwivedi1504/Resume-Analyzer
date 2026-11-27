import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanSearch, Target, Radar, ShieldCheck, Wand2, History, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: ShieldCheck, title: 'ATS Score', text: 'See how well applicant tracking systems can read and rank your resume.' },
  { icon: Target, title: 'Job Match', text: 'Paste a job description and get matched vs. missing keywords instantly.' },
  { icon: ScanSearch, title: 'Skill Extraction', text: 'Automatically detects 120+ skills grouped by category.' },
  { icon: Radar, title: 'Role Fit Radar', text: 'Find out which roles your skills fit best – Full Stack, Data, DevOps and more.' },
  { icon: Wand2, title: 'Smart Suggestions', text: 'Actionable fixes: weak phrases, missing sections, quantified impact.' },
  { icon: History, title: 'Progress History', text: 'Every analysis is saved so you can track your score improving.' },
];

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5 },
});

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero">
        <motion.span className="pill" {...fade(0)}>✨ Free · No AI API key needed</motion.span>
        <motion.h1 {...fade(1)}>
          Beat the ATS. <br />
          <span className="gradient-text">Land more interviews.</span>
        </motion.h1>
        <motion.p className="lead" {...fade(2)}>
          Upload your resume and get an instant score, keyword match, skill breakdown and
          clear steps to improve it – in seconds.
        </motion.p>
        <motion.div className="hero-cta" {...fade(3)}>
          <Link to={user ? '/analyze' : '/register'} className="btn btn-primary btn-lg">
            Analyze my resume <ArrowRight size={18} />
          </Link>
          {!user && <Link to="/login" className="btn btn-ghost btn-lg">I have an account</Link>}
        </motion.div>

        <motion.div className="hero-card glass" {...fade(4)}>
          <div className="mini-row"><span>ATS Compatibility</span><b>88</b></div>
          <div className="bar"><i style={{ width: '88%' }} /></div>
          <div className="mini-row"><span>Keyword Match</span><b>80</b></div>
          <div className="bar"><i style={{ width: '80%', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} /></div>
          <div className="mini-row"><span>Impact &amp; Metrics</span><b>45</b></div>
          <div className="bar"><i style={{ width: '45%', background: 'linear-gradient(90deg,#fb7185,#f43f5e)' }} /></div>
        </motion.div>
      </section>

      <section className="features">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="glass feature"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -6 }}
          >
            <div className="feature-icon"><f.icon size={22} /></div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </motion.div>
        ))}
      </section>
    </>
  );
}
