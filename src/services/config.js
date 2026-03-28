// Central configuration checker
// Detects which services are available and exposes status flags for the whole app

const GEMINI_KEY   = import.meta.env.VITE_GEMINI_API_KEY;
const FIREBASE_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const FB_PROJECT   = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const FB_DOMAIN    = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const FB_BUCKET    = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const FB_SENDER    = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const FB_APP       = import.meta.env.VITE_FIREBASE_APP_ID;

export const config = {
  gemini: {
    apiKey:        GEMINI_KEY,
    isConfigured:  !!GEMINI_KEY,
  },
  firebase: {
    apiKey:           FIREBASE_KEY,
    authDomain:       FB_DOMAIN,
    projectId:        FB_PROJECT,
    storageBucket:    FB_BUCKET,
    messagingSenderId: FB_SENDER,
    appId:            FB_APP,
    isConfigured: !!(FIREBASE_KEY && FB_PROJECT && FB_DOMAIN && FB_BUCKET && FB_SENDER && FB_APP),
  },
};

// Structured list of missing items for the UI banner
export const getMissingConfigs = () => {
  const missing = [];

  if (!config.gemini.isConfigured) {
    missing.push({
      service: 'Gemini AI',
      key:     'VITE_GEMINI_API_KEY',
      impact:  'AI intent parsing is running in simulation mode',
      link:    'https://aistudio.google.com/apikey',
      linkText: 'Get key →',
    });
  }

  if (!config.firebase.isConfigured) {
    const missingKeys = [
      ['VITE_FIREBASE_API_KEY',            config.firebase.apiKey],
      ['VITE_FIREBASE_AUTH_DOMAIN',        config.firebase.authDomain],
      ['VITE_FIREBASE_PROJECT_ID',         config.firebase.projectId],
      ['VITE_FIREBASE_STORAGE_BUCKET',     config.firebase.storageBucket],
      ['VITE_FIREBASE_MESSAGING_SENDER_ID',config.firebase.messagingSenderId],
      ['VITE_FIREBASE_APP_ID',             config.firebase.appId],
    ].filter(([, val]) => !val).map(([key]) => key);

    missing.push({
      service:     'Firebase',
      keys:        missingKeys,
      impact:      'Real-time sync and Operator auth are disabled',
      link:        'https://console.firebase.google.com',
      linkText:    'Setup Firebase →',
    });
  }

  return missing;
};

export default config;
