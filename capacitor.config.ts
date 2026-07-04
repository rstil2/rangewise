import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rangewise.app",
  appName: "Rangewise",
  webDir: "dist",
  server: {
    // For production App Store builds, point at your live API:
    // url: "https://your-domain.com",
    // cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    scheme: "Rangewise",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0f0f1a",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
