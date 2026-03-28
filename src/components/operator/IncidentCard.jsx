import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function IncidentCard({ incident, onApprove, onOverride }) {
  const isPending = incident.status === 'pending_verification';

  return (
    <div className={`incident-card ${incident.status}`}>
      <div className="card-top">
        <span className={`domain-tag ${incident.domain.toLowerCase()}`}>{incident.domain}</span>
        <span className="source-tag">{incident.source}</span>
        <span className="time">{incident.time}</span>
        <span className="id">{incident.id}</span>
      </div>
      
      <div className="card-body">
        <div className="raw-input">
          "{incident.rawInput}"
        </div>
        
        <div className="gemini-analysis">
          <div className="analysis-row intent">
            <span className="label">AI Extracted Intent:</span>
            <span className="value">{incident.intent}</span>
          </div>
          <div className="analysis-row conf">
            <span className="label">Targeting Confidence:</span>
            <span className={`confidence ${incident.confidence > 95 ? 'high' : 'med'}`}>
              {incident.confidence}%
            </span>
          </div>
        </div>

        <div className="proposed-action">
          <div className="action-label">Recommended Logistics Action</div>
          {incident.action}
        </div>
      </div>

      <div className="card-actions">
        {isPending ? (
          <>
            <button className="approve-btn" onClick={() => onApprove(incident.id)}>
              <CheckCircle2 size={16} /> Execute Logistics
            </button>
            <button className="override-btn" onClick={() => onOverride(incident.id)}>
              <AlertTriangle size={16} /> Hold & Inspect
            </button>
          </>
        ) : (
          <div className="dispatched-status">
            <CheckCircle2 size={16} /> {incident.status === 'approved' ? 'Logistics Executed & Logged' : 'Held For Human Review'}
          </div>
        )}
      </div>
    </div>
  );
}
