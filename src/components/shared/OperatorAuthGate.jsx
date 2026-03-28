// Operator Login Gate — Google Auth integration
// Security Priority 3: Prevent unauthenticated access to the operator dashboard

import React, { useEffect, useState } from 'react';
import { LogIn, ShieldCheck, Loader } from 'lucide-react';
import { signInWithGoogle, onAuthChange, isFirebaseConfigured } from '../../services/firebase';

export default function OperatorAuthGate({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // If Firebase isn't configured, skip the gate for local development
  if (!isFirebaseConfigured) return children;

  if (loading) {
    return (
      <div className="auth-gate" role="status" aria-live="polite" aria-label="Verifying operator credentials">
        <Loader size={36} className="pulsing" />
        <p>Verifying credentials…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-gate">
        <ShieldCheck size={48} aria-hidden="true" style={{ color: 'var(--md-sys-color-primary)' }} />
        <h2>Operator Access Required</h2>
        <p>This view is restricted to authorized RESQ personnel only.</p>
        <button
          id="operator-signin-btn"
          className="google-signin-btn"
          onClick={signInWithGoogle}
          aria-label="Sign in with your Google account to access the operator dashboard"
        >
          <LogIn size={20} aria-hidden="true" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return children;
}
