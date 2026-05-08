import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/ui/HUD';
import MenuSystem from './components/ui/MenuSystem';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-8 h-full bg-black"><h1>Something went wrong.</h1><pre>{this.state.error?.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="w-full h-full relative bg-slate-900 overflow-hidden text-slate-200">
        <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
          <GameCanvas />
          <HUD />
          <MenuSystem />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
