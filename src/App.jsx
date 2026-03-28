import React, { useState, useEffect } from 'react';
import CitizenView from './components/citizen/CitizenView';
import OperatorDashboard from './components/operator/OperatorDashboard';
import OperatorAuthGate from './components/shared/OperatorAuthGate';
import { INITIAL_INCIDENTS } from './services/mockData';
import { subscribeToIncidents, updateIncidentStatus as updateFirestore, isFirebaseConfigured } from './services/firebase';
import './index.css';

export default function App() {
  const [view, setView]         = useState('operator');
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  // Google Services Priority 2: Subscribe to Firestore real-time feed
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeToIncidents((liveIncidents) => {
      if (liveIncidents.length > 0) setIncidents(liveIncidents);
    });
    return unsub; // clean up on unmount
  }, []);

  const handleNewIncident = (incidentData) => {
    // Always optimistically update local state for instant UX feedback
    // Firestore write already happens inside geminiService.parseIncidentIntent
    setIncidents(prev => [incidentData, ...prev]);
  };

  const handleUpdateIncidentStatus = (id, newStatus, firestoreId) => {
    // Update local state immediately
    setIncidents(prev =>
      prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc)
    );
    // Persist to Firestore if connected
    if (firestoreId) updateFirestore(firestoreId, newStatus);
  };

  return (
    <div className="nexus-app">
      {/* Skip navigation link for keyboard/screen-reader users — Accessibility Priority */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Demo Toggle */}
      <div className="demo-view-toggle" role="tablist" aria-label="Switch application view">
        <button
          id="tab-citizen"
          role="tab"
          aria-selected={view === 'citizen'}
          aria-controls="main-content"
          className={view === 'citizen' ? 'active' : ''}
          onClick={() => setView('citizen')}
        >
          Citizen App
        </button>
        <button
          id="tab-operator"
          role="tab"
          aria-selected={view === 'operator'}
          aria-controls="main-content"
          className={view === 'operator' ? 'active' : ''}
          onClick={() => setView('operator')}
        >
          Command HQ
        </button>
      </div>

      <main id="main-content" tabIndex={-1}>
        {view === 'citizen' ? (
          <CitizenView onNewIncident={handleNewIncident} />
        ) : (
          <OperatorAuthGate>
            <OperatorDashboard
              incidents={incidents}
              onUpdateStatus={handleUpdateIncidentStatus}
            />
          </OperatorAuthGate>
        )}
      </main>
    </div>
  );
}
