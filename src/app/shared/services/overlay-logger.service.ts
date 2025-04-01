import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LogEntry {
  timestamp: Date;
  action: string;
  payload: any;
}

@Injectable({
  providedIn: 'root',
})
export class OverlayLoggerService {
  private logs = new BehaviorSubject<LogEntry[]>([]);
  logs$ = this.logs.asObservable();

  addLog(action: string, payload: any) {
    const currentLogs = this.logs.getValue();
    const newLog: LogEntry = {
      timestamp: new Date(),
      action,
      payload,
    };
    this.logs.next([...currentLogs, newLog]);
  }

  clearLogs() {
    this.logs.next([]);
  }
}
