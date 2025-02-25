import { CoreState } from '@app/core/store';
import { ActionReducer } from '@ngrx/store';
import { storeLogger } from '@shared/services/logger';

export function logger(
  reducer: ActionReducer<CoreState>
): ActionReducer<CoreState> {
  return storeLogger()(reducer);
}
