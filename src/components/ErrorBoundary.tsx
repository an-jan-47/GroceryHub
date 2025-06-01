import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We're sorry, but there was an error loading this page.
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mr-2"
          >
            Try again
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Go to homepage
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;