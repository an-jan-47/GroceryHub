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
    backgroundColor: '#3B82F6',
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
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
      setDomStorageEnabled: true
    }
  },
  web: {
    overflow: 'hidden'
  }
};

export default config;
