import React from 'react';

export default function TacticalMap({ incidents }) {
  // Compute positions logically (mapping them loosely around a center)
  // For aesthetics, we map incidents to CSS absolute coordinates
  return (
    <aside className="op-map">
      <div className="map-overlay">
        <h3>Sector 7 Tactical Map</h3>
        <div className="map-stats">
          <div><span>Active Rescues</span> {incidents.filter(i => i.domain === 'Evacuation').length}</div>
          <div><span>Total Hazards</span> {incidents.length}</div>
        </div>
      </div>
      <div className="radar-sweep"></div>
      
      <div className="map-markers">
        {incidents.map((inc, i) => {
          // Normalize lat/lng to percentage bounds for the CSS visual overlay
          const top = 10 + ((inc.lat - 34) / 0.15) * 80;
          const left = 10 + ((inc.lng + 118.3) / 0.15) * 80;
          
          let colorClass = 'red';
          if (inc.status === 'approved') colorClass = 'amber';
          if (inc.domain === 'Relief') colorClass = 'green';

          return (
            <div 
              key={inc.id}
              className={`marker ${colorClass} ${inc.status === 'pending_verification' ? 'pulse' : ''}`}
              style={{
                top: `${Math.max(10, Math.min(top, 90))}%`,
                left: `${Math.max(10, Math.min(left, 90))}%`
              }}
              title={inc.intent}
            ></div>
          );
        })}
      </div>
    </aside>
  );
}
