// Google Maps Service — loads and manages the Maps JS API
// Uses @googlemaps/js-api-loader for clean async initialization

import { Loader } from '@googlemaps/js-api-loader';
import config from './config';

let mapsLoader = null;
let googleMaps = null;

/**
 * Loads the Google Maps JS API (singleton — only loads once)
 * Returns the google.maps namespace
 */
export const loadGoogleMaps = async () => {
  if (googleMaps) return googleMaps;

  if (!config.maps.isConfigured) {
    console.warn('[Maps] No API key found. Falling back to radar CSS map.');
    console.warn('[Maps] Add VITE_GOOGLE_MAPS_API_KEY to .env');
    return null;
  }

  if (!mapsLoader) {
    mapsLoader = new Loader({
      apiKey:  config.maps.apiKey,
      version: 'weekly',
      libraries: ['marker'],
    });
  }

  try {
    googleMaps = await mapsLoader.load();
    console.log('[Maps ✓] Google Maps JS API loaded');
    return googleMaps;
  } catch (err) {
    console.error('[Maps ✗] Failed to load Google Maps:', err.message);
    return null;
  }
};

/**
 * Domain-colored pin configurations
 */
export const DOMAIN_PIN_COLORS = {
  Evacuation:     '#f59e0b',
  Infrastructure: '#84cc16',
  Medical:        '#f43f5e',
  Relief:         '#10b981',
  default:        '#9ecaff',
};

export const SEVERITY_SCALE = {
  critical: 1.4,
  high:     1.2,
  medium:   1.0,
  low:      0.8,
};

export { config as mapsConfig };
