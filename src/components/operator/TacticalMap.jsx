// TacticalMap — Real Google Maps integration with fallback to CSS radar
// Switches automatically based on VITE_GOOGLE_MAPS_API_KEY presence

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Layers } from 'lucide-react';
import { loadGoogleMaps, DOMAIN_PIN_COLORS, SEVERITY_SCALE } from '../../services/mapsService';
import config from '../../services/config';

// ── CSS Fallback Map (shown when Maps API key is missing) ──────────
function RadarFallback({ incidents }) {
  return (
    <aside className="op-map" aria-label="Incident location map (simulation mode)">
      <div className="map-overlay">
        <h3>Sector Map <span className="map-mode-badge">Simulation</span></h3>
        <div className="map-stats">
          <div><span>Active</span>{incidents.filter(i => i.status === 'pending_verification').length}</div>
          <div><span>Total</span>{incidents.length}</div>
        </div>
      </div>
      <div className="radar-sweep" aria-hidden="true" />
      <div className="map-markers" aria-hidden="true">
        {incidents.map((inc, i) => {
          const top  = 15 + ((inc.lat - 17.3) / 0.15) * 70;
          const left = 15 + ((inc.lng - 78.4) / 0.15) * 70;
          const colorClass = inc.status === 'approved' ? 'amber' : 'red';
          return (
            <div
              key={inc.id}
              className={`marker ${colorClass} ${inc.status === 'pending_verification' ? 'pulse' : ''}`}
              style={{ top: `${Math.max(10, Math.min(top, 90))}%`, left: `${Math.max(10, Math.min(left, 90))}%` }}
              title={inc.intent}
            />
          );
        })}
      </div>
    </aside>
  );
}

// ── Real Google Maps Component ─────────────────────────────────────
export default function TacticalMap({ incidents }) {
  const mapRef        = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef    = useRef([]);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapError,  setMapError]  = useState(false);

  // Load the Maps API and initialize the map
  useEffect(() => {
    if (!config.maps.isConfigured) return;

    loadGoogleMaps().then((google) => {
      if (!google || !mapRef.current) { setMapError(true); return; }

      const center = { lat: 17.38, lng: 78.48 }; // Hyderabad default

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 11,
        mapId: 'RESQ_TACTICAL',
        // Dark-styled map matching our M3 dark theme
        styles: [
          { elementType: 'geometry',         stylers: [{ color: '#212529' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#9ecaff' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1113' }] },
          { featureType: 'road',             elementType: 'geometry', stylers: [{ color: '#2b2f33' }] },
          { featureType: 'water',            elementType: 'geometry', stylers: [{ color: '#0d1624' }] },
          { featureType: 'poi',              stylers: [{ visibility: 'off' }] },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      setMapsReady(true);
    }).catch(() => setMapError(true));
  }, []);

  // Update markers whenever incidents change
  useEffect(() => {
    if (!mapsReady || !mapInstanceRef.current || !window.google) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    incidents.forEach((inc) => {
      if (!inc.lat || !inc.lng || (inc.lat === 0 && inc.lng === 0)) return;

      const position = { lat: inc.lat, lng: inc.lng };
      const color    = DOMAIN_PIN_COLORS[inc.domain] || DOMAIN_PIN_COLORS.default;
      const scale    = SEVERITY_SCALE[inc.severity] || 1.0;

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: `${inc.id}: ${inc.intent}`,
        icon: {
          path:        window.google.maps.SymbolPath.CIRCLE,
          scale:       10 * scale,
          fillColor:   color,
          fillOpacity: inc.status === 'pending_verification' ? 0.9 : 0.5,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      // Info window on click
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:Roboto,sans-serif;font-size:13px;max-width:220px;padding:4px">
            <strong style="color:${color}">${inc.domain} — ${inc.id}</strong>
            <p style="margin:6px 0;color:#555">${inc.intent}</p>
            <p style="margin:0;font-size:11px;color:#888">${inc.source}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to all incident markers
    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, 60);
    }
  }, [incidents, mapsReady]);

  // Fallback if Maps not configured or errored
  if (!config.maps.isConfigured || mapError) {
    return <RadarFallback incidents={incidents} />;
  }

  return (
    <aside className="op-map" aria-label="Live Google Maps incident tracker">
      <div className="map-overlay">
        <h3>
          <MapPin size={14} aria-hidden="true" style={{ display: 'inline', marginRight: '0.4rem' }} />
          Live Incident Map
          <span className="map-mode-badge live">Google Maps</span>
        </h3>
        <div className="map-stats">
          <div><span>Active</span>{incidents.filter(i => i.status === 'pending_verification').length}</div>
          <div><span>Total</span>{incidents.length}</div>
        </div>
      </div>
      {/* The actual Google Map canvas */}
      <div ref={mapRef} className="google-map-canvas" aria-hidden="true" />
      {/* Legend */}
      <div className="map-legend" aria-label="Map legend">
        {Object.entries(DOMAIN_PIN_COLORS).filter(([k]) => k !== 'default').map(([domain, color]) => (
          <span key={domain} className="legend-item">
            <span className="legend-dot" style={{ background: color }} aria-hidden="true"/>
            {domain}
          </span>
        ))}
      </div>
    </aside>
  );
}
