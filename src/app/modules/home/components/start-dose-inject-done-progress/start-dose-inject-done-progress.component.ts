import {
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import { IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-start-dose-inject-done-progress',
  templateUrl: 'start-dose-inject-done-progress.component.html',
  styleUrls: ['start-dose-inject-done-progress.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonImg],
})
export class StartDoseInjectDoneProgressComponent
  implements OnInit, AfterViewInit
{
  public title: string = 'Verifying...';
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public doseMarked: boolean = false;

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
  }

  ngOnInit() {
    this.homeConfig$.subscribe((homeConfig) => {
      if (homeConfig) {
        this.homeConfig = homeConfig;

        // if this is the first dose
        if (this.homeConfig.firstTimeDose) {
          this.title = 'First dose done!';
        } else {
          const markedDoses = this.homeConfig?.doses.filter(
            (dose: any) => dose.marked
          );
          this.title = `${markedDoses.length} doses done`;
        }
      }
    });
  }

  ngAfterViewInit() {
    // hold on 1s before complete the dose
    setTimeout(() => {
      this.markDoseAsDone();
    }, 1000);
  }

  markDoseAsDone() {
    const doses = cloneDeep(this.homeConfig?.doses);
    if (this.homeConfig.firstTimeDose) {
      doses[0].marked = true;
      doses[0].date = new Date();
      doses[0].bodyPartInjected = this.homeConfig.bodyPartSelected;
    } else {
      const markedDoses = this.homeConfig?.doses.filter(
        (dose: any) => dose.marked
      );
      const index = Math.min(markedDoses.length, doses.length - 1);

      doses[index].marked = true;
      doses[index].bodyPartInjected = this.homeConfig.bodyPartSelected;
    }

    this.doseMarked = true;
    this._store.dispatch(
      new fromStore.SetData({
        doses: doses,
      })
    );
  }
}
