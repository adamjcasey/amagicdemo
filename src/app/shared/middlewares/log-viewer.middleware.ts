import { Injectable } from '@angular/core';
import { LogViewerService } from '../services/log-viewer.service';

@Injectable()
export class LogViewerMiddleware {
  constructor(private logViewerService: LogViewerService) {}

  middleware = () => (next: any) => (action: any) => {
    const actionType = action.type || 'UNKNOWN_ACTION';
    const payload = action.payload !== undefined ? action.payload : undefined;

    this.logViewerService.addLog(actionType, payload);

    return next(action);
  };
}
