// Component Tests: CitizenView — accessibility and interaction behaviour
// Testing Priority 2: Validates the primary citizen-facing UI

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CitizenView from '../components/citizen/CitizenView';

// ── Mock geminiService so component tests are isolated ─────────────
vi.mock('../services/geminiService', () => ({
  parseIncidentIntent: vi.fn().mockResolvedValue({
    id:      'DS-0001',
    domain:  'Evacuation',
    intent:  'Test intent',
    confidence: 95,
    action:  'Test action',
    status:  'pending_verification',
    rawInput:'Test input',
  }),
}));

describe('CitizenView — component behaviour', () => {
  let onNewIncidentMock;

  beforeEach(() => {
    onNewIncidentMock = vi.fn();
    render(<CitizenView onNewIncident={onNewIncidentMock} />);
  });

  // ── Accessibility Tests ──────────────────────────────────────────

  it('should render the main h1 landmark heading', () => {
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should have an accessible textarea with a label', () => {
    const textarea = screen.getByRole('textbox', { name: /describe your emergency/i });
    expect(textarea).toBeInTheDocument();
  });

  it('should label the camera button accessibly', () => {
    expect(screen.getByRole('button', { name: /attach photo/i })).toBeInTheDocument();
  });

  it('should label the voice button accessibly', () => {
    expect(screen.getByRole('button', { name: /record voice/i })).toBeInTheDocument();
  });

  it('should label the submit button accessibly', () => {
    expect(screen.getByRole('button', { name: /send emergency alert/i })).toBeInTheDocument();
  });

  // ── Interaction / UX Tests ───────────────────────────────────────

  it('should disable submit button when textarea is empty', () => {
    const submitBtn = screen.getByRole('button', { name: /send emergency alert/i });
    expect(submitBtn).toBeDisabled();
  });

  it('should enable submit button when user types a message', () => {
    const textarea  = screen.getByRole('textbox', { name: /describe your emergency/i });
    const submitBtn = screen.getByRole('button', { name: /send emergency alert/i });
    fireEvent.change(textarea, { target: { value: 'I need help, flooding near my house' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('should enable submit button when photo is attached', () => {
    const cameraBtn = screen.getByRole('button', { name: /attach photo/i });
    const submitBtn = screen.getByRole('button', { name: /send emergency alert/i });
    fireEvent.click(cameraBtn);
    expect(submitBtn).not.toBeDisabled();
  });

  it('should call onNewIncident with parsed data on successful form submit', async () => {
    const textarea  = screen.getByRole('textbox', { name: /describe your emergency/i });
    const submitBtn = screen.getByRole('button', { name: /send emergency alert/i });

    fireEvent.change(textarea, { target: { value: 'Flood at 5th Street' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onNewIncidentMock).toHaveBeenCalledTimes(1);
      expect(onNewIncidentMock).toHaveBeenCalledWith(
        expect.objectContaining({ domain: 'Evacuation', status: 'pending_verification' })
      );
    });
  });

  it('should show success confirmation message after submission', async () => {
    const textarea  = screen.getByRole('textbox', { name: /describe your emergency/i });
    const submitBtn = screen.getByRole('button', { name: /send emergency alert/i });

    fireEvent.change(textarea, { target: { value: 'Need medical help' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Alert Transmitted/i)).toBeInTheDocument();
    });
  });
});
