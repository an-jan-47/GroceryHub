
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.groceryhub.app',
  appName: 'GroceryHub',
  webDir: 'dist',
  server: {
    url: 'https://modern-cart-nexus-app.vercel.app',
    cleartext: false
  },
  plugins: {
    App: {
      launchUrl: 'groceryhub://'
    }
  }
};

export default config;
