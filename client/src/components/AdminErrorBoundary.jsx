import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Admin Error Boundary Caught Exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-lg w-full bg-[#140838] border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Admin View Temporary Error</h2>
              <p className="text-xs text-rose-300/80">
                {this.state.error?.message || 'An unexpected rendering error occurred in this admin panel.'}
              </p>
            </div>

            <div className="p-4 bg-[#0B0326] rounded-xl border border-purple-900/40 text-left overflow-auto max-h-32 text-[11px] font-mono text-purple-300/70">
              {this.state.error?.stack || 'No detailed stack trace available.'}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Admin View</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
