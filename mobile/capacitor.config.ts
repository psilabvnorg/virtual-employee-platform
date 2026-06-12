import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psi.docvault',
  appName: 'Doc Vault',
  webDir: 'dist',
  ios: {
    scrollEnabled: false,
    allowsLinkPreview: false,
  },
};

export default config;
