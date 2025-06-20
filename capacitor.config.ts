import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.groceryhub.app',
  appName: 'GroceryHub',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : undefined,
    errorPath: 'error.html'
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    // Add these properties for better native feel
    overrideUserAgent: 'capacitor-native',
    captureInput: true,
    allowNavigation: ['*'],
    // Improve back navigation
    useLegacyBridge: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    WebView: {
      serverPath: 'dist',
      androidScheme: 'https',
      allowFileAccess: true,
      allowContentAccess: true,
      setDomStorageEnabled: true,
      // Disable zooming
      setSupportZoom: false,
      // Improve scrolling
      setScrollBarStyle: 'insideOverlay'
    },
    App: {
      // Change from 'none' to 'pop' to enable proper back navigation
      backButtonBehavior: 'pop'
    }
  },
  web: {
    overflow: 'hidden'
  }
};

export default config;
