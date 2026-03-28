import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function IncidentCard({ incident, onApprove, onOverride }) {
  const isPending   = incident.status === 'pending_verification';
  const isApproved  = incident.status === 'approved';
  const domainClass = incident.domain?.toLowerCase() || '';

  // Accessibility: derive a meaningful card label for screen readers
  const cardLabel = `Incident ${incident.id}: ${incident.domain} — ${incident.intent}. Status: ${incident.status.replace(/_/g, ' ')}.`;

  return (
    <article
      className={`incident-card ${incident.status}`}
      aria-label={cardLabel}
      tabIndex={0}
    >
      <div className="card-top" aria-hidden="true">
        <span className={`domain-tag ${domainClass}`} role="img" aria-label={`Domain: ${incident.domain}`}>
          {incident.domain}
        </span>
        <span className="source-tag">{incident.source}</span>
        <span className="time">{incident.time}</span>
        <span className="id">{incident.id}</span>
      </div>

      <div className="card-body">
        <blockquote className="raw-input" aria-label="Raw citizen report">
          "{incident.rawInput}"
        </blockquote>

        <dl className="gemini-analysis" aria-label="AI analysis results">
          <div className="analysis-row intent">
            <dt className="label">AI Intent:</dt>
            <dd className="value">{incident.intent}</dd>
          </div>
          <div className="analysis-row conf">
            <dt className="label">Confidence:</dt>
            <dd className={`value confidence ${incident.confidence > 85 ? 'high' : 'med'}`}
                aria-label={`Confidence: ${incident.confidence} percent`}>
              {incident.confidence}%
            </dd>
          </div>
          {incident.severity && (
            <div className="analysis-row">
              <dt className="label">Severity:</dt>
              <dd className={`value severity-badge ${incident.severity}`}
                  aria-label={`Severity: ${incident.severity}`}>
                {incident.severity.toUpperCase()}
              </dd>
            </div>
          )}
        </dl>

        <div className="proposed-action" role="region" aria-label="Recommended logistics action">
          <div className="action-label" aria-hidden="true">Recommended Action</div>
          {incident.action}
        </div>
      </div>

      <div className="card-actions">
        {isPending ? (
          <>
            <button
              id={`approve-${incident.id}`}
              className="approve-btn"
              onClick={() => onApprove(incident.id, incident.firestoreId)}
              aria-label={`Execute logistics for incident ${incident.id}`}
            >
              <CheckCircle2 size={16} aria-hidden="true" /> Execute Logistics
            </button>
            <button
              id={`override-${incident.id}`}
              className="override-btn"
              onClick={() => onOverride(incident.id, incident.firestoreId)}
              aria-label={`Hold incident ${incident.id} for manual human review`}
            >
              <AlertTriangle size={16} aria-hidden="true" /> Hold & Inspect
            </button>
          </>
        ) : (
          <div className="dispatched-status" role="status" aria-live="polite">
            <CheckCircle2 size={16} aria-hidden="true" />
            {isApproved ? 'Logistics Executed & Logged' : 'Held For Human Review'}
          </div>
        )}
      </div>
    </article>
  );
}
