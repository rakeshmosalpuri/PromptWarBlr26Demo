import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Critical Error] Caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" role="alert">
          <div className="error-boundary-content">
            <AlertCircle size={48} color="var(--md-sys-color-error)" aria-hidden="true" />
            <h1>System Encountered a Critical Error</h1>
            <p>
              The application state has become unstable. 
              Manual intervention or a partial refresh of the tactical bridge may be required.
            </p>
            <pre className="error-stack">
              {this.state.error?.message || 'Unknown Runtime Exception'}
            </pre>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
              aria-label="Refresh and restart application"
            >
              <RefreshCw size={18} />
              Restart NEXUS Bridge
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
