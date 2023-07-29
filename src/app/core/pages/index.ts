import { LayoutPage } from './layout/layout.page';
import { ErrorPage } from './error/error.page';
import { NotificationsPage } from './notifications/notifications.page';
import { AddSymptomPage } from './add-symptom/add-symptom.page';

export const pages: any[] = [
  LayoutPage,
  ErrorPage,
  NotificationsPage,
  AddSymptomPage
];

export * from './layout/layout.page';
export * from './error/error.page';
export * from './notifications/notifications.page';
export * from './add-symptom/add-symptom.page';
