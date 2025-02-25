import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'secondsToMinutes',
  standalone: true,
})
export class SecondsToMinutesPipe implements PipeTransform {
  transform(value: number): string {
    const duration = moment.duration(value, 'seconds');
    return `${duration.minutes()}:${
      (duration.seconds() < 10 ? '0' : '') + duration.seconds()
    }`;
  }
}
