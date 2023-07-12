import { HomePage } from './home.page';
import { StartDosePreparePage } from './start-dose-prepare/start-dose-prepare.page';
import { StartDoseReadyToInjectPage } from './start-dose-ready-to-inject/start-dose-ready-to-inject.page';
import { StartDoseInjectDonePage } from './start-dose-inject-done/start-dose-inject-done.page';
import { AddSymptomPage } from './add-symptom/add-symptom.page';

export const pages: any[] = [
    HomePage,
    StartDosePreparePage,
    StartDoseReadyToInjectPage,
    StartDoseInjectDonePage,
    AddSymptomPage,
];

export * from './home.page';
export * from './start-dose-prepare/start-dose-prepare.page';
export * from './start-dose-ready-to-inject/start-dose-ready-to-inject.page';
export * from './start-dose-inject-done/start-dose-inject-done.page';
export * from './add-symptom/add-symptom.page';
