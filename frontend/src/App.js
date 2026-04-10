import React, { useState, memo, useEffect, useCallback } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from "chart.js";
import { AuthProvider, useAuth } from './context/AuthContext';
import AIGuardian from './pages/AIGuardian';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import AuthModal from './components/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

ChartJS.register(BarElement, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const API = process.env.REACT_APP_API_URL || 'https://plagiarism-project-hv2v.onrender.com';

function AppContent() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deepMode, setDeepMode] = useState(false);
  const [fullScreenCompare, setFullScreenCompare] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("document-checker");
  const [file1Name, setFile1Name] = useState("");
  const [file2Count, setFile2Count] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const { user, logout, isAuthenticated } = useAuth();

  const handleGetStarted = useCallback((mode) => { 
    setShowAuthModal(true); 
    setAuthModalMode(mode); 
  }, []);
  
  const handleAuthModalClose = useCallback(() => setShowAuthModal(false), []);
  const handleAuthSuccess = useCallback(() => { 
    setShowAuthModal(false); 
  }, []);

  const handleFile1Change = useCallback((e) => { 
    const f = e.target.files[0]; 
    setFile1(f); 
    setFile1Name(f?.name || ""); 
  }, []);
  
  const handleFile2Change = useCallback((e) => { 
    const files = Array.from(e.target.files); 
    setFile2(files); 
    setFile2Count(files.length); 
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file1 || file2.length === 0) { 
      alert("Please select main file and at least one reference file"); 
      return; 
    }
    
    const formData = new FormData();
    formData.append("file1", file1);
    file2.forEach(f => formData.append("file2", f));
    
    try {
      setLoading(true); 
      setResult(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API}/check-plagiarism`, {
        method: "POST", 
        body: formData,
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.status === 401 || response.status === 422) { 
        alert('Session expired. Please login again.'); 
        logout(); 
        return; 
      }
      
      const data = await response.json();
      if (data.error) { 
        alert('Error: ' + data.error); 
        return; 
      }
      
      setResult(data);
      if (data.comparisons?.length > 0) {
        setSelectedComparison(data.comparisons[0]);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally { 
      setLoading(false); 
    }
  }, [file1, file2, logout]);

  const handleDocumentClick = useCallback((item) => { 
    setSelectedComparison(item); 
    setFullScreenCompare(true); 
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthModalClose} 
          mode={authModalMode} 
          onSuccess={handleAuthSuccess} 
        />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={logout} 
        user={user} 
      />
      
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.4 }}
        className={`main-content ${fullScreenCompare ? 'main-content-blur' : ''}`}
      >
        {activePage === "document-checker" && (
          <DocumentCheckerContent
            fullScreenCompare={fullScreenCompare}
            loading={loading}
            result={result}
            file1Name={file1Name}
            file2Count={file2Count}
            handleFile1Change={handleFile1Change}
            handleFile2Change={handleFile2Change}
            handleSubmit={handleSubmit}
            handleDocumentClick={handleDocumentClick}
            setDeepMode={setDeepMode}
            selectedComparison={selectedComparison}
            user={user}
          />
        )}

        {activePage === "future-system" && <AIGuardian user={user} />}
        {activePage === "profile" && (
          <ProfilePage 
            user={user} 
            onUpdateProfile={(updated) => { 
              console.log('Profile updated:', updated); 
            }} 
          />
        )}
      </motion.div>

      <AnimatePresence>
        {fullScreenCompare && selectedComparison && result && (
          <FullScreenComparison 
            selectedComparison={selectedComparison} 
            allComparisons={result.comparisons} 
            onClose={() => setFullScreenCompare(false)} 
            onSwitchDocument={setSelectedComparison} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deepMode && result && (
          <CyberAnalysisPanel 
            result={result} 
            onClose={() => setDeepMode(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Extracted DocumentCheckerContent component for better organization
const DocumentCheckerContent = ({ 
  fullScreenCompare, 
  loading, 
  result, 
  file1Name, 
  file2Count, 
  handleFile1Change, 
  handleFile2Change, 
  handleSubmit, 
  handleDocumentClick, 
  setDeepMode,
  selectedComparison,
  user 
}) => {
  return (
    <>
      {!fullScreenCompare && (
        <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="header">
          <h1 className="header-title">Document to Document Plagiarism Checker</h1>
          <div className="user-avatar-container">
            <div className="user-avatar">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) : 'U'}
            </div>
          </div>
        </motion.div>
      )}

      {!fullScreenCompare && (
        <motion.div 
          initial={{ y: 16, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }} 
          className="upload-card"
        >
          <h2 className="section-title">Upload Documents for Analysis</h2>
          <div className="upload-grid">
            <div className="upload-item">
              <label className="upload-label">Main Document</label>
              <div className="file-input-container">
                <input 
                  type="file" 
                  id="file1" 
                  onChange={handleFile1Change} 
                  className="file-input" 
                  accept=".txt,.pdf,.doc,.docx,.rtf" 
                />
                <label htmlFor="file1" className="file-label">
                  <span>{file1Name || 'Choose main document...'}</span>
                </label>
              </div>
            </div>
            <div className="upload-item">
              <label className="upload-label">Reference Documents</label>
              <div className="file-input-container">
                <input 
                  type="file" 
                  id="file2" 
                  multiple 
                  onChange={handleFile2Change} 
                  className="file-input" 
                  accept=".txt,.pdf,.doc,.docx,.rtf" 
                />
                <label htmlFor="file2" className="file-label">
                  <span>{file2Count ? `${file2Count} reference file(s) selected` : 'Choose reference documents...'}</span>
                </label>
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }} 
            onClick={handleSubmit} 
            className="analyze-btn" 
            disabled={loading}
          >
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <span>Analyzing Documents...</span>
              </div>
            ) : 'Run Plagiarism Analysis'}
          </motion.button>
        </motion.div>
      )}

      {loading && !fullScreenCompare && <LoadingOverlay />}

      {result && result.comparisons && result.comparisons.length > 0 && !fullScreenCompare && (
        <ResultsSection 
          result={result} 
          onDocumentClick={handleDocumentClick} 
          setDeepMode={setDeepMode}
          selectedComparison={selectedComparison}
        />
      )}
    </>
  );
};

const LoadingOverlay = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="loading-overlay">
    <div className="progress-container">
      <div className="progress-bar">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: "100%" }} 
          transition={{ duration: 4, ease: "easeInOut" }} 
          className="progress-fill" 
        />
      </div>
      <p className="progress-text">Processing and comparing documents...</p>
    </div>
  </motion.div>
);

const ResultsSection = ({ result, onDocumentClick, setDeepMode, selectedComparison }) => {
  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: '#6b7280', 
          font: { size: 11 } 
        } 
      },
      tooltip: { 
        backgroundColor: '#ffffff', 
        titleColor: '#1f2937', 
        bodyColor: '#4b5563', 
        padding: 12, 
        cornerRadius: 8, 
        borderColor: '#e5e7eb', 
        borderWidth: 1 
      }
    }
  };

  const barOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        backgroundColor: '#ffffff', 
        titleColor: '#1f2937', 
        bodyColor: '#4b5563', 
        borderColor: '#e5e7eb', 
        borderWidth: 1 
      } 
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        grid: { color: '#f3f4f6' }, 
        ticks: { 
          color: '#6b7280', 
          callback: (v) => v + '%' 
        } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#6b7280' } 
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="metrics-grid">
        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-label">HIGHEST MATCH</span>
            <span className="metric-value" style={{ 
              color: result.highest_match?.score > 60 ? '#ef4444' : result.highest_match?.score > 30 ? '#f59e0b' : '#10b981' 
            }}>
              {result.highest_match?.score || 0}%
            </span>
            <span className="metric-source">{result.highest_match?.filename}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-label">AVERAGE SIMILARITY</span>
            <span className="metric-value">{result.average_similarity || 0}%</span>
            <span className="metric-source">{result.comparisons.length} documents compared</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-label">RISK LEVEL</span>
            <span className="metric-value" style={{ 
              fontSize: '20px', 
              color: result.risk_level?.includes('High') ? '#ef4444' : result.risk_level?.includes('Moderate') ? '#f59e0b' : '#10b981' 
            }}>
              {result.risk_level || 'N/A'}
            </span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-label">AI PROBABILITY</span>
            <span className="metric-value" style={{ 
              color: (result.ai_probability || 0) > 50 ? '#ef4444' : (result.ai_probability || 0) > 30 ? '#f59e0b' : '#10b981' 
            }}>
              {result.ai_probability || 0}%
            </span>
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              className="view-report-btn" 
              onClick={() => setDeepMode(true)}
            >
              View Full Report
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="charts-section">
        <h3 className="charts-title">Analysis Dashboard</h3>
        <div className="charts-grid">
          <div className="chart-card">
            <h4 className="chart-title">Content Distribution</h4>
            <div className="chart-container">
              <Pie 
                data={{ 
                  labels: ['Direct Match', 'Semantic Match', 'Unique Content'], 
                  datasets: [{ 
                    data: [result.highest_match?.direct || 0, result.highest_match?.semantic || 0, result.overall_originality || 0], 
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'], 
                    borderWidth: 0 
                  }] 
                }} 
                options={chartOptions} 
              />
            </div>
          </div>
          <div className="chart-card">
            <h4 className="chart-title">Document Similarity Comparison</h4>
            <div className="chart-container">
              <Bar 
                data={{ 
                  labels: result.comparisons.slice(0,5).map(c => c.filename.length > 14 ? c.filename.substring(0,14) + '...' : c.filename), 
                  datasets: [{ 
                    label: 'Similarity %', 
                    data: result.comparisons.slice(0,5).map(c => c.score), 
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', 
                    borderRadius: 6 
                  }] 
                }} 
                options={barOptions} 
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="table-container">
        <div className="table-header">
          <h3 className="table-title">Comparison Results</h3>
          <span className="table-count">{result.comparisons.length} documents</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Total Match</th>
                <th>Direct</th>
                <th>Semantic</th>
                <th>Unique</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {result.comparisons.map((item, idx) => (
                <motion.tr 
                  key={idx} 
                  initial={{ opacity: 0, x: -16 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.04 }} 
                  onClick={() => onDocumentClick(item)} 
                  style={{ cursor: 'pointer' }}
                >
                  <td><span className="doc-name">{item.filename}</span></td>
                  <td>
                    <span className={`score-badge ${item.score > 50 ? 'score-high' : item.score > 30 ? 'score-medium' : 'score-low'}`}>
                      {item.score}%
                    </span>
                  </td>
                  <td>{item.direct}%</td>
                  <td>{item.semantic}%</td>
                  <td>{item.unique || 0}%</td>
                  <td>
                    <span className={`risk-badge ${item.risk_level === 'High' ? 'risk-high' : item.risk_level === 'Moderate' ? 'risk-medium' : 'risk-low'}`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onDocumentClick(item); 
                      }} 
                      className="compare-btn"
                    >
                      Full Screen
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {selectedComparison && <ComparisonView selectedComparison={selectedComparison} />}
    </AnimatePresence>
  );
};

const FullScreenComparison = ({ selectedComparison, allComparisons, onClose, onSwitchDocument }) => {
  const [activeTab, setActiveTab] = useState('side-by-side');
  const [currentIndex, setCurrentIndex] = useState(
    allComparisons.findIndex(c => c.filename === selectedComparison.filename)
  );
  
  const currentDoc = allComparisons[currentIndex];
  
  const handlePrev = useCallback(() => { 
    if (currentIndex > 0) { 
      const ni = currentIndex - 1; 
      setCurrentIndex(ni); 
      onSwitchDocument(allComparisons[ni]); 
    } 
  }, [currentIndex, allComparisons, onSwitchDocument]);
  
  const handleNext = useCallback(() => { 
    if (currentIndex < allComparisons.length - 1) { 
      const ni = currentIndex + 1; 
      setCurrentIndex(ni); 
      onSwitchDocument(allComparisons[ni]); 
    } 
  }, [currentIndex, allComparisons, onSwitchDocument]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fullscreen-overlay" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.97, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.97, opacity: 0 }} 
        className="fullscreen-container" 
        onClick={e => e.stopPropagation()}
      >
        <div className="fullscreen-header">
          <div className="fullscreen-header-left">
            <h2 className="fullscreen-title">Document Comparison</h2>
            <div className="fullscreen-document-info">
              <span className="fullscreen-document-count">{currentIndex + 1} / {allComparisons.length}</span>
              <span className="fullscreen-document-name">{currentDoc.filename}</span>
            </div>
          </div>
          <div className="fullscreen-header-right">
            <div className="fullscreen-stats">
              <div className="fullscreen-stat">
                <span className="fullscreen-stat-label">Similarity</span>
                <span className="fullscreen-stat-value" style={{ 
                  color: currentDoc.score > 50 ? '#ef4444' : currentDoc.score > 30 ? '#f59e0b' : '#10b981' 
                }}>
                  {currentDoc.score}%
                </span>
              </div>
              <div className="fullscreen-stat">
                <span className="fullscreen-stat-label">Risk</span>
                <span className="fullscreen-stat-value" style={{ 
                  color: currentDoc.risk_level === 'High' ? '#ef4444' : currentDoc.risk_level === 'Moderate' ? '#f59e0b' : '#10b981' 
                }}>
                  {currentDoc.risk_level}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="fullscreen-close-btn">✕</button>
          </div>
        </div>
        
        <div className="fullscreen-tabs">
          {['side-by-side', 'main-only', 'reference-only'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`fullscreen-tab ${activeTab === tab ? 'fullscreen-tab-active' : ''}`}
            >
              {tab === 'side-by-side' ? 'Side by Side' : tab === 'main-only' ? 'Main Document' : 'Reference Only'}
            </button>
          ))}
        </div>
        
        <div className="fullscreen-navigation">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className={`fullscreen-nav-btn ${currentIndex === 0 ? 'fullscreen-nav-btn-disabled' : ''}`}
          >
            ← Previous
          </button>
          <button 
            onClick={handleNext} 
            disabled={currentIndex === allComparisons.length - 1} 
            className={`fullscreen-nav-btn ${currentIndex === allComparisons.length - 1 ? 'fullscreen-nav-btn-disabled' : ''}`}
          >
            Next →
          </button>
        </div>
        
        <div className="fullscreen-content">
          {activeTab === 'side-by-side' && (
            <div className="fullscreen-split-view">
              <div className="fullscreen-split-left">
                <div className="fullscreen-split-header"><h3>Main Document</h3></div>
                <div 
                  className="fullscreen-document-viewer" 
                  dangerouslySetInnerHTML={{ 
                    __html: currentDoc.highlighted_main || '<p style="color:#6b7280;">No content available</p>' 
                  }} 
                />
              </div>
              <div className="fullscreen-split-right">
                <div className="fullscreen-split-header"><h3>{currentDoc.filename}</h3></div>
                <div 
                  className="fullscreen-document-viewer" 
                  dangerouslySetInnerHTML={{ 
                    __html: currentDoc.highlighted_ref || '<p style="color:#6b7280;">No content available</p>' 
                  }} 
                />
              </div>
            </div>
          )}
          
          {activeTab === 'main-only' && (
            <div className="fullscreen-single-view">
              <div className="fullscreen-single-header"><h3>Main Document</h3></div>
              <div 
                className="fullscreen-document-viewer" 
                dangerouslySetInnerHTML={{ 
                  __html: currentDoc.highlighted_main || '<p>No content</p>' 
                }} 
              />
            </div>
          )}
          
          {activeTab === 'reference-only' && (
            <div className="fullscreen-single-view">
              <div className="fullscreen-single-header"><h3>{currentDoc.filename}</h3></div>
              <div 
                className="fullscreen-document-viewer" 
                dangerouslySetInnerHTML={{ 
                  __html: currentDoc.highlighted_ref || '<p>No content</p>' 
                }} 
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const ComparisonView = memo(({ selectedComparison }) => {
  if (!selectedComparison) return null;
  
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="comparison-container">
      <h3 className="comparison-title">
        Document Preview — {selectedComparison.filename} ({selectedComparison.score}% match)
      </h3>
      <div className="comparison-grid">
        <div className="comparison-card">
          <div className="comparison-card-header">Main Document</div>
          <div 
            className="comparison-content" 
            dangerouslySetInnerHTML={{ 
              __html: selectedComparison.highlighted_main || '<p style="color:#6b7280;">No content</p>' 
            }} 
          />
        </div>
        <div className="comparison-card">
          <div className="comparison-card-header">{selectedComparison.filename}</div>
          <div 
            className="comparison-content" 
            dangerouslySetInnerHTML={{ 
              __html: selectedComparison.highlighted_ref || '<p style="color:#6b7280;">No content</p>' 
            }} 
          />
        </div>
      </div>
    </motion.div>
  );
});

const CyberAnalysisPanel = ({ result, onClose }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const end = result.highest_match?.score || 0;
    let start = 0;
    const inc = end / 50;
    const timer = setInterval(() => { 
      start += inc; 
      if (start >= end) { 
        setAnimatedScore(end); 
        clearInterval(timer); 
      } else { 
        setAnimatedScore(Math.floor(start)); 
      } 
    }, 20);
    return () => clearInterval(timer);
  }, [result]);

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: '#6b7280', 
          font: { size: 11 } 
        } 
      },
      tooltip: { 
        backgroundColor: '#ffffff', 
        titleColor: '#1f2937', 
        bodyColor: '#4b5563', 
        padding: 12, 
        cornerRadius: 8, 
        borderColor: '#e5e7eb', 
        borderWidth: 1 
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="modal-overlay" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.92, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.92, opacity: 0 }} 
        className="modal-container" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Deep Analysis Report</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-content">
          <div className="modal-score-section">
            <div className="modal-score-circle">
              <span className="modal-score-number">{animatedScore}%</span>
            </div>
            <p className="modal-score-label">Peak Similarity Score</p>
          </div>
          <div className="modal-metrics-grid">
            <div className="modal-metric-item">
              <span className="modal-metric-label">Originality</span>
              <span className="modal-metric-value">{result.overall_originality || 0}%</span>
            </div>
            <div className="modal-metric-item">
              <span className="modal-metric-label">AI Probability</span>
              <span className="modal-metric-value" style={{ 
                color: (result.ai_probability || 0) > 50 ? '#ef4444' : (result.ai_probability || 0) > 30 ? '#f59e0b' : '#10b981' 
              }}>
                {result.ai_probability || 0}%
              </span>
            </div>
            <div className="modal-metric-item">
              <span className="modal-metric-label">Documents</span>
              <span className="modal-metric-value">{result.comparisons?.length || 0}</span>
            </div>
          </div>
          <div className="modal-chart-container">
            <h4 className="modal-chart-title">Content Distribution</h4>
            <div className="modal-chart-wrapper">
              <Pie 
                data={{ 
                  labels: ['Direct Match', 'Semantic Match', 'Unique Content'], 
                  datasets: [{ 
                    data: [result.highest_match?.direct || 0, result.highest_match?.semantic || 0, result.overall_originality || 0], 
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'], 
                    borderWidth: 0 
                  }] 
                }} 
                options={chartOptions} 
              />
            </div>
          </div>
          <div className="modal-factors-container">
            <h4 className="modal-factors-title">Risk Factors</h4>
            <div className="modal-factors-list">
              {result.risk_level?.includes('High') && (
                <div className="modal-factor">
                  <span className="modal-factor-bullet">●</span>
                  <span>High plagiarism risk detected ({result.highest_match?.score}%)</span>
                </div>
              )}
              {(result.highest_match?.direct || 0) > 20 && (
                <div className="modal-factor">
                  <span className="modal-factor-bullet">●</span>
                  <span>Direct content matches: {result.highest_match?.direct}%</span>
                </div>
              )}
              {(result.ai_probability || 0) > 30 && (
                <div className="modal-factor">
                  <span className="modal-factor-bullet">●</span>
                  <span>AI-generated content detected ({result.ai_probability}%)</span>
                </div>
              )}
              {(result.overall_originality || 0) > 80 && (
                <div className="modal-factor">
                  <span className="modal-factor-bullet" style={{ color: '#10b981' }}>●</span>
                  <span style={{ color: '#10b981' }}>High originality score ({result.overall_originality}%) — Good!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, activePage, setActivePage, onLogout, user }) => (
  <motion.div 
    animate={{ width: sidebarOpen ? 260 : 72 }} 
    transition={{ duration: 0.2 }} 
    className="sidebar-container"
  >
    <div className="sidebar-header">
      <motion.div animate={{ opacity: sidebarOpen ? 1 : 0 }} className="sidebar-logo">
        {sidebarOpen ? 'PlagiGuard' : ''}
      </motion.div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle">
        {sidebarOpen ? '←' : '→'}
      </button>
    </div>
    <div className="sidebar-menu">
      {[
        { key: 'document-checker', label: 'Document Checker' },
        { key: 'future-system', label: 'AI Guardian' },
        { key: 'profile', label: 'Profile' },
      ].map(({ key, label }) => (
        <SidebarItem 
          key={key} 
          label={label} 
          active={activePage === key} 
          onClick={() => setActivePage(key)} 
          open={sidebarOpen} 
        />
      ))}
    </div>
    <div className="sidebar-footer">
      <SidebarItem label="Logout" onClick={onLogout} open={sidebarOpen} />
    </div>
  </motion.div>
);

const SidebarItem = ({ label, active, onClick, open }) => (
  <motion.div 
    whileHover={{ x: 2 }} 
    onClick={onClick}
    className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
  >
    <span style={{ fontSize: '16px', flexShrink: 0 }}>{label.charAt(0)}</span>
    {open && <span className="sidebar-item-label">{label.substring(1)}</span>}
  </motion.div>
);

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;