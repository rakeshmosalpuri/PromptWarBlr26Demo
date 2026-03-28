import React, { useState } from 'react';
import CitizenView from './components/citizen/CitizenView';
import OperatorDashboard from './components/operator/OperatorDashboard';
import { INITIAL_INCIDENTS } from './services/mockData';
import './index.css';

export default function App() {
  const [view, setView] = useState('operator'); // 'citizen' or 'operator'
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  // Called by CitizenView when the Gemini Service successfully parses an intent
  const handleNewIncident = (incidentData) => {
    setIncidents(prev => [incidentData, ...prev]);
  };

  // Called by OperatorDashboard when executing logistics
  const handleUpdateIncidentStatus = (id, newStatus) => {
    setIncidents(prev => 
      prev.map(inc => 
        inc.id === id ? { ...inc, status: newStatus } : inc
      )
    );
  };

  return (
    <div className="nexus-app">
      {/* Structural Toggle bridging the two disconnected physical worlds */}
      <div className="demo-view-toggle">
        <button 
          className={view === 'citizen' ? 'active' : ''} 
          onClick={() => setView('citizen')}
        >
          Citizen App (Distress)
        </button>
        <button 
          className={view === 'operator' ? 'active' : ''} 
          onClick={() => setView('operator')}
        >
          Disaster Command (HQ)
        </button>
      </div>

      {view === 'citizen' ? (
        <CitizenView onNewIncident={handleNewIncident} />
      ) : (
        <OperatorDashboard 
          incidents={incidents} 
          onUpdateStatus={handleUpdateIncidentStatus} 
        />
      )}
    </div>
  );
}
