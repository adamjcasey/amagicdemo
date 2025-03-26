import { HomePage } from './home.page';
import { StartDoseInjectDonePage } from './start-dose-inject-done/start-dose-inject-done.page';
import { StartDosePreparePage } from './start-dose-prepare/start-dose-prepare.page';
import { StartDoseReadyToInjectPage } from './start-dose-ready-to-inject/start-dose-ready-to-inject.page';

export const pages: any[] = [
  HomePage,
  StartDosePreparePage,
  StartDoseReadyToInjectPage,
  StartDoseInjectDonePage,
];

export * from './cassette-journey/cassette-journey.page';
export * from './cassette-remove/cassette-remove.page';
export * from './home.page';
export * from './start-dose-inject-done/start-dose-inject-done.page';
export * from './start-dose-prepare/start-dose-prepare.page';
export * from './start-dose-ready-to-inject/start-dose-ready-to-inject.page';
