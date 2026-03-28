import { GoogleGenAI } from '@google/genai';
import { writeIncident } from './firebase';
import config from './config';

// ─── Structured output schema ──────────────────────────────────────
const INCIDENT_SCHEMA = {
  type: 'object',
  properties: {
    domain:            { type: 'string', enum: ['Evacuation', 'Medical', 'Infrastructure', 'Relief'] },
    intent:            { type: 'string' },
    confidence:        { type: 'number' },
    action:            { type: 'string' },
    lat:               { type: 'number' },
    lng:               { type: 'number' },
    severity:          { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
    language_detected: { type: 'string' },
  },
  required: ['domain', 'intent', 'confidence', 'action', 'severity'],
};

const SYSTEM_PROMPT = `You are RESQ NEXUS, a universal disaster and medical triage engine. 
Your task is to ingest UNSTRUCTURED, MESSY, REAL-WORLD data and extract structured emergency logistics.

INPUT TYPES you must handle include:
1. Distress Signals: "I am trapped, water is rising."
2. Medical History: Messy doctor's notes, prescriptions, or vitals.
3. Environmental Data: Technical weather reports, news tickers, or USGS sensor logs.
4. Logistics/Traffic: "Bridge at sector 4 is out, traffic rerouting to 7."
5. Visual Data: Detailed descriptions of photos (e.g., structural failure, flood levels).

GOAL: Extract intent, severity, and actionable logistics.
STRATEGY: Be precise. If it's a medical history, identify the most urgent chronic condition or surgical need. If it's a traffic log, identify the bottleneck. 

Always respond in the JSON schema provided.`;

// ─── Local fallback (when no Gemini key is set) ────────────────────
const LOCAL_FALLBACK = (rawInput) => {
  const lower = rawInput.toLowerCase();
  let domain = 'Relief';
  if (lower.includes('water') || lower.includes('trap') || lower.includes('flood') || lower.includes('rescue')) domain = 'Evacuation';
  else if (lower.includes('medical') || lower.includes('hurt') || lower.includes('bleed') || lower.includes('hospital')) domain = 'Medical';
  else if (lower.includes('bridge') || lower.includes('road') || lower.includes('power') || lower.includes('building')) domain = 'Infrastructure';

  const actions = {
    Evacuation:     'Deploy Swift-Water Rescue team. Track GPS coordinates.',
    Medical:        'Pre-alert nearest trauma center. Dispatch ALS unit.',
    Infrastructure: 'Log structural failure. Reroute surrounding logistics.',
    Relief:         'Add to distribution manifest. Schedule supply drop.',
  };

  return {
    domain,
    intent:            `Citizen requested urgent ${domain.toLowerCase()} assistance`,
    confidence:        Math.floor(88 + Math.random() * 10),
    action:            actions[domain],
    severity:          'high',
    language_detected: 'en',
    lat: 0,
    lng: 0,
  };
};

// ─── Input sanitization ────────────────────────────────────────────
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[`${}\\]/g, '')
    .substring(0, 2000)
    .trim();
};

// ── Main export ──────────────────────────────────────────────────
export const parseIncidentIntent = async (rawInput, inputType = 'citizen_report') => {
  const sanitized = sanitizeInput(rawInput);
  if (!sanitized) throw new Error('Empty or invalid input');

  let parsed;

  if (config.gemini.isConfigured) {
    // ── REAL GEMINI CALL ──────────────────────────────────────────
    try {
      const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ 
          role: 'user', 
          parts: [{ text: `[INPUT_MODE: ${inputType.toUpperCase()}]\n\n${SYSTEM_PROMPT}\n\nData Ingest: "${sanitized}"` }] 
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema:   INCIDENT_SCHEMA,
        },
      });
      parsed = JSON.parse(response.text());
      console.log(`[Nexus Engine ✓] Structured data extracted:`, parsed);
    } catch (err) {
      // Fallback: flag for manual triage but don't crash
      console.error('[Gemini ✗] API call failed, routing to manual triage:', err.message);
      parsed = {
        ...(LOCAL_FALLBACK(sanitized)),
        intent:     'UNPROCESSED — MANUAL TRIAGE REQUIRED',
        action:     'AI parsing failed. Raw input forwarded to operator for manual review.',
        severity:   'critical',
        confidence: 0,
      };
    }
  } else {
    // ── SIMULATION MODE ───────────────────────────────────────────
    await new Promise(r => setTimeout(r, 1500));
    parsed = LOCAL_FALLBACK(sanitized);
    console.warn('[Gemini] No API key — simulation mode active. Add VITE_GEMINI_API_KEY to .env');
  }

  // Build full incident record
  const incident = {
    id:       `DS-${Math.floor(1000 + Math.random() * 9000)}`,
    time:     'Just now',
    source:   config.gemini.isConfigured ? 'Gemini 2.5 Flash (Live)' : 'Simulation Engine',
    rawInput: sanitized,
    status:   'pending_verification',
    lat:      parsed.lat || (17.38 + (Math.random() - 0.5) * 0.1),
    lng:      parsed.lng || (78.48 + (Math.random() - 0.5) * 0.1),
    ...parsed,
  };

  // Write to Firestore (no-op if Firebase not configured)
  const firestoreId = await writeIncident(incident);
  if (firestoreId) incident.firestoreId = firestoreId;

  return incident;
};
