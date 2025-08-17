
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          flexDirection: 'column'
        }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              marginTop: '10px', 
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the app
const initializeApp = async () => {
  try {
    console.log('Initializing GroceryHub app...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    // Get the root element
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    console.log('Creating React root...');
    const root = createRoot(rootElement);
    
    console.log('Rendering app...');
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    
    console.log('App initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; font-family: Arial, sans-serif; flex-direction: column;">
          <h1>Error Loading GroceryHub</h1>
          <p>Failed to initialize the application.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

// Start the app
initializeApp();
