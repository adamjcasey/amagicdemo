export interface SettingsState {
  notifications: string[],
  integrations: string[],
  automaticRefiils: boolean,
  smartReminders: boolean,
  notifyConflictsTime: boolean;
  symptomReminder: boolean;
  onlyRemindAtHome: boolean;
  notifyWeatherPrecautions: boolean;
}

export const initialState: SettingsState = {
  notifications: ['dose-day-reminders', 'add-new-symptoms-reminders', 'refill-reminders'],
  integrations: ['apple-health', 'one-path', 'my-pharmacy', 'my-chart-by-epic', 'my-pharmacy-2'],
  automaticRefiils: true,
  smartReminders: false,
  notifyConflictsTime: true,
  symptomReminder: true,
  onlyRemindAtHome: false,
  notifyWeatherPrecautions: true,
}
