import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogViewerMiddleware } from '../middlewares/log-viewer.middleware';
import { LogViewerService } from './log-viewer.service';

@Injectable({
  providedIn: 'root',
})
export class StoreMiddlewareService {
  #store = inject(Store);
  #logViewerService = inject(LogViewerService);

  constructor() {
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    const logViewerMiddleware = new LogViewerMiddleware(this.#logViewerService);

    const middleware = logViewerMiddleware.middleware();

    const originalDispatch = this.#store.dispatch;
    this.#store.dispatch = (action: any) => {
      const result = originalDispatch.call(this.#store, action);
      middleware((a: any) => a)(action);
      return result;
    };
  }
}
