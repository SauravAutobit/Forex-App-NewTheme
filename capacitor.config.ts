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
      // androidScaleType: "CENTER_INSIDE",
      androidScaleType: "CENTER_CROP",
      iosScaleType: "CENTER_INSIDE"
    },
    StatusBar: {
      overlaysWebView: true,
      backgroundColor: "#000000"
    }
  }
};

export default config;
