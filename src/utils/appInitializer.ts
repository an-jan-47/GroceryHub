import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from '@/integrations/firebase/config';

export const initializeApp = async () => {
  // Initialize Firebase Analytics
  if (Capacitor.isNativePlatform()) {
    FirebaseAnalytics.initializeFirebase(
      {
        loggingEnabled: true,
        // measurementId: 'G-XXXXXXXXXX', // Optional, only if you want to override the measurementId
      },
    );
  }

  // Request push notification permissions
  if (Capacitor.getPlatform() !== 'web') {
    const messaging = getMessaging(firebaseApp);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
        if (token) {
          console.log('Firebase Cloud Messaging registration token:', token);
        } else {
          console.warn('No registration token available. Request permission to generate one.');
        }
      } else if (permission === 'denied') {
        console.warn('Notification permission denied.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  }
};

export const setupPerformanceMonitoring = () => {
  // Performance monitoring setup
  if (typeof window !== 'undefined') {
    const config: Record<string, any> = {};
    
    // Monitor page load times
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
    });
  }
};
