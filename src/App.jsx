import React, { useState, useEffect } from 'react';
import CitizenView from './components/citizen/CitizenView';
import OperatorDashboard from './components/operator/OperatorDashboard';
import OperatorAuthGate from './components/shared/OperatorAuthGate';
import ConfigBanner from './components/shared/ConfigBanner';
import { INITIAL_INCIDENTS } from './services/mockData';
import { subscribeToIncidents, updateIncidentStatus as updateFirestore, isFirebaseConfigured } from './services/firebase';
import './index.css';

export default function App() {
  const [view, setView]           = useState('operator');
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  // Subscribe to Firestore real-time feed when Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeToIncidents((liveIncidents) => {
      if (liveIncidents.length > 0) setIncidents(liveIncidents);
    });
    return unsub;
  }, []);

  const handleNewIncident = (incidentData) => {
    setIncidents(prev => [incidentData, ...prev]);
  };

  const handleUpdateIncidentStatus = (id, newStatus, firestoreId) => {
    setIncidents(prev =>
      prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc)
    );
    if (firestoreId) updateFirestore(firestoreId, newStatus);
  };

  return (
    <div className="nexus-app">
      {/* Accessibility: keyboard skip link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Config warning banner — shows missing .env keys */}
      <ConfigBanner />

      {/* View toggle */}
      <div className="demo-view-toggle" role="tablist" aria-label="Switch application view">
        <button
          id="tab-citizen"
          role="tab"
          aria-selected={view === 'citizen'}
          className={view === 'citizen' ? 'active' : ''}
          onClick={() => setView('citizen')}
        >
          Citizen App
        </button>
        <button
          id="tab-operator"
          role="tab"
          aria-selected={view === 'operator'}
          className={view === 'operator' ? 'active' : ''}
          onClick={() => setView('operator')}
        >
          Command HQ
        </button>
      </div>

      <main id="main-content" tabIndex={-1} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
