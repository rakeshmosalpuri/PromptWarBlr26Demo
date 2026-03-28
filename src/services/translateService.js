// Google Cloud Translation Service
// Translates any citizen input to English before passing to Gemini
// Uses REST API — no SDK needed

import config from './config';

const TRANSLATE_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';
const DETECT_ENDPOINT    = 'https://translation.googleapis.com/language/translate/v2/detect';

/**
 * Detects the language of a given text.
 * Returns ISO 639-1 code e.g. 'hi', 'es', 'ta'
 */
export const detectLanguage = async (text) => {
  if (!config.translate.isConfigured || !text.trim()) return 'en';
  try {
    const res  = await fetch(`${DETECT_ENDPOINT}?key=${config.translate.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text }),
    });
    const data = await res.json();
    return data?.data?.detections?.[0]?.[0]?.language || 'en';
  } catch (err) {
    console.error('[Translate] Detection failed:', err.message);
    return 'en';
  }
};

/**
 * Translates text to English if it's not already English.
 * Returns { translatedText, detectedLanguage, wasTranslated }
 */
export const translateToEnglish = async (text) => {
  if (!config.translate.isConfigured) {
    return { translatedText: text, detectedLanguage: 'en', wasTranslated: false };
  }

  try {
    const detectedLang = await detectLanguage(text);
    if (detectedLang === 'en') {
      return { translatedText: text, detectedLanguage: 'en', wasTranslated: false };
    }

    const res  = await fetch(`${TRANSLATE_ENDPOINT}?key=${config.translate.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: detectedLang, target: 'en', format: 'text' }),
    });
    const data = await res.json();
    const translated = data?.data?.translations?.[0]?.translatedText;

    if (!translated) throw new Error('Empty translation response');

    console.log(`[Translate ✓] ${detectedLang} → en: "${translated}"`);
    return { translatedText: translated, detectedLanguage: detectedLang, wasTranslated: true };
  } catch (err) {
    console.error('[Translate ✗] Translation failed, using original text:', err.message);
    return { translatedText: text, detectedLanguage: 'unknown', wasTranslated: false };
  }
};

/**
 * Language display name mapping for the UI
 */
export const LANGUAGE_NAMES = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
  es: 'Spanish', fr: 'French', ar: 'Arabic', bn: 'Bengali',
  ur: 'Urdu', pa: 'Punjabi', mr: 'Marathi', gu: 'Gujarati',
  kn: 'Kannada', ml: 'Malayalam', or: 'Odia', unknown: 'Unknown',
};
