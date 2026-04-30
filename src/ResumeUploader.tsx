import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, Zap, Trash2, AlertCircle } from 'lucide-react';
import type { Candidate } from './data';
import type { ParsedJobDesc } from './resumeParser';
import { extractText, parseCandidate } from './resumeParser';

const MAX_FILES = 50;

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'analyzing' | 'done' | 'error';
  errorMsg?: string;
}

interface Props {
  jobDesc: ParsedJobDesc;
  onClose: () => void;
  onAnalyze: (candidates: Candidate[]) => void;
}

const fmt = (b: number) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

const ResumeUploader: React.FC<Props> = ({ jobDesc, onClose, onAnalyze }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [parsedCandidates, setParsedCandidates] = useState<Candidate[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fl: FileList | null) => {
    if (!fl) return;
    const valid = Array.from(fl).filter(
      f =>
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.pdf') ||
        f.name.toLowerCase().endsWith('.docx') ||
        f.name.toLowerCase().endsWith('.doc')
    );
    setFiles(prev => {
      const slots = MAX_FILES - prev.length;
      return [
        ...prev,
        ...valid.slice(0, slots).map(f => ({
          id: `${f.name}-${Math.random()}`,
          file: f,
          name: f.name,
          size: f.size,
          status: 'pending' as const,
        })),
      ];
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const setStatus = (id: string, status: UploadedFile['status'], errorMsg?: string) =>
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, status, errorMsg } : f)));

  const runAnalysis = async () => {
    setAnalyzing(true);
    const results: Candidate[] = [];

    for (let i = 0; i < files.length; i++) {
      const uf = files[i];
      setStatus(uf.id, 'analyzing');
      try {
        const text = await extractText(uf.file);
        const candidate = parseCandidate(text, i + 1, uf.name, jobDesc);
        
        if (!candidate.isLikelyResume) {
          setStatus(uf.id, 'error', 'Irrelevant Doc: Not a Resume');
        } else {
          results.push(candidate);
          setStatus(uf.id, 'done');
        }
      } catch {
        setStatus(uf.id, 'error', 'Failed to parse file');
      }
    }

    // Sort by totalScore descending & re-assign categories by rank
    results.sort((a, b) => b.totalScore - a.totalScore);
    const ranked = results.map((c, idx) => ({
      ...c,
      category: (
        idx < 10 ? '⭐ Top 10' :
        idx < 25 ? '👍 Next 15' :
        idx < 40 ? '🤝 Middle 15' :
        '⚠ Bottom 10'
      ) as Candidate['category'],
    }));

    setParsedCandidates(ranked);
    setAnalyzing(false);
    setDone(true);
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="modal-overlay" onClick={!analyzing ? onClose : undefined}>
      <div className="modal-box uploader-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Resume Upload Center</h2>
          {!analyzing && (
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="upload-counter">
          <span className={files.length >= MAX_FILES ? 'counter-full' : ''}>
            {files.length} / {MAX_FILES} resumes
          </span>
          <div className="counter-track">
            <div
              className="counter-fill"
              style={{ width: `${(files.length / MAX_FILES) * 100}%` }}
            />
          </div>
        </div>

        {done ? (
          <div className="upload-success">
            <CheckCircle size={60} style={{ color: '#10b981' }} />
            <h3>Analysis Complete!</h3>
            <p>
              Successfully analyzed <strong>{doneCount} resume{doneCount !== 1 ? 's' : ''}</strong>
              {errorCount > 0 && ` (${errorCount} failed)`}.
              Rankings have been updated with your real candidates.
            </p>
            <button
              className="btn-primary"
              onClick={() => { onAnalyze(parsedCandidates); onClose(); }}
            >
              View Rankings →
            </button>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              className={`drop-zone ${dragging ? 'drop-active' : ''} ${files.length >= MAX_FILES ? 'drop-full' : ''}`}
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => files.length < MAX_FILES && inputRef.current?.click()}
            >
              <Upload size={36} className="drop-icon" />
              {files.length >= MAX_FILES ? (
                <p style={{ color: 'var(--accent-blue)' }}>Maximum 50 resumes reached</p>
              ) : (
                <>
                  <p>
                    Drag & drop resumes or{' '}
                    <span className="drop-link">browse files</span>
                  </p>
                  <p className="drop-sub">PDF, DOC, DOCX • Max {MAX_FILES} files</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="file-list">
                {files.map(f => (
                  <div key={f.id} className={`file-row file-status-${f.status}`}>
                    <FileText size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                    <div className="file-meta">
                      <span className="file-name">{f.name}</span>
                      <span className="file-size">{fmt(f.size)}</span>
                    </div>
                    <div className="file-badge">
                      {f.status === 'pending' && <span>Queued</span>}
                      {f.status === 'analyzing' && <span className="pulse-text">Analyzing…</span>}
                      {f.status === 'done' && <CheckCircle size={15} style={{ color: '#10b981' }} />}
                      {f.status === 'error' && (
                        <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                          <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {f.errorMsg || 'Error'}
                        </span>
                      )}
                    </div>
                    {!analyzing && (
                      <button
                        className="file-del"
                        onClick={() => setFiles(p => p.filter(x => x.id !== f.id))}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="modal-footer">
              {!analyzing && (
                <button className="btn-secondary" onClick={() => setFiles([])}>
                  Clear All
                </button>
              )}
              {analyzing && (
                <div className="analyze-progress">
                  <div className="analyze-bar">
                    <div
                      className="analyze-fill"
                      style={{ width: `${((doneCount + errorCount) / files.length) * 100}%` }}
                    />
                  </div>
                  <span>{doneCount + errorCount}/{files.length}</span>
                </div>
              )}
              <button
                className="btn-primary"
                disabled={files.length === 0 || analyzing}
                onClick={runAnalysis}
              >
                <Zap size={15} />
                {analyzing
                  ? `Analyzing ${doneCount + errorCount}/${files.length}…`
                  : `Analyze ${files.length} Resume${files.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
