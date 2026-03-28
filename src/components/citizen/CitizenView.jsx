import React, { useState } from 'react';
import { Globe, Mic, ArrowRight, Camera, UploadCloud, CheckCircle2 } from 'lucide-react';
import { parseIncidentIntent } from '../../services/geminiService';

export default function CitizenView({ onNewIncident }) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !fileAttached) return;
    setIsSubmitting(true);
    
    try {
      // Simulate/Run the backend parser against the user's raw string
      const parsedData = await parseIncidentIntent(
        input || "[IMAGE Attached without Context] Assumed structural damage."
      );
      
      onNewIncident(parsedData); // Push to universal state
      
      setSubmitted(true);
      setTimeout(() => { 
        setSubmitted(false); 
        setInput(''); 
        setFileAttached(false);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="citizen-view">
      <div className="citizen-header">
        <h1>RES<span style={{color:'var(--nexus-accent)'}}>Q</span></h1>
        <p>Disaster Response & Relief Request</p>
      </div>

      <div className="citizen-main">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="zero-friction-input">
            <div className="lang-selector">
              <Globe size={18} />
              <select defaultValue="en">
                <option value="en">English (Auto-detect)</option>
                <option value="es">Español</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>
            
            <textarea 
              placeholder="Describe your situation. Are you trapped? Do you need medical supplies or evacuation?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSubmitting}
            />

            {fileAttached && (
              <div className="attachment-preview">
                <UploadCloud size={16} /> 1 Photo Attached
                <button type="button" onClick={() => setFileAttached(false)}>Remove</button>
              </div>
            )}

            <div className="input-actions-row">
              <div className="left-actions">
                <button type="button" className="action-btn" onClick={() => setFileAttached(true)} disabled={isSubmitting} title="Upload Photo of Damage">
                  <Camera size={24} />
                </button>
                <button type="button" className="action-btn" disabled={isSubmitting} title="Voice Note">
                  <Mic size={24} />
                </button>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting || (!input.trim() && !fileAttached)}>
                {isSubmitting ? 'Transmitting...' : <><ArrowRight size={24} /> Send Alert</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-state">
            <CheckCircle2 size={64} className="success-icon" />
            <h2>Alert Transmitted</h2>
            <p>Your coordinates and situation have been logged to the Central Command map. Stay safe, responders are managing routing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
