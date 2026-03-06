'use client';
import React from 'react';

export class CrashBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error) {
    console.error('Pixel Office Crash:', error);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>UI Crashed</h2>
          <p>Refresh to retry</p>
        </div>
      );
    }
    return this.props.children;
  }
}
