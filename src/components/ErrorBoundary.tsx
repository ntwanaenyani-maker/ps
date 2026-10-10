import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Unknown application error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Phethagatsa runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#1c1917', background: '#faf8f5', minHeight: '100vh' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Phethagatsa Solutions</h1>
          <p style={{ marginBottom: 12 }}>The store is loading. If this message stays visible, refresh the page.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            {this.state.message}
          </pre>
          <a href="https://wa.me/27829564472" style={{ display: 'inline-block', marginTop: 16, padding: '12px 16px', background: '#14532d', color: '#fff', textDecoration: 'none', borderRadius: 6 }}>
            WhatsApp Us
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
