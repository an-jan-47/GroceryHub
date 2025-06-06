import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.groceryhub.app',
  appName: 'GroceryHub',
  webDir: 'dist',
  server: {
    androidScheme: 'file'
  },
  android: {
    backgroundColor: '#3B82F6'
  }
};

export default config;