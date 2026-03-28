import React, { useState } from 'react';
import { Globe, Mic, ArrowRight, Camera, UploadCloud, CheckCircle2 } from 'lucide-react';
import { parseIncidentIntent } from '../../services/geminiService';

export default function CitizenView({ onNewIncident }) {
  const [input, setInput]           = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !fileAttached) return;
    setError('');
    setIsSubmitting(true);

    try {
      const parsed = await parseIncidentIntent(
        input || '[IMAGE Attached] Assumed structural damage — no text provided.'
      );
      onNewIncident(parsed);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setInput(''); setFileAttached(false); }, 6000);
    } catch (err) {
      setError('Transmission failed. Please try again or call emergency services directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="citizen-view" role="region" aria-label="Citizen distress report">
      <div className="citizen-header">
        {/* Landmark h1 — one per page for screen readers */}
        <h1 id="citizen-title">
          RES<span aria-hidden="true" style={{ color: 'var(--md-sys-color-primary)' }}>Q</span>
          <span className="sr-only">RESQ</span>
        </h1>
        <p id="citizen-subtitle">Disaster Response & Relief Request</p>
      </div>

      <div className="citizen-main">
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="zero-friction-input"
            aria-labelledby="citizen-title"
            aria-describedby="citizen-subtitle"
            noValidate
          >
            <div className="lang-selector">
              <Globe size={18} aria-hidden="true" />
              <label htmlFor="lang-select" className="sr-only">Select language</label>
              <select id="lang-select" defaultValue="en" aria-label="Select input language">
                <option value="en">English (Auto-detect)</option>
                <option value="hi">हिंदी</option>
                <option value="es">Español</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>

            <label htmlFor="situation-input" className="sr-only">
              Describe your emergency situation
            </label>
            <textarea
              id="situation-input"
              placeholder="Describe your situation — are you trapped? Need medical help? Supplies?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'form-error' : undefined}
              maxLength={2000}
            />

            {error && (
              <p id="form-error" role="alert" className="form-error" aria-live="assertive">
                {error}
              </p>
            )}

            {fileAttached && (
              <div className="attachment-preview" role="status">
                <UploadCloud size={16} aria-hidden="true" /> 1 Photo Attached
                <button
                  type="button"
                  onClick={() => setFileAttached(false)}
                  aria-label="Remove attached photo"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="input-actions-row">
              <div className="left-actions">
                <button
                  type="button"
                  id="attach-photo-btn"
                  className="action-btn"
                  onClick={() => setFileAttached(true)}
                  disabled={isSubmitting}
                  aria-label="Attach photo of damage or emergency"
                  title="Attach Photo"
                >
                  <Camera size={24} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  id="voice-input-btn"
                  className="action-btn"
                  disabled={isSubmitting}
                  aria-label="Record voice message describing your emergency"
                  title="Voice Input"
                >
                  <Mic size={24} aria-hidden="true" />
                </button>
              </div>
              <button
                type="submit"
                id="submit-alert-btn"
                className="submit-btn"
                disabled={isSubmitting || (!input.trim() && !fileAttached)}
                aria-busy={isSubmitting}
                aria-label={isSubmitting ? 'Transmitting your emergency alert' : 'Send emergency alert to command center'}
              >
                {isSubmitting ? (
                  'Transmitting…'
                ) : (
                  <><ArrowRight size={24} aria-hidden="true" /> Send Alert</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div
            className="success-state"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <CheckCircle2 size={64} className="success-icon" aria-hidden="true" />
            <h2>Alert Transmitted</h2>
            <p>
              Your report has been logged to the Central Command map.
              Responders are routing resources to your location. Stay safe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
