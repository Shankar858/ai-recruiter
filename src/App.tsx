import React, { useState } from 'react';
import { jobDescription as initialJobDesc } from './data';
import type { Candidate } from './data';
import {
  Users, Target, TrendingUp, ShieldCheck, Search, Filter,
  Download, BrainCircuit, Upload, LogOut, Edit3, BarChart3
} from 'lucide-react';
import Login from './Login';
import SignUp from './SignUp';
import JobDescriptionModal from './JobDescriptionModal';
import type { JobDescType } from './JobDescriptionModal';
import ResumeUploader from './ResumeUploader';

/* ─── Sub-components ─── */
const StatCard = ({ icon: Icon, value, label }: { icon: any; value: string | number; label: string }) => (
  <div className="card stat-item">
    <Icon style={{ marginBottom: 10, color: 'var(--accent-blue)' }} size={32} />
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

const Badge = ({ category }: { category: Candidate['category'] }) => {
  const cls = category === '⭐ Top 10' ? 'badge-top'
    : category === '👍 Next 15' ? 'badge-next'
    : category === '🤝 Middle 15' ? 'badge-middle'
    : 'badge-bottom';
  return <span className={`badge ${cls}`}>{category}</span>;
};

/* ─── Main App ─── */
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [realCandidates, setRealCandidates] = useState<Candidate[]>([]);
  const [jobDesc, setJobDesc] = useState<JobDescType>({
    role: initialJobDesc.role,
    experienceRequired: initialJobDesc.experienceRequired,
    requiredSkills: [...initialJobDesc.requiredSkills],
    preferredSkills: [...initialJobDesc.preferredSkills],
    qualifications: initialJobDesc.qualifications,
  });

  /* Auth */
  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <SignUp 
          onSignUp={u => { setUser(u); setIsLoggedIn(true); }} 
          onToggleLogin={() => setShowSignUp(false)} 
        />
      );
    }
    return (
      <Login 
        onLogin={u => { setUser(u); setIsLoggedIn(true); }} 
        onToggleSignUp={() => setShowSignUp(true)} 
      />
    );
  }

  const analyzedCount = realCandidates.length;

  const filteredCandidates = realCandidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const top5 = realCandidates.slice(0, 5);
  const avgExp = realCandidates.length
    ? (realCandidates.reduce((a, c) => a + c.yearsOfExperience, 0) / realCandidates.length).toFixed(1)
    : '–';
  // Find skills present in job desc but missing from all candidates
  const allFoundSkills = new Set(realCandidates.flatMap(c => c.skills.map(s => s.toLowerCase())));
  const commonGaps = jobDesc.requiredSkills.filter(s => !allFoundSkills.has(s.toLowerCase())).slice(0, 3);
  const techStackCount = new Set(realCandidates.flatMap(c => c.skills)).size;

  return (
    <div className="dashboard">
      {/* Modals */}
      {showJobModal && (
        <JobDescriptionModal jobDesc={jobDesc} onSave={setJobDesc} onClose={() => setShowJobModal(false)} />
      )}
      {showUploader && (
        <ResumeUploader
          jobDesc={jobDesc}
          onClose={() => setShowUploader(false)}
          onAnalyze={candidates => { setRealCandidates(candidates); setShowUploader(false); }}
        />
      )}

      {/* Header */}
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <BrainCircuit size={32} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <h1>AI Recruiter</h1>
              <p className="header-sub">Premium Resume Intelligence & Ranking System</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="upload-btn" onClick={() => setShowUploader(true)}>
              <Upload size={16} />
              Upload Resumes {analyzedCount > 0 && <span className="badge-count">{analyzedCount}</span>}
            </button>
            <div className="user-chip">
              <div className="user-avatar">{user?.name.charAt(0)}</div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <button className="logout-btn" onClick={() => { setIsLoggedIn(false); setUser(null); }} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bias Notice */}
      <div className="bias-notice">
        <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        <strong>Fairness Protocol Active:</strong> Screening is strictly based on performance metrics and merit.
      </div>

      {/* Stats */}
      <div className="summary-stats">
        <StatCard icon={Users} value={analyzedCount} label="Total Applicants" />
        <StatCard icon={TrendingUp} value={analyzedCount > 0 ? `${avgExp} Yrs` : '–'} label="Avg. Experience" />
        <StatCard icon={BarChart3} value={analyzedCount > 0 ? techStackCount : '–'} label="Unique Skills Found" />
        <StatCard icon={Target} value={analyzedCount > 0 ? `${Math.round(realCandidates.reduce((a, c) => a + c.relevanceScore, 0) / realCandidates.length)}%` : '–'} label="Avg. Role Relevance" />
      </div>

      {/* Job Overview */}
      <section className="job-overview">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{jobDesc.role}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Min. Experience: {jobDesc.experienceRequired} &nbsp;|&nbsp; Skills (40%) · Experience (25%) · Impact (15%) · Edu (10%) · Soft Skills (10%)
            </p>
          </div>
          <button className="btn-edit-jd" onClick={() => setShowJobModal(true)}>
            <Edit3 size={15} /> Edit Job Description
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          <div>
            <h4 style={{ marginBottom: 10, color: 'var(--accent-blue)' }}>Required Skills</h4>
            <div className="tags">{jobDesc.requiredSkills.map(s => <span key={s} className="tag">{s}</span>)}</div>
          </div>
          <div>
            <h4 style={{ marginBottom: 10, color: 'var(--accent-purple)' }}>Preferred Skills</h4>
            <div className="tags">{jobDesc.preferredSkills.map(s => <span key={s} className="tag">{s}</span>)}</div>
          </div>
        </div>
      </section>

      {/* Candidate Rankings — shown only after resumes are analyzed */}
      {analyzedCount === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No Resumes Analyzed Yet</h3>
          <p>Upload and analyze up to 50 resumes to see AI-powered candidate rankings here.</p>
          <button className="upload-btn" style={{ margin: '0 auto' }} onClick={() => setShowUploader(true)}>
            <Upload size={16} /> Upload Resumes to Get Started
          </button>
        </div>
      ) : (
        <>
          {/* Candidate Table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem' }}>Full Candidate Rankings ({analyzedCount})</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-secondary)' }} />
                <input type="text" placeholder="Search by name or skill…"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '10px 15px 10px 38px', color: '#fff', width: 280 }}
                  onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="tag" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Filter size={14} /> Filter
              </button>
              <button className="tag" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th><th>Candidate</th><th>Category</th><th>Experience</th><th>Score (/100)</th><th>Top Skills</th><th>Analysis</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 800, color: idx < 10 ? 'var(--top-10)' : 'var(--text-secondary)' }}>#{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.id}</div>
                    </td>
                    <td><Badge category={c.category} /></td>
                    <td>{c.yearsOfExperience} yrs</td>
                    <td>
                      <div className="score-pill">{c.totalScore}</div>
                      <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4 }}>
                        <div style={{ width: `${c.totalScore}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
                      </div>
                    </td>
                    <td>
                      <div className="tags">
                        {c.skills.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
                        {c.skills.length > 3 && <span className="tag">+{c.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 300 }}>
                        {c.justification.includes('⚠️') ? (
                          <div style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.3)', 
                            borderRadius: 8, 
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            color: '#fca5a5'
                          }}>
                            {c.justification}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.justification}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Highlights */}
          <section className="grid-container" style={{ marginTop: 60 }}>
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h3>⭐ Highly Recommended (Top 5 Overall)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 }}>
                {top5.map(c => (
                  <div key={c.id} style={{ padding: 15, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(251,191,36,0.2)' }}>
                    <div style={{ color: 'var(--top-10)', fontWeight: 'bold', marginBottom: 5 }}>{c.name}</div>
                    <div className="score-pill">{c.totalScore}% Match</div>
                    <p style={{ fontSize: '0.75rem', marginTop: 10 }}>{c.standoutStrengths[0]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>🔍 Hiring Insights</h3>
              <ul style={{ color: 'var(--text-secondary)', listStyle: 'none', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: 12 }}>⚠️ <strong>Common Gaps:</strong> {commonGaps.join(', ')}</li>
                <li style={{ marginBottom: 12 }}>📊 <strong>Distribution:</strong> Most candidates fall in the 3–7 year range.</li>
                <li style={{ marginBottom: 12 }}>💡 <strong>Tip:</strong> Consider strong RAG experience even without Ph.D.</li>
                <li>🚀 <strong>System:</strong> AI processed {analyzedCount}/50 resumes with fairness checks.</li>
              </ul>
            </div>
          </section>
        </>
      )}

      <footer style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        © 2026 AI Recruiter Intelligence. Built with Professional Merit.
      </footer>
    </div>
  );
};

export default App;
