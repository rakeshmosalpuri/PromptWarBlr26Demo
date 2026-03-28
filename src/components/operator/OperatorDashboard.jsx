import React, { useState } from 'react';
import { Activity, Navigation, HardHat, Package, HeartPulse, ListFilter, Radio } from 'lucide-react';
import IncidentCard from './IncidentCard';
import TacticalMap from './TacticalMap';
import { AUTOMATED_FEEDS } from '../../services/mockData';

export default function OperatorDashboard({ incidents, onUpdateStatus }) {
  const [filter, setFilter] = useState('All');

  const domains = [
    { name: 'All', icon: <Activity size={18} /> },
    { name: 'Evacuation', icon: <Navigation size={18} /> },
    { name: 'Infrastructure', icon: <HardHat size={18} /> },
    { name: 'Relief', icon: <Package size={18} /> },
    { name: 'Medical', icon: <HeartPulse size={18} /> }
  ];

  const filteredIncidents = filter === 'All' 
    ? incidents 
    : incidents.filter(i => i.domain === filter);
    
  const getBadgeCount = (name) => {
    if (name === 'All') return 0;
    return incidents.filter(i => i.domain === name && i.status === 'pending_verification').length;
  };

  return (
    <div className="operator-dashboard">
      <header className="op-header">
        <div className="op-logo">RES<span style={{color:'var(--nexus-accent)'}}>Q</span> <span>COMMAND HQ</span></div>
        <div className="op-status">
          <Radio size={16} className="pulsing" />
          Live Sensor & Citizen Ingestion Active
        </div>
      </header>

      <div className="op-layout">
        <aside className="op-sidebar">
          <h3>Response Sectors</h3>
          <ul>
            {domains.map(d => {
              const count = getBadgeCount(d.name);
              return (
                <li 
                  key={d.name} 
                  className={filter === d.name ? 'active' : ''}
                  onClick={() => setFilter(d.name)}
                >
                  {d.icon} {d.name} 
                  {count > 0 && <span className="badge">{count}</span>}
                </li>
              );
            })}
          </ul>

          <div className="automated-feeds">
            <h3>Live Data Streams <Activity size={14} className="pulsing"/></h3>
            <div className="feed-ticker">
              {AUTOMATED_FEEDS.map((feed, i) => (
                <p key={i}><span>{feed.source}:</span> {feed.message}</p>
              ))}
            </div>
          </div>
        </aside>

        <main className="op-feed">
          <div className="feed-header">
            <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
              <h2>Active Incident Queue</h2>
              <span className="incident-count">{filteredIncidents.filter(i => i.status === 'pending_verification').length} Critical</span>
            </div>
            <button className="filter-btn"><ListFilter size={18}/> Sort by Severity</button>
          </div>

          <div className="incident-list">
            {filteredIncidents.map((incident) => (
              <IncidentCard 
                key={incident.id} 
                incident={incident} 
                onApprove={(id) => onUpdateStatus(id, 'approved')}
                onOverride={(id) => onUpdateStatus(id, 'held_for_review')}
              />
            ))}
          </div>
        </main>

        <TacticalMap incidents={incidents} />
      </div>
    </div>
  );
}
