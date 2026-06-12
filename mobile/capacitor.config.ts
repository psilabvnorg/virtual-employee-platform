import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psilab.docvault',
  appName: 'Doc Vault PsiLab',
  webDir: 'dist',
  ios: {
    scrollEnabled: false,
    allowsLinkPreview: false,
  },
};

export default config;
