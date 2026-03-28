// Unit Tests: geminiService — core intent parsing and input sanitization
// Testing Priority 1: Validates the most critical logic path in the entire system

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Firebase so tests never attempt a network call ────────────
vi.mock('../services/firebase', () => ({
  writeIncident:         vi.fn().mockResolvedValue('mock-firestore-id'),
  isFirebaseConfigured:  false,
}));

// ── Mock the Gemini SDK itself ─────────────────────────────────────
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: () => JSON.stringify({
          domain:           'Evacuation',
          intent:           'Citizen trapped by floodwaters',
          confidence:       96,
          action:           'Deploy Swift-Water Rescue team immediately.',
          severity:         'critical',
          language_detected:'en',
          lat:              17.38,
          lng:              78.48,
        }),
      }),
    },
  })),
}));

import { parseIncidentIntent } from '../services/geminiService';

describe('geminiService — parseIncidentIntent', () => {

  describe('Input sanitization (Security)', () => {
    it('should strip HTML tags from input', async () => {
      const result = await parseIncidentIntent('<script>alert("xss")</script>Trapped in building');
      expect(result.rawInput).not.toContain('<script>');
    });

    it('should strip template injection characters', async () => {
      const result = await parseIncidentIntent('Help me `$(rm -rf /)` water everywhere');
      expect(result.rawInput).not.toContain('`');
      expect(result.rawInput).not.toContain('$');
    });

    it('should throw an error on empty string input', async () => {
      await expect(parseIncidentIntent('   ')).rejects.toThrow('Empty or invalid input');
    });

    it('should truncate input exceeding 2000 characters', async () => {
      const longInput = 'a'.repeat(3000);
      const result    = await parseIncidentIntent(longInput);
      expect(result.rawInput.length).toBeLessThanOrEqual(2000);
    });
  });

  describe('Domain classification (local fallback engine)', () => {
    // Note: With no VITE_GEMINI_API_KEY set in test env, the fallback engine runs

    it('should classify flood/rescue triggers as Evacuation', async () => {
      const result = await parseIncidentIntent('Water is flooding everything, I am trapped, need rescue now');
      expect(result.domain).toBe('Evacuation');
    });

    it('should classify bleeding/hospital inputs as Medical', async () => {
      const result = await parseIncidentIntent('Person is bleeding badly and needs a hospital immediately');
      expect(result.domain).toBe('Medical');
    });

    it('should classify bridge/power inputs as Infrastructure', async () => {
      const result = await parseIncidentIntent('The main road bridge collapsed and power is out');
      expect(result.domain).toBe('Infrastructure');
    });

    it('should classify unrecognized inputs as Relief by default', async () => {
      const result = await parseIncidentIntent('We need food and blankets for our community');
      expect(result.domain).toBe('Relief');
    });
  });

  describe('Response shape validation', () => {
    it('should always return a valid incident object with required fields', async () => {
      const result = await parseIncidentIntent('There is flooding near the school');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('domain');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('status', 'pending_verification');
      expect(result).toHaveProperty('rawInput');
    });

    it('should generate a unique incident ID on each call', async () => {
      const r1 = await parseIncidentIntent('Flood near bridge');
      const r2 = await parseIncidentIntent('Fire at hospital');
      expect(r1.id).not.toBe(r2.id);
    });

    it('confidence should be a number between 0 and 100', async () => {
      const result = await parseIncidentIntent('Earthquake damage to buildings');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });
});
