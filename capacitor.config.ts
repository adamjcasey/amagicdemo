import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.automagic',
  appName: 'automagic',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
