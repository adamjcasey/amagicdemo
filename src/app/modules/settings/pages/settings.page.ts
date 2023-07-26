import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@settings/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
  public settingsConfig$!: Observable<any>;
  public settingsConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public card: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.settingsConfig$ = this._store.select(fromStore.getSettingsConfig);
    this.card = {
      asset: '/assets/images/settings-start-setup-reminders.svg',
      title: 'Like a smart reminder?',
      description: 'Smart reminders can use data to improve recommendations.',
      link: {
        label: 'Let’s start',
        action: () => {
          this.goTo('settings/setup-reminders');
        }
      },
    }
  }

  ngOnInit() {
    this.settingsConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(settingsConfig => {
        if (settingsConfig) {
          this.settingsConfig = settingsConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  saveSettings(event: any, parent: string, value: string) {
    switch(parent) {
      case 'notifications':
        const notifications = [...this.settingsConfig.notifications];
        if (event.detail.checked) {
          notifications.push(value);
        }
        else {
          const indexToDelete = notifications.findIndex((notification: any) => {
            return notification === value;
          });
          notifications.splice(indexToDelete, 1);
        }
        
        this._store.dispatch(new fromStore.SetData({
          notifications: notifications,
        }));
        break;

      case 'integrations':
        const integrations = [...this.settingsConfig.integrations];
        if (event.detail.checked) {
          integrations.push(value);
        }
        else {
          const indexToDelete = integrations.findIndex((notification: any) => {
            return notification === value;
          });
          integrations.splice(indexToDelete, 1);
        }

        this._store.dispatch(new fromStore.SetData({
          integrations: integrations,
        }));
        break;
    }
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
