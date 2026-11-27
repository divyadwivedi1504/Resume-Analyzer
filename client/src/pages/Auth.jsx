import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      navigate('/analyze');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="auth glass" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
      <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
      <p className="muted">{isLogin ? 'Log in to see your analyses.' : 'Start improving your resume today.'}</p>
      <form onSubmit={submit}>
        {!isLogin && (
          <label>Full name
            <input required value={form.name} onChange={set('name')} placeholder="Rahul Sharma" />
          </label>
        )}
        <label>Email
          <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </label>
        <label>Password
          <input required type="password" minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
        </label>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
        </button>
      </form>
      <p className="muted center">
        {isLogin ? (
          <>New here? <Link to="/register">Create an account</Link></>
        ) : (
          <>Already registered? <Link to="/login">Log in</Link></>
        )}
      </p>
    </motion.div>
  );
}
