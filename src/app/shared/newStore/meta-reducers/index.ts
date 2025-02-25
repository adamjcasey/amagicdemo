import { MetaReducer } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { clearState } from './clear-state.reducer';
import { logger } from './logger.reducer';
import { CoreState } from '@app/core/store';

export * from './clear-state.reducer';
export * from './logger.reducer';
export * from './middleware.reducer';

export const metaReducers: MetaReducer<CoreState>[] = !environment.production
  ? // ? [logger]
    []
  : [];

metaReducers.push(clearState);
