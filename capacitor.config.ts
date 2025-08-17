import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.groceryhub.app',
  appName: 'GroceryHub',
  webDir: 'dist',
  server: {
    url: 'https://modern-cart-nexus-app.vercel.app',
    cleartext: false,
    androidScheme: 'https'
  },
  plugins: {
    App: {
      url: 'https://modern-cart-nexus-app.vercel.app',
      launchUrl: 'https://modern-cart-nexus-app.vercel.app',
      webDir: 'dist'
    }
  }
};

export default config;
