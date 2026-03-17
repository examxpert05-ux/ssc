import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                            <AlertTriangle size={30} className="text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                            <p className="text-slate-400 text-sm mt-2">
                                A runtime error occurred. This might be a network issue or a corrupted data file.
                            </p>
                            {this.state.error && (
                                <p className="mt-3 text-xs text-red-400 bg-red-950/40 rounded-lg px-3 py-2 text-left font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all"
                        >
                            <RefreshCw size={16} />
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
