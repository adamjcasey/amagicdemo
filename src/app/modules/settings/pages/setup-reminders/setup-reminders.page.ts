import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeroComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonToggle,
} from '@ionic/angular/standalone';
import * as fromStore from '@settings/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-setup-reminders',
  templateUrl: 'setup-reminders.page.html',
  styleUrls: ['setup-reminders.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeroComponent,
    IonContent,
    IonImg,
    IonToggle,
    IonIcon,
    IonButton,
  ],
})
export class SetupRemindersPage implements OnInit, OnDestroy {
  public settingsConfig$!: Observable<any>;
  public settingsConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.settingsConfig$ = this._store.select(fromStore.getSettingsConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.heroConfig = {
      color: '--color-bg-pastel-green',
      template: '<h1 class="font-heading-1--bold">Smart reminders</h1>',
    };
  }

  ngOnInit() {
    this.settingsConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((settingsConfig) => {
        if (settingsConfig) {
          this.settingsConfig = settingsConfig;
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  saveSmartReminders(event: any) {
    this._store.dispatch(
      new fromStore.SetData({
        smartReminders: event.detail.checked,
      })
    );
  }

  saveNotifyConflictsCalendar(event: any) {
    this._store.dispatch(
      new fromStore.SetData({
        notifyConflictsTime: event.detail.checked,
      })
    );
  }

  saveSymptomReminder(event: any) {
    this._store.dispatch(
      new fromStore.SetData({
        symptomReminder: event.detail.checked,
      })
    );
  }

  saveOnlyRemindAtHome(event: any) {
    this._store.dispatch(
      new fromStore.SetData({
        onlyRemindAtHome: event.detail.checked,
      })
    );
  }

  saveNotifyWeatherPrecautions(event: any) {
    this._store.dispatch(
      new fromStore.SetData({
        notifyWeatherPrecautions: event.detail.checked,
      })
    );
  }

  saveSettings() {
    if (this.homeConfig.firstTimeDose) {
      this.goTo('home');
      setTimeout(() => {
        this._store.dispatch(
          new fromSharedStore.AlertShow({
            mode: 'full',
            template: `
            <img src="assets/images/alert-setup-reminders.svg" />
            <h1 class="font-heading-1--bold">Smart reminders saved</h1>
            <p>AutoMagic will learn from your selections to improve recommendations.</p>
          `,
            actions: [
              {
                label: 'Ok, let’s go!',
                action: () => {
                  this._store.dispatch(new fromSharedStore.AlertHide());
                  // hold on until Alert component is closed
                  setTimeout(() => {
                    // set as false first time dose property into home config
                    this._store.dispatch(
                      new fromHomeStore.SetData({
                        firstTimeDose: false,
                      })
                    );
                  }, 500);
                },
              },
            ],
          })
        );
      }, 500);
    } else {
      this.goTo('settings');
    }
  }

  goTo(path: string) {
    this._store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }
}
