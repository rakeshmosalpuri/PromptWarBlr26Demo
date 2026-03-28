import React, { useState } from 'react';
import { Globe, Mic, ArrowRight, Camera, UploadCloud, CheckCircle2, Languages, PlusSquare, Database, Truck } from 'lucide-react';
import { parseIncidentIntent } from '../../services/geminiService';
import { translateToEnglish, LANGUAGE_NAMES } from '../../services/translateService';
import config from '../../services/config';

export default function CitizenView({ onNewIncident }) {
  const [input, setInput]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [error, setError]               = useState('');
  const [translationInfo, setTranslationInfo] = useState(null);
  const [ingestMode, setIngestMode]     = useState('citizen'); // citizen, medical, technical, traffic

  const MODES = [
    { id: 'citizen', label: 'Distress',  icon: <Mic size={18}/> },
    { id: 'medical', label: 'Medical',   icon: <PlusSquare size={18}/> },
    { id: 'technical', label: 'Feeds/Logs', icon: <Database size={18}/> },
    { id: 'traffic', label: 'Logistic',  icon: <Truck size={18}/> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !fileAttached) return;
    setError('');
    setTranslationInfo(null);
    setIsSubmitting(true);

    try {
      let textToProcess  = input || '[IMAGE Ingested] Universal sensor data.';
      let langInfo       = null;

      // ── Google Translate ───
      if (config.translate.isConfigured && input.trim()) {
        const { translatedText, detectedLanguage, wasTranslated } = await translateToEnglish(input);
        textToProcess = translatedText;
        langInfo = { from: detectedLanguage, wasTranslated };
        if (wasTranslated) setTranslationInfo(langInfo);
      }

      // ── Gemini ────────
      const parsed = await parseIncidentIntent(textToProcess, ingestMode);

      if (langInfo?.wasTranslated) {
        parsed.language_detected = langInfo.from;
        parsed.source += ` (Translated from ${LANGUAGE_NAMES[langInfo.from] || langInfo.from})`;
      }

      onNewIncident(parsed);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setInput(''); setFileAttached(false); setTranslationInfo(null); }, 6000);
    } catch (err) {
      setError('Transmission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="citizen-view" role="region" aria-label="Universal NEXUS Ingest">
      <div className="citizen-header">
        <h1 id="citizen-title">
          NEX<span style={{ color: 'var(--md-sys-color-primary)' }}>US</span>
          <span className="sr-only">RESQ NEXUS</span>
        </h1>
        <p id="citizen-subtitle">Universal Logistics Ingest Portal</p>
      </div>

      <div className="citizen-main">
        <div className="ingest-mode-selector" role="radiogroup" aria-label="Ingest data type">
          {MODES.map(m => (
            <button 
              key={m.id}
              type="button" 
              className={`mode-btn ${ingestMode === m.id ? 'active' : ''}`}
              onClick={() => setIngestMode(m.id)}
              aria-checked={ingestMode === m.id}
              role="radio"
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="zero-friction-input" noValidate>
            <div className="lang-selector">
              <Globe size={18} aria-hidden="true" />
              <select id="lang-select" defaultValue="auto" aria-label="Select input language">
                <option value="auto">Auto detect language</option>
                <option value="hi">हिंदी (Hindi)</option>
                {/* ... other options same as before ... */}
              </select>
            </div>

            <textarea
              id="situation-input"
              placeholder={`Upload or describe ${ingestMode === 'medical' ? 'medical history' : ingestMode === 'technical' ? 'sensor data/logs' : 'your situation'}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isSubmitting}
              aria-required="true"
              maxLength={2000}
            />

            {translationInfo?.wasTranslated && (
              <div className="translation-notice" role="status">
                <Languages size={14} aria-hidden="true" /> Translated from {LANGUAGE_NAMES[translationInfo.from]}
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="input-actions-row">
              <div className="left-actions">
                <button type="button" className="action-btn" onClick={() => setFileAttached(true)} disabled={isSubmitting}>
                  <Camera size={24} />
                </button>
                <button type="button" className="action-btn" disabled={isSubmitting}>
                  <Mic size={24} />
                </button>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting || (!input.trim() && !fileAttached)}>
                {isSubmitting ? 'Processing...' : <><ArrowRight size={24} /> Process {ingestMode === 'citizen' ? 'Alert' : 'Data'}</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-state">
            <CheckCircle2 size={64} className="success-icon" />
            <h2>Data Ingested</h2>
            <p>The unstructured data has been resolved into tactical logistics for Command HQ.</p>
          </div>
        )}
      </div>
    </div>
  );
}
