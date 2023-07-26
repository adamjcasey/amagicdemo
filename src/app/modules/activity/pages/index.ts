import { ActivityPage } from './activity.page';
import { CalendarPage } from './calendar/calendar.page';
import { DoseReportPage } from './dose-report/dose-report.page';
import { DoseReportDetailPage } from './dose-report-detail/dose-report-detail.page';
import { SymptomReportPage } from './symptom-report/symptom-report.page';
import { YourProgressPage } from './your-progress/your-progress.page';

export const pages: any[] = [
    ActivityPage,
    CalendarPage,
    DoseReportPage,
    DoseReportDetailPage,
    SymptomReportPage,
    YourProgressPage
];

export * from './activity.page';
export * from './calendar/calendar.page';
export * from './dose-report/dose-report.page';
export * from './dose-report-detail/dose-report-detail.page';
export * from './symptom-report/symptom-report.page';
export * from './your-progress/your-progress.page';
