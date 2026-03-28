import React, { useState, useEffect } from 'react';
import CitizenView from './components/citizen/CitizenView';
import OperatorDashboard from './components/operator/OperatorDashboard';
import OperatorAuthGate from './components/shared/OperatorAuthGate';
import ConfigBanner from './components/shared/ConfigBanner';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { ToastProvider, useToast } from './components/shared/ToastProvider';
import { INITIAL_INCIDENTS } from './services/mockData';
import { subscribeToIncidents, updateIncidentStatus as updateFirestore, isFirebaseConfigured } from './services/firebase';
import config from './services/config';
import './index.css';

function ApplicationContent() {
  const [view, setView]           = useState('operator');
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const { addToast }              = useToast();

  // Global error monitoring
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('[Global Error Alert]:', event.error);
      addToast(`System Error: ${event.message}`, 'error', 7000);
    };

    const handlePromiseRejection = (event) => {
      console.error('[Unhandled Promise Rejection]:', event.reason);
      addToast(`Network/API Failure: ${event.reason?.message || 'Check connection'}`, 'error', 7000);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    if (!config.gemini.isConfigured) {
      addToast('Gemini AI in simulation mode. Add API key for live parsing.', 'info');
    }
    if (!config.firebase.isConfigured) {
      addToast('Firestore disconnected. Incidents will not persist.', 'error');
    }

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [addToast]);

  // Subscribe to Firestore real-time feed
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeToIncidents((liveIncidents) => {
      if (liveIncidents.length > 0) {
        setIncidents(liveIncidents);
        addToast(`Synchronized ${liveIncidents.length} incidents from Cloud HQ`, 'success', 3000);
      }
    });
    return unsub;
  }, [addToast]);

  const handleNewIncident = (incidentData) => {
    setIncidents(prev => [incidentData, ...prev]);
    addToast('New tactical data ingested successfully', 'success', 4000);
  };

  const handleUpdateIncidentStatus = (id, newStatus, firestoreId) => {
    setIncidents(prev =>
      prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc)
    );
    if (firestoreId) {
      updateFirestore(firestoreId, newStatus);
      addToast(`Incident status updated to ${newStatus.replace('_', ' ')}`, 'info', 2000);
    }
  };

  return (
    <div className="nexus-app">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ConfigBanner />

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

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ApplicationContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
