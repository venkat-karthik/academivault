import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AcademiaVault ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-[#1C1917]">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E2D9] p-8 text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF3D8] border border-[#F6E2B2] text-[#B45309] flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
              !
            </div>
            <h2 className="text-xl font-bold font-sans">AcademiaVault Application Notice</h2>
            <p className="text-xs text-[#57534E] leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred during rendering.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Reload Marketplace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
