import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const API = 'https://plagiarism-project-hv2v.onrender.com';

const AuthModal = ({ isOpen, onClose, mode, onSuccess }) => {
  const [activeMode, setActiveMode] = useState(mode || 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.access_token, data.user);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setSuccess('Account created! Please login.');
      setTimeout(() => { setActiveMode('login'); setSuccess(''); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={styles.modal}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logo}>🛡️ PlagiGuard</div>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {['login', 'signup'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveMode(tab); setError(''); setSuccess(''); }}
                style={{ ...styles.tab, ...(activeMode === tab ? styles.activeTab : {}) }}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div style={styles.body}>
            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            {/* LOGIN */}
            {activeMode === 'login' && (
              <form onSubmit={handleLogin}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange}
                    style={styles.input} placeholder="your@email.com" required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange}
                    style={styles.input} placeholder="••••••••" required />
                </div>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* SIGNUP */}
            {activeMode === 'signup' && (
              <form onSubmit={handleSignup}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input name="name" type="text" value={formData.name} onChange={handleChange}
                    style={styles.input} placeholder="Your Name" required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange}
                    style={styles.input} placeholder="your@email.com" required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange}
                    style={styles.input} placeholder="Min 6 characters" required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}
                    style={styles.input} placeholder="Repeat password" required />
                </div>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
  modal: { background: '#1a1a2e', borderRadius: '20px', width: '100%', maxWidth: '440px', border: '1px solid rgba(129,140,248,0.25)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo: { fontSize: '18px', fontWeight: '700', color: 'white', fontFamily: "'Space Grotesk', sans-serif" },
  closeBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(129,140,248,0.15)' },
  tab: { flex: 1, padding: '14px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
  activeTab: { color: '#818cf8', borderBottom: '2px solid #818cf8', background: 'rgba(129,140,248,0.05)' },
  body: { padding: '24px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '10px', color: '#f3f4f6', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  errorBox: { background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  successBox: { background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.4)', color: '#6ee7b7', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
};

export default AuthModal;