import React, { useState } from 'react';
import { Globe, Mic, ArrowRight, Camera, UploadCloud, CheckCircle2, Languages } from 'lucide-react';
import { parseIncidentIntent } from '../../services/geminiService';
import { translateToEnglish, LANGUAGE_NAMES } from '../../services/translateService';
import config from '../../services/config';

export default function CitizenView({ onNewIncident }) {
  const [input, setInput]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [error, setError]               = useState('');
  const [translationInfo, setTranslationInfo] = useState(null); // { from, wasTranslated }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !fileAttached) return;
    setError('');
    setTranslationInfo(null);
    setIsSubmitting(true);

    try {
      let textToProcess  = input || '[IMAGE Attached] Assumed structural damage.';
      let langInfo       = null;

      // ── Google Translate: auto-detect & translate to English ───
      if (config.translate.isConfigured && input.trim()) {
        const { translatedText, detectedLanguage, wasTranslated } = await translateToEnglish(input);
        textToProcess = translatedText;
        langInfo = { from: detectedLanguage, wasTranslated };
        if (wasTranslated) setTranslationInfo(langInfo);
      }

      // ── Gemini: parse the (now English) distress signal ────────
      const parsed = await parseIncidentIntent(textToProcess);

      // Attach language metadata for the operator feed
      if (langInfo?.wasTranslated) {
        parsed.language_detected = langInfo.from;
        parsed.source += ` (Translated from ${LANGUAGE_NAMES[langInfo.from] || langInfo.from})`;
      }

      onNewIncident(parsed);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setInput(''); setFileAttached(false); setTranslationInfo(null); }, 6000);
    } catch (err) {
      setError('Transmission failed. Please try again or call emergency services directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="citizen-view" role="region" aria-label="Citizen distress report">
      <div className="citizen-header">
        <h1 id="citizen-title">
          RES<span style={{ color: 'var(--md-sys-color-primary)' }}>Q</span>
          <span className="sr-only">RESQ</span>
        </h1>
        <p id="citizen-subtitle">Disaster Response &amp; Relief Request</p>
        {config.translate.isConfigured && (
          <div className="translate-badge" aria-label="Auto-translation enabled">
            <Languages size={13} aria-hidden="true" /> Auto-translation active
          </div>
        )}
      </div>

      <div className="citizen-main">
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="zero-friction-input"
            aria-labelledby="citizen-title"
            noValidate
          >
            {/* Language selector UI */}
            <div className="lang-selector">
              <Globe size={18} aria-hidden="true" />
              <label htmlFor="lang-select" className="sr-only">Select language</label>
              <select id="lang-select" defaultValue="auto" aria-label="Select input language">
                <option value="auto">Any language — auto detect</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="es">Español (Spanish)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="fr">Français (French)</option>
              </select>
            </div>

            <label htmlFor="situation-input" className="sr-only">Describe your emergency situation</label>
            <textarea
              id="situation-input"
              placeholder="Describe your situation in any language — trapped? Need medical help? Evacuation?"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'form-error' : undefined}
              maxLength={2000}
            />

            {/* Auto-translation preview */}
            {translationInfo?.wasTranslated && (
              <div className="translation-notice" role="status" aria-live="polite">
                <Languages size={14} aria-hidden="true" />
                Translated from <strong>{LANGUAGE_NAMES[translationInfo.from] || translationInfo.from}</strong> to English for processing
              </div>
            )}

            {error && (
              <p id="form-error" role="alert" className="form-error" aria-live="assertive">{error}</p>
            )}

            {fileAttached && (
              <div className="attachment-preview" role="status">
                <UploadCloud size={16} aria-hidden="true" /> 1 Photo Attached
                <button type="button" onClick={() => setFileAttached(false)} aria-label="Remove attached photo">Remove</button>
              </div>
            )}

            <div className="input-actions-row">
              <div className="left-actions">
                <button type="button" id="attach-photo-btn" className="action-btn"
                  onClick={() => setFileAttached(true)} disabled={isSubmitting}
                  aria-label="Attach photo of damage or emergency" title="Attach Photo">
                  <Camera size={24} aria-hidden="true" />
                </button>
                <button type="button" id="voice-input-btn" className="action-btn"
                  disabled={isSubmitting} aria-label="Record voice message" title="Voice Input">
                  <Mic size={24} aria-hidden="true" />
                </button>
              </div>
              <button type="submit" id="submit-alert-btn" className="submit-btn"
                disabled={isSubmitting || (!input.trim() && !fileAttached)}
                aria-busy={isSubmitting}
                aria-label={isSubmitting ? 'Transmitting alert' : 'Send emergency alert to command center'}>
                {isSubmitting ? 'Transmitting…' : <><ArrowRight size={24} aria-hidden="true" /> Send Alert</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-state" role="status" aria-live="polite" aria-atomic="true">
            <CheckCircle2 size={64} className="success-icon" aria-hidden="true" />
            <h2>Alert Transmitted</h2>
            <p>Your report has been logged to the Central Command map. Responders are routing resources to your location. Stay safe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
