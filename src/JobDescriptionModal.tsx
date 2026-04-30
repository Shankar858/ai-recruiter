import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';

export interface JobDescType {
  role: string;
  experienceRequired: string;
  requiredSkills: string[];
  preferredSkills: string[];
  qualifications: string;
}

interface Props {
  jobDesc: JobDescType;
  onSave: (updated: JobDescType) => void;
  onClose: () => void;
}

const JobDescriptionModal: React.FC<Props> = ({ jobDesc, onSave, onClose }) => {
  const [form, setForm] = useState<JobDescType>({ ...jobDesc, requiredSkills: [...jobDesc.requiredSkills], preferredSkills: [...jobDesc.preferredSkills] });
  const [newReq, setNewReq] = useState('');
  const [newPref, setNewPref] = useState('');

  const addSkill = (type: 'requiredSkills' | 'preferredSkills', val: string, clear: () => void) => {
    const v = val.trim();
    if (!v || form[type].includes(v)) return;
    setForm(f => ({ ...f, [type]: [...f[type], v] }));
    clear();
  };

  const removeSkill = (type: 'requiredSkills' | 'preferredSkills', skill: string) =>
    setForm(f => ({ ...f, [type]: f[type].filter(s => s !== skill) }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Job Description</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Job Title</label>
            <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>Minimum Experience</label>
            <input value={form.experienceRequired} onChange={e => setForm(f => ({ ...f, experienceRequired: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>Qualifications</label>
            <textarea rows={2} value={form.qualifications} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} />
          </div>

          <div className="modal-field">
            <label>Required Skills</label>
            <div className="tags" style={{ marginBottom: 8 }}>
              {form.requiredSkills.map(s => (
                <span key={s} className="tag tag-editable">
                  {s} <button onClick={() => removeSkill('requiredSkills', s)}><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="skill-add-row">
              <input placeholder="Add skill & press Enter" value={newReq}
                onChange={e => setNewReq(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('requiredSkills', newReq, () => setNewReq('')); }}} />
              <button className="skill-add-btn" onClick={() => addSkill('requiredSkills', newReq, () => setNewReq(''))}><Plus size={15} /></button>
            </div>
          </div>

          <div className="modal-field">
            <label>Preferred Skills</label>
            <div className="tags" style={{ marginBottom: 8 }}>
              {form.preferredSkills.map(s => (
                <span key={s} className="tag tag-editable tag-pref">
                  {s} <button onClick={() => removeSkill('preferredSkills', s)}><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="skill-add-row">
              <input placeholder="Add skill & press Enter" value={newPref}
                onChange={e => setNewPref(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('preferredSkills', newPref, () => setNewPref('')); }}} />
              <button className="skill-add-btn" onClick={() => addSkill('preferredSkills', newPref, () => setNewPref(''))}><Plus size={15} /></button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => { onSave(form); onClose(); }}>
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionModal;
