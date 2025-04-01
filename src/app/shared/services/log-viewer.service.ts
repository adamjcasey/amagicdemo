import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LogEntry {
  timestamp: Date;
  action: string;
  payload?: any;
}

@Injectable({
  providedIn: 'root',
})
export class LogViewerService {
  readonly MAX_LOGS = 100;
  #logs: LogEntry[] = [];
  #logsSubject = new BehaviorSubject<LogEntry[]>([]);
  readonly logs$ = this.#logsSubject.asObservable();

  addLog(action: string, payload?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      action,
      payload: payload ? this.sanitizePayload(payload) : undefined,
    };

    this.#logs = [logEntry, ...this.#logs].slice(0, this.MAX_LOGS);
    this.#logsSubject.next([...this.#logs]);
  }

  clearLogs(): void {
    this.#logs = [];
    this.#logsSubject.next([]);
  }

  private sanitizePayload(payload: any): any {
    if (!payload) return payload;

    try {
      const sanitizedPayload = JSON.parse(JSON.stringify(payload));

      // Here we could implement specific sanitization rules
      // For example, removing sensitive data, blacklisted actions, etc.

      return sanitizedPayload;
    } catch (error) {
      return { sanitizedInfo: 'Payload contained non-serializable data' };
    }
  }
}
