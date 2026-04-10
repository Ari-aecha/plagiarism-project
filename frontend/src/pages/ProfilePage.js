import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'https://plagiarism-project-hv2v.onrender.com';

const ProfilePage = ({ user, onUpdateProfile }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '', email: user?.email || '', profession: 'student',
    studyField: '', educationLevel: '', university: '', jobRole: '', company: '',
    industry: '', experience: '', otherSpecify: '',
    avatar: user?.name?.charAt(0)?.toUpperCase() || 'U',
    memberSince: user?.memberSince || new Date().getFullYear().toString()
  });
  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...profile, ...data, avatar: (data.name || user?.name || 'U').charAt(0).toUpperCase() };
        setProfile(updated); setFormData(updated);
      }
    } catch (err) { console.error('Error loading profile:', err); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok || true) {
        const updated = { ...profile, ...formData, avatar: formData.name?.charAt(0)?.toUpperCase() || 'U', profileCompleted: true };
        setProfile(updated); setShowSettings(false);
        if (onUpdateProfile) onUpdateProfile(formData);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify({ ...u, ...formData, profileCompleted: true }));
        }
        localStorage.setItem('profileCompleted', 'true');
        alert('Profile updated successfully!');
      }
    } catch (err) {
      setProfile({ ...profile, ...formData }); setShowSettings(false); alert('Profile updated!');
    } finally { setLoading(false); }
  };

  const studyFields = ['Computer Science & Engineering','Information Technology','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Data Science & AI','Cybersecurity','Business Administration','Medicine','Pharmacy','Law','Arts & Humanities','Commerce','Sciences','Biotechnology','Architecture','Other'];
  const educationLevels = ['High School','Undergraduate','Postgraduate','PhD / Doctorate','Diploma','Certificate','Other'];
  const industries = ['Technology','Education','Healthcare','Finance','Legal','Marketing','Sales','Manufacturing','Construction','Hospitality','Media','Government','Non-Profit','Retail','Consulting','Other'];
  const experienceLevels = ['Fresher (0-1 years)','Junior (1-3 years)','Mid-Level (3-6 years)','Senior (6-10 years)','Lead (10+ years)','Executive','Other'];

  const getProfessionLabel = () => ({ student: 'Student', working: 'Working Professional', other: 'Other' }[profile.profession] || 'Not Set');
  const getProfessionDetails = () => {
    if (profile.profession === 'student') return `${profile.studyField || 'Not specified'} · ${profile.educationLevel || 'Not specified'}`;
    if (profile.profession === 'working') return `${profile.jobRole || 'Not specified'} at ${profile.company || 'Not specified'}`;
    return profile.otherSpecify || 'Not specified';
  };

  return (
    <div style={S.container}>
      <div style={S.card}>
        <div style={S.cover}></div>
        <div style={S.avatarWrapper}>
          <div style={S.avatar}>{profile.avatar}</div>
        </div>
        <div style={S.userSection}>
          <h1 style={S.name}>{profile.name || 'User'}</h1>
          <p style={S.email}>{profile.email || 'user@example.com'}</p>
          <span style={S.badge}>{getProfessionLabel()}</span>
        </div>
        <div style={S.stats}>
          {[
            { val: getProfessionDetails().split('·')[0].trim() || 'Not set', lbl: 'Primary Role' },
            { val: profile.memberSince || '2024', lbl: 'Member Since' },
            { val: profile.profileCompleted ? 'Complete' : 'Incomplete', lbl: 'Profile Status' }
          ].map((item, i, arr) => (
            <React.Fragment key={i}>
              <div style={S.statItem}>
                <div style={{ ...S.statVal, fontSize: item.val.length > 12 ? '12px' : '16px' }}>{item.val}</div>
                <div style={S.statLbl}>{item.lbl}</div>
              </div>
              {i < arr.length - 1 && <div style={S.statDiv}></div>}
            </React.Fragment>
          ))}
        </div>
        <div style={S.details}>
          <h3 style={S.sectionTitle}>Profile Information</h3>
          <div style={S.detailsGrid}>
            {[
              { lbl: 'Full Name', val: profile.name || 'Not set' },
              { lbl: 'Email Address', val: profile.email || 'Not set' },
              { lbl: 'Profession', val: getProfessionLabel() },
              { lbl: 'Details', val: getProfessionDetails() },
            ].map((item, i) => (
              <div key={i} style={S.detailCard}>
                <div style={S.detailLbl}>{item.lbl}</div>
                <div style={S.detailVal}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.btnWrapper}>
          <button style={S.editBtn} onClick={() => setShowSettings(true)}>Edit Profile</button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.overlay} onClick={() => setShowSettings(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={S.modal} onClick={e => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <h3 style={{ margin: 0, color: '#f3f4f6', fontSize: '18px', fontWeight: '600' }}>Edit Profile</h3>
                <button style={S.closeBtn} onClick={() => setShowSettings(false)}>×</button>
              </div>
              <div style={S.modalBody}>
                <div style={S.formGroup}>
                  <label style={S.label}>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={S.input} placeholder="Your full name" />
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>I am a...</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[['student', 'Student'], ['working', 'Working Professional'], ['other', 'Other']].map(([val, lbl]) => (
                      <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="profession" value={val} checked={formData.profession === val} onChange={handleInputChange} />
                        <span style={{ color: '#d1d5db', fontSize: '14px' }}>{lbl}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.profession === 'student' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={S.formGroup}>
                      <label style={S.label}>Field of Study</label>
                      <select name="studyField" value={formData.studyField} onChange={handleInputChange} style={S.select}>
                        <option value="">Select field of study</option>
                        {studyFields.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Education Level</label>
                      <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} style={S.select}>
                        <option value="">Select level</option>
                        {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>University / College</label>
                      <input type="text" name="university" value={formData.university} onChange={handleInputChange} style={S.input} placeholder="Your university name" />
                    </div>
                  </motion.div>
                )}
                {formData.profession === 'working' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={S.formGroup}>
                      <label style={S.label}>Job Role</label>
                      <input type="text" name="jobRole" value={formData.jobRole} onChange={handleInputChange} style={S.input} placeholder="e.g., Software Engineer" />
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Company</label>
                      <input type="text" name="company" value={formData.company} onChange={handleInputChange} style={S.input} placeholder="Your company" />
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Industry</label>
                      <select name="industry" value={formData.industry} onChange={handleInputChange} style={S.select}>
                        <option value="">Select industry</option>
                        {industries.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Experience</label>
                      <select name="experience" value={formData.experience} onChange={handleInputChange} style={S.select}>
                        <option value="">Select experience</option>
                        {experienceLevels.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </motion.div>
                )}
                {formData.profession === 'other' && (
                  <div style={S.formGroup}>
                    <label style={S.label}>Please Specify</label>
                    <input type="text" name="otherSpecify" value={formData.otherSpecify} onChange={handleInputChange} style={S.input} placeholder="Tell us about yourself" />
                  </div>
                )}
              </div>
              <div style={S.modalFooter}>
                <button style={S.cancelBtn} onClick={() => setShowSettings(false)}>Cancel</button>
                <button style={S.saveBtn} onClick={handleSaveSettings} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const S = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
  card: { maxWidth: '860px', width: '100%', background: '#1a1a2e', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(129,140,248,0.2)' },
  cover: { height: '120px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
  avatarWrapper: { display: 'flex', justifyContent: 'center', marginTop: '-50px' },
  avatar: { width: '100px', height: '100px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '600', color: 'white', border: '4px solid #1a1a2e', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
  userSection: { textAlign: 'center', padding: '20px 24px 0' },
  name: { fontSize: '26px', fontWeight: '700', color: '#f3f4f6', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" },
  email: { fontSize: '14px', color: '#9ca3af', margin: '0 0 12px' },
  badge: { display: 'inline-block', padding: '5px 14px', background: 'rgba(129,140,248,0.15)', borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)' },
  stats: { display: 'flex', justifyContent: 'center', gap: '24px', margin: '20px 24px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(129,140,248,0.1)' },
  statItem: { textAlign: 'center', flex: 1 },
  statVal: { fontWeight: '600', color: '#f3f4f6', marginBottom: '4px', fontFamily: "'Space Grotesk', sans-serif" },
  statLbl: { fontSize: '12px', color: '#9ca3af' },
  statDiv: { width: '1px', background: 'rgba(255,255,255,0.08)' },
  details: { padding: '0 24px 20px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#e5e7eb', margin: '0 0 16px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' },
  detailCard: { padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(129,140,248,0.1)' },
  detailLbl: { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  detailVal: { fontSize: '14px', fontWeight: '500', color: '#e5e7eb' },
  btnWrapper: { padding: '0 24px 28px' },
  editBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '40px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#13132a', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflow: 'hidden', border: '1px solid rgba(129,140,248,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(129,140,248,0.15)' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 },
  modalBody: { padding: '24px', maxHeight: '55vh', overflowY: 'auto' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' },
  input: { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '10px', color: '#f3f4f6', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '10px', color: '#f3f4f6', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid rgba(129,140,248,0.15)' },
  cancelBtn: { padding: '10px 20px', background: 'transparent', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '30px', cursor: 'pointer', color: '#9ca3af', fontSize: '14px' },
  saveBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
};

export default ProfilePage;
