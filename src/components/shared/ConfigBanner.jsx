// ConfigBanner — shows missing service warnings at the top of the app
// Dismissable per session. Only visible in dev/operator view.

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getMissingConfigs, config } from '../../services/config';

export default function ConfigBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded,  setExpanded]  = useState(true);

  const missing = getMissingConfigs();
  const allGood = missing.length === 0;

  // Don't render banner if everything is configured
  if (allGood || dismissed) return null;

  return (
    <aside className="config-banner" role="complementary" aria-label="Service configuration status">
      <div className="config-banner-header">
        <div className="config-banner-title">
          <AlertTriangle size={18} aria-hidden="true" />
          <span>
            {missing.length} service{missing.length > 1 ? 's' : ''} running in simulation mode
          </span>
        </div>
        <div className="config-banner-controls">
          <button
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Collapse configuration details' : 'Expand configuration details'}
            className="config-banner-toggle"
          >
            {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss configuration banner"
            className="config-banner-close"
          >
            <X size={16}/>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="config-banner-body">
          {/* Show what IS working */}
          {config.gemini.isConfigured && (
            <div className="config-item config-ok">
              <CheckCircle2 size={14} aria-hidden="true"/>
              <span><strong>Gemini AI</strong> — Connected. Real intent parsing active.</span>
            </div>
          )}
          {config.firebase.isConfigured && (
            <div className="config-item config-ok">
              <CheckCircle2 size={14} aria-hidden="true"/>
              <span><strong>Firebase</strong> — Connected. Real-time sync & auth active.</span>
            </div>
          )}
          {config.maps.isConfigured && (
            <div className="config-item config-ok">
              <CheckCircle2 size={14} aria-hidden="true"/>
              <span><strong>Google Maps</strong> — Connected. Live tactical map active.</span>
            </div>
          )}
          {config.translate.isConfigured && (
            <div className="config-item config-ok">
              <CheckCircle2 size={14} aria-hidden="true"/>
              <span><strong>Google Translate</strong> — Connected. Auto-translation active.</span>
            </div>
          )}

          {/* Show what's MISSING */}
          {missing.map((item, i) => (
            <div key={i} className="config-item config-missing">
              <AlertTriangle size={14} aria-hidden="true"/>
              <div className="config-item-detail">
                <div className="config-item-header">
                  <strong>{item.service}</strong>
                  <span className="config-item-impact">{item.impact}</span>
                </div>
                {/* Show exactly which keys are missing */}
                {item.keys?.length > 0 && (
                  <div className="config-missing-keys">
                    Missing in <code>.env</code>:&nbsp;
                    {item.keys.map(k => <code key={k} className="key-pill">{k}</code>)}
                  </div>
                )}
                {!item.keys && (
                  <div className="config-missing-keys">
                    Missing in <code>.env</code>: <code className="key-pill">{item.key}</code>
                  </div>
                )}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="config-setup-link"
                  aria-label={`${item.linkText} - opens in new tab`}
                >
                  {item.linkText} <ExternalLink size={12} aria-hidden="true"/>
                </a>
              </div>
            </div>
          ))}

          <p className="config-banner-hint">
            Add keys to <code>.env</code> in the project root, then restart the dev server.
          </p>
        </div>
      )}
    </aside>
  );
}
