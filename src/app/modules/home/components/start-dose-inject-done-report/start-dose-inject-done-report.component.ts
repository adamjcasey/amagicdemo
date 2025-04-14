import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import { IonContent, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-start-dose-inject-done-report',
  templateUrl: 'start-dose-inject-done-report.component.html',
  styleUrls: ['start-dose-inject-done-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    IonImg,
    IonContent,
  ],
})
export class StartDoseInjectDoneReportComponent implements OnInit {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public card: any;

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.card = {
      asset: '/assets/images/sleep-guide.svg',
      title: 'Sleep guide',
      description:
        'The dip in week 6 may be because you were traveling with lower sleep quality',
      link: {
        label: 'Go to Guide',
        action: () => {
          console.log('Go to Guide action');
        },
      },
    };
  }

  ngOnInit() {
    this.homeConfig$.subscribe((homeConfig) => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });
  }
}
