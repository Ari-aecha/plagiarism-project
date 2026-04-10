import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = ({ onGetStarted = () => {} }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const fullText = "Protect Your Original Content";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleMouse = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouse); };
  }, []);

  useEffect(() => {
    if (typingIndex < fullText.length) {
      const t = setTimeout(() => { setTypedText(p => p + fullText[typingIndex]); setTypingIndex(p => p + 1); }, 80);
      return () => clearTimeout(t);
    }
  }, [typingIndex, fullText]);

  const features = [
    { icon: "📄", title: "Document Similarity Checker", description: "Compare your main document against multiple reference documents with precision.", highlights: ["Direct & Semantic Matching", "Side-by-Side Highlighting", "Risk Level Analysis"] },
    { icon: "🛡️", title: "AI Guardian", description: "Deep single document intelligence — detect AI content, find sources, extract keywords.", highlights: ["AI Content Detection", "Source Detection", "Keyword Extraction"] }
  ];

  const steps = [
    { step: "01", title: "Upload", description: "Upload your document in TXT, PDF, DOCX, DOC, or RTF format." },
    { step: "02", title: "Analyze", description: "Our system processes content using advanced algorithms." },
    { step: "03", title: "Report", description: "Get a detailed analysis report with actionable insights." }
  ];

  return (
    <div className="landing-page">
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
        <div className="grid-overlay"></div>
      </div>
      <motion.div className="mouse-follower" animate={{ x: mousePosition.x - 150, y: mousePosition.y - 150 }} transition={{ type: "spring", stiffness: 50, damping: 30 }} />

      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-animated">
              <div className="logo-ring"></div>
              <div className="logo-inner"><span className="logo-icon">🛡️</span><div className="logo-pulse"></div></div>
            </div>
            <div className="logo-text-container">
              <span className="logo-text">Plagi</span>
              <span className="logo-text-gradient">Guard</span>
            </div>
          </div>
          <div className="nav-buttons">
            <button className="nav-btn-login" onClick={() => onGetStarted('login')}>Sign In</button>
            <button className="nav-btn-signup" onClick={() => onGetStarted('signup')}>
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">{typedText}<span className="typing-cursor">|</span></h1>
            <p className="hero-description">Advanced plagiarism detection with AI analysis. Compare documents or get deep insights with our comprehensive two-mode system.</p>
            <div className="hero-buttons">
              <button className="hero-btn-primary" onClick={() => onGetStarted('signup')}>
                Start Analyzing
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button className="hero-btn-secondary" onClick={() => onGetStarted('login')}>Sign In</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card">
              <div className="card-glow"></div>
              <div className="dashboard-card">
                <div className="dashboard-header">
                  <div className="dashboard-dots"><span></span><span></span><span></span></div>
                  <span style={{color:'#9ca3af',fontSize:'13px'}}>Analysis Report</span>
                  <div className="dashboard-status"><span className="status-dot"></span><span style={{color:'#9ca3af',fontSize:'12px'}}>Live</span></div>
                </div>
                <div className="dashboard-content">
                  <div className="score-card">
                    <div className="score-circle">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8"/>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#818cf8" strokeWidth="8" strokeDasharray="283" strokeDashoffset="85" strokeLinecap="round" transform="rotate(-90 50 50)"/>
                      </svg>
                      <span>85%</span>
                    </div>
                    <div className="score-info"><p style={{color:'#9ca3af',fontSize:'12px',marginBottom:'4px'}}>Originality Score</p><span style={{color:'#f3f4f6',fontWeight:'600'}}>High Quality</span></div>
                  </div>
                  <div className="sources-list">
                    {[['Wikipedia.org','12%'],['Google Scholar','8%'],['arXiv.org','5%']].map(([s,p],i) => (
                      <div key={i} className="source-item">
                        <span style={{width:'8px',height:'8px',background:'#818cf8',borderRadius:'50%',display:'inline-block'}}></span>
                        <span style={{color:'#d1d5db',fontSize:'13px',flex:1}}>{s}</span>
                        <span style={{color:'#a78bfa',fontWeight:'600',fontSize:'13px'}}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2 className="section-title">Two Powerful Analysis Modes</h2>
            <p className="section-description">Choose the right tool for your detection needs</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrapper"><div className="feature-icon-glow"></div><div className="feature-icon">{f.icon}</div></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.description}</p>
                <div className="feature-highlights">
                  {f.highlights.map((h, j) => (
                    <div key={j} className="highlight-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="howitworks-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">Get comprehensive results in three simple steps</p>
          </div>
          <div className="howitworks-grid">
            {steps.map((s, i) => (
              <div key={i} className="howitworks-card">
                <div className="step-number">{s.step}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-description">{s.description}</p>
                {i < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Check Your Content?</h2>
          <p className="cta-description">Join students and professionals using PlagiGuard today</p>
          <button className="cta-button" onClick={() => onGetStarted('signup')}>
            Get Started Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo"><div className="footer-logo-icon">🛡️</div><span>PlagiGuard</span></div>
              <p>Diploma Final Year Project — Computer Engineering</p>
              <p>Comprehensive plagiarism & AI detection system</p>
            </div>
            <div className="footer-links"><h4>Product</h4><a href="javascript:void(0)" onClick={e=>e.preventDefault()}>Document Similarity Checker</a><a href="javascript:void(0)" onClick={e=>e.preventDefault()}>AI Guardian</a></div>
            <div className="footer-links"><h4>Support</h4><a href="javascript:void(0)" onClick={e=>{e.preventDefault();setShowContactModal(true)}}>Contact Us</a></div>
            <div className="footer-links"><h4>Legal</h4><a href="javascript:void(0)" onClick={e=>{e.preventDefault();setShowPrivacyModal(true)}}>Privacy Policy</a><a href="javascript:void(0)" onClick={e=>{e.preventDefault();setShowTermsModal(true)}}>Terms of Service</a></div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 PlagiGuard | Computer Engineering Diploma Project</p>
            <p>Created with ❤️ by Shifa Anjum, Shagupta Pinjari and Radiya Sadaf</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowPrivacyModal(false)}>
            <motion.div className="modal-content" initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}} onClick={e=>e.stopPropagation()}>
              <div className="modal-header"><h2>Privacy Policy</h2><button className="modal-close" onClick={()=>setShowPrivacyModal(false)}>✕</button></div>
              <div className="modal-body">
                <h3>Information We Collect</h3><p>Documents you upload are processed temporarily for analysis and are not stored permanently on our servers.</p>
                <h3>How We Use Your Information</h3><p>Your uploaded documents are used solely for plagiarism detection. We do not share documents with third parties without your consent.</p>
                <h3>Data Security</h3><p>We implement security measures to protect your data. All uploads are processed securely and automatically deleted after analysis.</p>
                <p className="modal-last-updated">Last Updated: April 2026</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTermsModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowTermsModal(false)}>
            <motion.div className="modal-content" initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}} onClick={e=>e.stopPropagation()}>
              <div className="modal-header"><h2>Terms of Service</h2><button className="modal-close" onClick={()=>setShowTermsModal(false)}>✕</button></div>
              <div className="modal-body">
                <h3>Acceptance of Terms</h3><p>By using PlagiGuard, you agree to be bound by these Terms of Service.</p>
                <h3>Use of Service</h3><p>Our service is intended for academic and professional use. You agree not to use the service for any unlawful purpose.</p>
                <h3>Account Security</h3><p>You are responsible for maintaining the security of your account credentials.</p>
                <p className="modal-last-updated">Last Updated: April 2026</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContactModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowContactModal(false)}>
            <motion.div className="modal-content modal-small" initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}} onClick={e=>e.stopPropagation()}>
              <div className="modal-header"><h2>Contact Us</h2><button className="modal-close" onClick={()=>setShowContactModal(false)}>✕</button></div>
              <div className="modal-body">
                <div className="contact-info">
                  <div className="contact-item"><span className="contact-icon">📧</span><div><h4>Shifa Anjum</h4><a href="mailto:shifaanjum228@gmail.com">shifaanjum228@gmail.com</a></div></div>
                  <div className="contact-item"><span className="contact-icon">📧</span><div><h4>Shagupta Pinjari</h4><a href="mailto:shaguptapinjari1@gmail.com">shaguptapinjari1@gmail.com</a></div></div>
                </div>
                <p className="contact-note">For queries, suggestions, or support — feel free to reach out!</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        .landing-page{min-height:100vh;background:#0f0f23;overflow-x:hidden;position:relative;font-family:'DM Sans',system-ui,sans-serif}
        .animated-bg{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;overflow:hidden}
        .gradient-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.22;animation:float 20s infinite ease-in-out}
        .orb-1{width:500px;height:500px;background:#818cf8;top:-200px;right:-100px}
        .orb-2{width:400px;height:400px;background:#a78bfa;bottom:100px;left:-150px;animation-delay:-5s}
        .orb-3{width:350px;height:350px;background:#c4b5fd;bottom:200px;right:100px;animation-delay:-10s}
        .orb-4{width:300px;height:300px;background:#6366f1;top:50%;left:30%;animation-delay:-15s}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg) scale(1)}50%{transform:translateY(-50px) rotate(10deg) scale(1.1)}}
        .grid-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(129,140,248,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,0.03) 1px,transparent 1px);background-size:50px 50px}
        .mouse-follower{position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(129,140,248,0.07) 0%,transparent 70%);pointer-events:none;z-index:999}
        .navbar{position:fixed;top:0;left:0;right:0;z-index:1000;padding:20px 0;transition:all 0.3s;backdrop-filter:blur(10px)}
        .navbar-scrolled{background:rgba(15,15,35,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(129,140,248,0.2);padding:14px 0}
        .nav-container{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center}
        .nav-logo{display:flex;align-items:center;gap:14px;cursor:pointer}
        .logo-animated{position:relative;width:48px;height:48px}
        .logo-ring{position:absolute;inset:-2px;border-radius:50%;background:linear-gradient(135deg,#818cf8,#a78bfa,#c4b5fd);animation:rotate 3s linear infinite}
        @keyframes rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        .logo-inner{position:absolute;inset:2px;background:#0f0f23;border-radius:50%;display:flex;align-items:center;justify-content:center}
        .logo-icon{font-size:24px;position:relative;z-index:1}
        .logo-pulse{position:absolute;width:100%;height:100%;border-radius:50%;background:rgba(129,140,248,0.25);animation:pulse 2s infinite}
        @keyframes pulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.5);opacity:0}}
        .logo-text-container{display:flex;flex-direction:column}
        .logo-text{font-size:18px;font-weight:700;color:#f3f4f6;letter-spacing:1px;font-family:'Space Grotesk',sans-serif}
        .logo-text-gradient{font-size:13px;background:linear-gradient(135deg,#818cf8,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-weight:500}
        .nav-buttons{display:flex;gap:12px}
        .nav-btn-login{padding:9px 22px;background:transparent;border:1px solid rgba(129,140,248,0.35);border-radius:40px;font-size:14px;font-weight:500;color:#e5e7eb;cursor:pointer;transition:all 0.3s}
        .nav-btn-login:hover{border-color:#818cf8;background:rgba(129,140,248,0.1)}
        .nav-btn-signup{display:flex;align-items:center;gap:8px;padding:9px 22px;background:linear-gradient(135deg,#818cf8,#a78bfa);color:white;border:none;border-radius:40px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.3s}
        .nav-btn-signup:hover{transform:translateY(-2px);box-shadow:0 4px 15px rgba(129,140,248,0.35)}
        .hero-section{min-height:100vh;display:flex;align-items:center;position:relative;padding:120px 24px 80px;z-index:1}
        .hero-container{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
        .hero-title{font-size:52px;font-weight:800;line-height:1.2;color:#f3f4f6;margin-bottom:20px;font-family:'Space Grotesk',sans-serif}
        .typing-cursor{animation:blink 1s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .hero-description{font-size:17px;line-height:1.7;color:#9ca3af;margin-bottom:28px}
        .hero-buttons{display:flex;gap:14px;flex-wrap:wrap}
        .hero-btn-primary{display:flex;align-items:center;gap:10px;padding:13px 28px;background:linear-gradient(135deg,#818cf8,#a78bfa);color:white;border:none;border-radius:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s}
        .hero-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(129,140,248,0.4)}
        .hero-btn-secondary{padding:13px 28px;background:transparent;border:2px solid rgba(129,140,248,0.4);border-radius:50px;font-size:15px;font-weight:600;color:#e5e7eb;cursor:pointer;transition:all 0.3s}
        .hero-btn-secondary:hover{border-color:#818cf8;background:rgba(129,140,248,0.08)}
        .floating-card{position:relative;animation:floatCard 6s infinite ease-in-out}
        @keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        .card-glow{position:absolute;inset:-20px;background:linear-gradient(135deg,#818cf8,#a78bfa);border-radius:32px;filter:blur(30px);opacity:0.18;animation:glowPulse 3s infinite}
        @keyframes glowPulse{0%,100%{opacity:.14}50%{opacity:.26}}
        .dashboard-card{background:rgba(26,26,50,0.9);backdrop-filter:blur(20px);border-radius:20px;overflow:hidden;border:1px solid rgba(129,140,248,0.2);position:relative;z-index:1}
        .dashboard-header{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid rgba(129,140,248,0.12)}
        .dashboard-dots{display:flex;gap:5px}
        .dashboard-dots span{width:9px;height:9px;border-radius:50%;background:#374151}
        .dashboard-status{display:flex;align-items:center;gap:5px;margin-left:auto}
        .status-dot{width:6px;height:6px;background:#10b981;border-radius:50%;animation:blink 1.5s infinite}
        .dashboard-content{padding:18px}
        .score-card{display:flex;align-items:center;gap:18px;margin-bottom:20px}
        .score-circle{position:relative;width:90px;height:90px}
        .score-circle svg{width:100%;height:100%}
        .score-circle span{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:18px;font-weight:700;color:#a78bfa;font-family:'Space Grotesk',sans-serif}
        .sources-list{display:flex;flex-direction:column;gap:10px}
        .source-item{display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(255,255,255,0.04);border-radius:7px}
        .features-section{padding:100px 24px;background:rgba(0,0,0,0.15);position:relative;z-index:1}
        .section-container{max-width:1200px;margin:0 auto}
        .section-header{text-align:center;margin-bottom:56px}
        .section-badge{display:inline-block;padding:5px 14px;background:rgba(129,140,248,0.1);border-radius:30px;font-size:12px;font-weight:600;color:#a78bfa;margin-bottom:14px;border:1px solid rgba(129,140,248,0.2);text-transform:uppercase;letter-spacing:0.5px}
        .section-title{font-size:38px;font-weight:700;color:#f3f4f6;margin-bottom:14px;font-family:'Space Grotesk',sans-serif}
        .section-description{font-size:17px;color:#9ca3af;max-width:560px;margin:0 auto}
        .features-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
        .feature-card{background:rgba(26,26,50,0.7);backdrop-filter:blur(10px);padding:28px;border-radius:20px;border:1px solid rgba(129,140,248,0.12);transition:all 0.3s}
        .feature-card:hover{transform:translateY(-8px);border-color:rgba(129,140,248,0.4)}
        .feature-icon-wrapper{position:relative;width:56px;height:56px;margin-bottom:18px}
        .feature-icon-glow{position:absolute;inset:0;background:linear-gradient(135deg,#818cf8,#a78bfa);border-radius:14px;filter:blur(10px);opacity:0.35}
        .feature-icon{position:relative;width:56px;height:56px;background:linear-gradient(135deg,#818cf8,#a78bfa);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;z-index:1}
        .feature-title{font-size:19px;font-weight:600;color:#f3f4f6;margin-bottom:10px;font-family:'Space Grotesk',sans-serif}
        .feature-description{font-size:14px;color:#9ca3af;line-height:1.6;margin-bottom:14px}
        .feature-highlights{background:rgba(255,255,255,0.04);padding:14px;border-radius:10px}
        .highlight-item{display:flex;align-items:center;gap:8px;font-size:13px;color:#d1d5db;margin-bottom:7px}
        .highlight-item:last-child{margin-bottom:0}
        .howitworks-section{padding:100px 24px;position:relative;z-index:1}
        .howitworks-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;position:relative}
        .howitworks-card{text-align:center;padding:36px 20px;position:relative}
        .step-number{width:64px;height:64px;background:linear-gradient(135deg,#818cf8,#a78bfa);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;margin:0 auto 18px;box-shadow:0 0 30px rgba(129,140,248,0.25);font-family:'Space Grotesk',sans-serif}
        .step-title{font-size:19px;font-weight:600;color:#f3f4f6;margin-bottom:10px;font-family:'Space Grotesk',sans-serif}
        .step-description{font-size:14px;color:#9ca3af;line-height:1.6}
        .step-connector{position:absolute;top:42px;right:-12px;width:24px;height:2px;background:linear-gradient(90deg,#818cf8,transparent)}
        .cta-section{padding:100px 24px;position:relative;z-index:1}
        .cta-container{max-width:700px;margin:0 auto;text-align:center}
        .cta-title{font-size:38px;font-weight:700;color:#f3f4f6;margin-bottom:14px;font-family:'Space Grotesk',sans-serif}
        .cta-description{font-size:17px;color:#9ca3af;margin-bottom:28px}
        .cta-button{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:linear-gradient(135deg,#818cf8,#a78bfa);color:white;border:none;border-radius:50px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.3s}
        .cta-button:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(129,140,248,0.35)}
        .footer{background:rgba(0,0,0,0.35);backdrop-filter:blur(10px);padding:60px 24px 30px;border-top:1px solid rgba(129,140,248,0.12);position:relative;z-index:1}
        .footer-container{max-width:1200px;margin:0 auto}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:36px;margin-bottom:36px}
        .footer-logo{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:700;color:#f3f4f6;margin-bottom:14px;font-family:'Space Grotesk',sans-serif}
        .footer-logo-icon{font-size:26px}
        .footer-brand p{color:#9ca3af;line-height:1.6;margin-bottom:6px;font-size:14px}
        .footer-links h4{font-size:15px;font-weight:600;color:#f3f4f6;margin-bottom:18px}
        .footer-links a{display:block;color:#9ca3af;text-decoration:none;margin-bottom:10px;font-size:14px;transition:color 0.3s;cursor:pointer}
        .footer-links a:hover{color:#a78bfa}
        .footer-bottom{text-align:center;padding-top:28px;border-top:1px solid rgba(129,140,248,0.1);color:#6b7280;font-size:13px;line-height:1.8}
        .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:2000;padding:20px}
        .modal-content{background:#1a1a2e;border-radius:20px;width:90%;max-width:540px;max-height:80vh;overflow:hidden;border:1px solid rgba(129,140,248,0.25)}
        .modal-small{max-width:440px}
        .modal-header{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(129,140,248,0.15);background:linear-gradient(135deg,#4f46e5,#7c3aed)}
        .modal-header h2{color:white;font-size:18px;font-weight:600;margin:0;font-family:'Space Grotesk',sans-serif}
        .modal-close{background:rgba(255,255,255,0.2);border:none;color:white;font-size:18px;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center}
        .modal-body{padding:22px;max-height:60vh;overflow-y:auto;color:#e5e7eb}
        .modal-body h3{font-size:15px;font-weight:600;color:#a78bfa;margin:18px 0 8px 0}
        .modal-body h3:first-child{margin-top:0}
        .modal-body p{font-size:14px;line-height:1.6;color:#9ca3af;margin-bottom:10px}
        .modal-last-updated{font-size:12px;color:#6b7280;margin-top:18px;padding-top:14px;border-top:1px solid rgba(129,140,248,0.12)}
        .contact-info{display:flex;flex-direction:column;gap:16px;margin-bottom:20px}
        .contact-item{display:flex;align-items:center;gap:14px;padding:14px 16px;background:rgba(129,140,248,0.08);border-radius:12px;border:1px solid rgba(129,140,248,0.15)}
        .contact-icon{font-size:28px}
        .contact-item h4{color:#f3f4f6;font-size:15px;font-weight:600;margin:0 0 4px}
        .contact-item a{color:#a78bfa;text-decoration:none;font-size:13px}
        .contact-note{font-size:13px;color:#6b7280;text-align:center;padding-top:14px;border-top:1px solid rgba(129,140,248,0.12)}
        @media(max-width:968px){.hero-container{grid-template-columns:1fr;text-align:center}.hero-title{font-size:38px}.hero-buttons{justify-content:center}.features-grid{grid-template-columns:1fr}.howitworks-grid{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr;text-align:center}.step-connector{display:none}}
        @media(max-width:768px){.hero-title{font-size:30px}.section-title{font-size:26px}.cta-title{font-size:26px}}
      `}</style>
    </div>
  );
};

export default LandingPage;