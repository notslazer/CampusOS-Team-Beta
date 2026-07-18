import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-beige to-sand p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold text-ink">
              Oops! Something Went Wrong
            </h1>
            <p className="mt-2 text-center text-sm text-ink-soft">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3">
                <p className="text-xs font-mono text-red-700">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={this.resetError}
                className="flex-1"
                variant="primary"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                className="flex-1"
                variant="secondary"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
