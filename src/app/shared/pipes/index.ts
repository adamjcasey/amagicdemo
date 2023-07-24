import { EllipsisPipe } from './ellipsis.pipe';
import { SecondsToMinutesPipe } from './seconds-to-minutes.pipe';
import { ReversePipe } from './reverse.pipe';
import { TypeOfPipe } from './typeof.pipe';

export const pipes: any[] = [
    EllipsisPipe,
    SecondsToMinutesPipe,
    ReversePipe,
    TypeOfPipe,
];

export * from './ellipsis.pipe';
export * from './seconds-to-minutes.pipe';
export * from './reverse.pipe';
export * from './typeof.pipe';
