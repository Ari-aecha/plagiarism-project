import './AIGuardian.css';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Icons = {
  Document: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>),
  Upload: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>),
  Analysis: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>),
  Chat: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>),
  Plagiarism: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>),
  AI: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>),
  Source: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  Image: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>),
  Keyword: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>),
  Statistics: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2" /><circle cx="12" cy="16" r="5" /><path d="M12 11v5" /></svg>),
  Check: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>),
  Warning: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 7v6M12 17h.01" /><circle cx="12" cy="12" r="10" /></svg>),
  Close: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  External: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>),
  Paragraph: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 20h10M7 4h10M7 8h10M7 12h10M7 16h10" /></svg>),
  Clock: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
};

// API constant
const API = process.env.REACT_APP_API_URL;

const AIGuardian = ({ user }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setDocumentName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => setDocumentContent(event.target.result);
    reader.readAsText(file, 'UTF-8');
  };

  const analyzeDocument = async () => {
    if (!uploadedFile) { alert('Please select a document to analyze'); return; }
    
    // Safety check
    if (!API) {
      alert("API URL not configured");
      return;
    }
    
    setLoading(true); setLoadingProgress(0); setError(null);
    setLoadingStage('Initializing analysis...');
    const formData = new FormData();
    formData.append('file', uploadedFile);
    try {
      const token = localStorage.getItem('token');
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => prev >= 90 ? prev : prev + 10);
      }, 600);
      setLoadingStage('Analyzing document...');
      const response = await fetch(`${API}/api/ai-guardian/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      clearInterval(progressInterval);
      setLoadingProgress(95);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setLoadingProgress(100);
      setLoadingStage('Complete!');
      setTimeout(() => {
        setAnalysis(data);
        setActiveTab('results');
        setLoading(false);
        setChatMessages([{
          type: 'bot',
          message: `✅ **Analysis Complete**\n\nI've analyzed "${data.fileName}".\n\n**Summary:**\n• Plagiarism Score: ${data.plagiarism?.score || 0}%\n• AI Probability: ${data.ai?.probability || 0}%\n• Sources Found: ${data.sources?.length || 0}\n• Word Count: ${data.stats?.wordCount || 0}\n\nWhat would you like to know more about?`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }, 400);
    } catch (err) {
      setError(err.message);
      alert('Analysis failed: ' + err.message);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !analysis) return;
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', message: userMessage, timestamp: new Date().toLocaleTimeString() }]);
    setChatInput('');
    setChatLoading(true);
    setTimeout(() => {
      const response = generateChatResponse(userMessage, analysis);
      setChatMessages(prev => [...prev, { type: 'bot', message: response, timestamp: new Date().toLocaleTimeString() }]);
      setChatLoading(false);
    }, 800);
  };

  const generateChatResponse = (question, data) => {
    const q = question.toLowerCase();
    if (q.includes('plagiarism') || q.includes('score')) {
      return `**Plagiarism Analysis**\n\n• Score: **${data.plagiarism?.score || 0}%**\n• Originality: **${data.plagiarism?.originality || 0}%**\n• Risk Level: **${data.plagiarism?.riskLevel || 'N/A'}**\n\n${data.plagiarism?.duplicatePhrases?.length > 0 ? `**Repeated Phrases:**\n${data.plagiarism.duplicatePhrases.map(p => `• "${(typeof p === 'string' ? p : p.text || JSON.stringify(p)).substring(0, 80)}..."`).join('\n')}` : 'No significant duplication detected.'}`;
    }
    if (q.includes('ai') || q.includes('chatgpt') || q.includes('generated')) {
      return `**AI Detection Results**\n\n• Overall AI Probability: **${data.ai?.probability || 0}%**\n• Risk Level: **${data.ai?.riskLevel || 'N/A'}**\n\n**Model Breakdown:**\n${data.ai?.models?.map(m => `• ${m.name}: ${m.confidence}% (${m.matches} indicators)`).join('\n') || 'No model data'}`;
    }
    if (q.includes('source') || q.includes('reference') || q.includes('where')) {
      if (!data.sources || data.sources.length === 0) return 'No external sources detected in this document.';
      return `**Sources Found (${data.sources.length})**\n\n${data.sources.slice(0, 5).map(s => `• **${s.type || 'URL'}**: ${s.title || 'Untitled'}\n  ${s.url ? `URL: ${s.url.substring(0, 60)}` : ''}`).join('\n\n')}`;
    }
    if (q.includes('image') || q.includes('picture')) {
      if (!data.images || data.images.length === 0) return 'No images detected in this document.';
      return `**Images Found (${data.images.length})**\n\n${data.images.map(img => `• Type: ${img.type} | Source: ${img.source}`).join('\n')}`;
    }
    if (q.includes('keyword') || q.includes('topic')) {
      return `**Key Topics**\n\n${data.stats?.keywords?.map((k, i) => `${i + 1}. **${k.word}** (${k.count} occurrences)`).join('\n') || 'No keywords found'}`;
    }
    if (q.includes('stat') || q.includes('word') || q.includes('count')) {
      return `**Document Statistics**\n\n• Words: **${data.stats?.wordCount || 0}**\n• Unique Words: **${data.stats?.uniqueWords || 0}**\n• Sentences: **${data.stats?.sentenceCount || 0}**\n• Avg Word Length: **${data.stats?.avgWordLength || 0}**\n• Lexical Diversity: **${data.stats?.lexicalDiversity || 0}%**\n• Reading Time: **${Math.ceil((data.stats?.wordCount || 0) / 200)} min**`;
    }
    return `I can help you with:\n\n• **Plagiarism analysis** — ask "What is the plagiarism score?"\n• **AI detection** — ask "Show AI detection results"\n• **Sources** — ask "List all sources"\n• **Statistics** — ask "Show document statistics"\n• **Keywords** — ask "What are the key topics?"`;
  };

  const getComparisonChartData = () => {
    if (!analysis) return null;
    return {
      labels: ['Plagiarism Score', 'Originality', 'AI Probability'],
      datasets: [{
        label: 'Percentage (%)',
        data: [analysis.plagiarism?.score || 0, analysis.plagiarism?.originality || 0, analysis.ai?.probability || 0],
        backgroundColor: ['#dc2626', '#059669', '#7c3aed'],
        borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.8
      }]
    };
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
  };

  const openSourceUrl = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const comparisonChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#9ca3af', font: { size: 11 } } },
      tooltip: { backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#e5e7eb' }
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage (%)', color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#6b7280', callback: v => v + '%' } },
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { weight: 'bold' } } }
    }
  };

  return (
    <div className="ai-guardian">
      <div className="ai-header">
        <div className="ai-header-content">
          <h1 className="ai-title">AI Guardian</h1>
          <p className="ai-subtitle">Advanced Document Intelligence System</p>
        </div>
        <div className="ai-profile">
          <div className="ai-profile-icon">{getUserInitials()}</div>
        </div>
      </div>

      {error && (
        <div className="ai-error">
          <div className="ai-error-content"><Icons.Warning /><span>{error}</span></div>
          <button onClick={() => setError(null)} className="ai-error-close"><Icons.Close /></button>
        </div>
      )}

      <div className="ai-tabs">
        {[{key:'upload',Icon:Icons.Upload,label:'Upload'},{key:'results',Icon:Icons.Analysis,label:'Analysis'},{key:'chat',Icon:Icons.Chat,label:'Assistant'}].map(({key,Icon,label}) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`ai-tab ${activeTab===key?'ai-tab-active':''}`} disabled={key!=='upload'&&!analysis}>
            <Icon /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="ai-content">
        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="ai-upload">
            <div className="ai-dropzone" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".txt,.pdf,.doc,.docx,.rtf" />
              <div className="ai-dropzone-icon"><Icons.Document /></div>
              <h3 className="ai-dropzone-title">Upload Document</h3>
              <p className="ai-dropzone-text">Click to browse or drag & drop</p>
              <p className="ai-dropzone-formats">Supported: TXT, PDF, DOC, DOCX, RTF</p>
              {documentName && <div className="ai-selected-file"><Icons.Check /><span>{documentName}</span></div>}
            </div>
            <button onClick={analyzeDocument} className="ai-analyze-btn" disabled={loading || !uploadedFile}>
              {loading ? <><span className="ai-spinner"></span><span>{loadingStage || 'Analyzing...'}</span></> : <><Icons.Analysis /><span>Begin Analysis</span></>}
            </button>
            {loading && (
              <div className="ai-progress" style={{ width: '100%', maxWidth: '560px' }}>
                <div className="ai-progress-bar"><div className="ai-progress-fill" style={{ width: `${loadingProgress}%` }} /></div>
                <p className="ai-progress-text">{loadingStage}</p>
                <p className="ai-progress-percent">{loadingProgress}%</p>
              </div>
            )}
            <div className="ai-features ai-features-center">
              <div className="ai-feature"><Icons.AI /><h4>AI Detection</h4><p></p></div>
              <div className="ai-feature"><Icons.Source /><h4>Source Tracing</h4><p>URL & citation detection</p></div>
              <div className="ai-feature"><Icons.Statistics /><h4>Deep Analytics</h4><p>Readability & vocabulary stats</p></div>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && analysis && (
          <div className="ai-results">
            <div className="ai-stats-grid">
              {[
                {icon:<Icons.Plagiarism/>,label:'Plagiarism Score',val:`${analysis.plagiarism?.score||0}%`,sub:analysis.plagiarism?.riskLevel||'N/A',risk:true},
                {icon:<Icons.AI/>,label:'AI Probability',val:`${analysis.ai?.probability||0}%`,sub:analysis.ai?.riskLevel||'N/A',risk:true},
                {icon:<Icons.Source/>,label:'Sources Found',val:analysis.sources?.length||0,sub:`${analysis.sources?.length||0} detected`},
                {icon:<Icons.Statistics/>,label:'Word Count',val:analysis.stats?.wordCount||0,sub:`${Math.ceil((analysis.stats?.wordCount||0)/200)} min read`},
              ].map((item,i) => (
                <div key={i} className="ai-stat-card">
                  <div className="ai-stat-icon">{item.icon}</div>
                  <div className="ai-stat-content">
                    <span className="ai-stat-label">{item.label}</span>
                    <span className="ai-stat-value">{item.val}</span>
                    <span className={`ai-stat-sub ${item.risk ? `risk-${(item.sub||'low').toLowerCase()}` : ''}`}>{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-charts">
              <div className="ai-chart-card">
                <h4 className="ai-chart-title"><Icons.Plagiarism /> Plagiarism vs AI Score</h4>
                <div className="ai-chart-container">
                  {getComparisonChartData() && <Bar data={getComparisonChartData()} options={comparisonChartOptions} />}
                </div>
              </div>
              <div className="ai-chart-card">
                <h4 className="ai-chart-title"><Icons.Statistics /> Deep Analytics</h4>
                <div className="ai-deep-stats">
                  {[
                    {icon:<Icons.Document/>,label:'Total Words',val:analysis.stats?.wordCount||0},
                    {icon:<Icons.Keyword/>,label:'Unique Words',val:analysis.stats?.uniqueWords||0},
                    {icon:<Icons.Paragraph/>,label:'Sentences',val:analysis.stats?.sentenceCount||0},
                    {icon:<Icons.Clock/>,label:'Reading Time',val:`${Math.ceil((analysis.stats?.wordCount||0)/200)} min`},
                    {icon:<Icons.AI/>,label:'Avg Word Length',val:analysis.stats?.avgWordLength||0},
                    {icon:<Icons.Chat/>,label:'Lexical Diversity',val:`${analysis.stats?.lexicalDiversity||0}%`},
                  ].map((item,i) => (
                    <div key={i} className="ai-deep-stat-item">
                      <div className="ai-deep-stat-icon">{item.icon}</div>
                      <div className="ai-deep-stat-info">
                        <span className="ai-deep-stat-label">{item.label}</span>
                        <span className="ai-deep-stat-value">{item.val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {analysis.sources && analysis.sources.length > 0 && (
              <div className="ai-section">
                <h3 className="ai-section-title"><Icons.Source /> Detected Sources ({analysis.sources.length})</h3>
                <div className="ai-sources">
                  {analysis.sources.slice(0, 9).map((source, idx) => (
                    <motion.div key={source.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="ai-source-item" onClick={() => openSourceUrl(source.url || source.source)}>
                      <div className="ai-source-header">
                        <span className={`ai-source-type type-${(source.type||'url').toLowerCase()}`}>{source.type || 'URL'}</span>
                        <span className="ai-source-confidence">{Math.round(source.confidence || 0)}%</span>
                      </div>
                      <div className="ai-source-title">{source.title || 'Unknown Source'}</div>
                      {source.url && <div className="ai-source-url">{source.url.substring(0, 55)}... <Icons.External /></div>}
                      <div className="ai-source-relevance">Relevance: {Math.round(source.relevance || 0)}%</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {analysis.images && analysis.images.length > 0 && (
              <div className="ai-section">
                <h3 className="ai-section-title"><Icons.Image /> Images Detected ({analysis.images.length})</h3>
                <div className="ai-images">
                  {analysis.images.map((img, i) => (
                    <div key={img.id || i} className="ai-image-item">
                      <div className="ai-image-header">
                        <span className="ai-image-type">{img.type || 'Unknown'}</span>
                        <span className="ai-image-source">{img.source || 'Unknown'}</span>
                      </div>
                      {img.url && <a href={img.url} target="_blank" rel="noopener noreferrer" className="ai-image-url">{img.url.substring(0, 60)}...</a>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.stats?.keywords && analysis.stats.keywords.length > 0 && (
              <div className="ai-section">
                <h3 className="ai-section-title"><Icons.Keyword /> Top Keywords</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.stats.keywords.map((kw, i) => (
                    <span key={i} style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)', color: '#a5b4fc', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                      {kw.word} <span style={{ opacity: 0.6, fontSize: '11px' }}>×{kw.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="ai-actions">
              <button onClick={() => setActiveTab('chat')} className="ai-chat-btn">
                <Icons.Chat /><span>Consult AI Assistant</span>
              </button>
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && analysis && (
          <div className="ai-chat">
            <div className="ai-chat-header">
              <Icons.Chat />
              <div><h3>AI Assistant</h3><p>Ask anything about "{analysis.fileName || 'your document'}"</p></div>
            </div>
            <div className="ai-chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`ai-message ${msg.type === 'user' ? 'ai-message-user' : 'ai-message-bot'}`}>
                  <div className="ai-message-header">
                    <span>{msg.type === 'user' ? 'You' : 'AI Guardian'}</span>
                    <span className="ai-message-time">{msg.timestamp}</span>
                  </div>
                  <div className="ai-message-text">{msg.message}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="ai-typing"><span>AI is analyzing</span><span className="ai-typing-dots">...</span></div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="ai-chat-input">
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Ask about plagiarism, AI detection, sources..."
                rows="2"
              />
              <button onClick={handleSendMessage} disabled={!chatInput.trim() || chatLoading}>Send</button>
            </div>
            <div className="ai-suggestions">
              {[
                {icon:<Icons.Plagiarism/>,text:'Plagiarism score?'},
                {icon:<Icons.AI/>,text:'AI detection results'},
                {icon:<Icons.Source/>,text:'List all sources'},
                {icon:<Icons.Image/>,text:'Any images?'},
                {icon:<Icons.Keyword/>,text:'Key topics'},
                {icon:<Icons.Statistics/>,text:'Document stats'},
              ].map(({icon,text},i) => (
                <span key={i} onClick={() => setChatInput(text)}>{icon}{text}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSourceModal && selectedSource && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setShowSourceModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="ai-modal" onClick={e => e.stopPropagation()}>
              <div className="ai-modal-header">
                <h3>Source Details</h3>
                <button onClick={() => setShowSourceModal(false)}><Icons.Close /></button>
              </div>
              <div className="ai-modal-content">
                <p><strong>Type:</strong> {selectedSource.type}</p>
                <p><strong>Title:</strong> {selectedSource.title || 'Untitled'}</p>
                {selectedSource.url && <p><strong>URL:</strong> <a href={selectedSource.url.startsWith('http') ? selectedSource.url : `https://${selectedSource.url}`} target="_blank" rel="noopener noreferrer">{selectedSource.url}</a></p>}
                <p><strong>Confidence:</strong> {Math.round(selectedSource.confidence || 0)}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIGuardian;