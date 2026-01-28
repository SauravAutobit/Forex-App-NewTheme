import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swastiik.app',
  appName: 'Swastiik',
  webDir: 'dist',

  plugins: {
    SplashScreen: {
      launchShowDuration: 5000,
      backgroundColor: "#0B0F1A",
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
      iosScaleType: "CENTER_INSIDE"
    }
  }
};

export default config;
