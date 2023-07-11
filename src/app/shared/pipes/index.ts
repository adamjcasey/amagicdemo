import { EllipsisPipe } from './ellipsis.pipe';
import { SecondsToMinutesPipe } from './seconds-to-minutes.pipe';

export const pipes: any[] = [
    EllipsisPipe,
    SecondsToMinutesPipe,
];

export * from './ellipsis.pipe';
export * from './seconds-to-minutes.pipe';
