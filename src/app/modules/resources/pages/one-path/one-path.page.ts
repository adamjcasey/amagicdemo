import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeroComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import {
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
} from '@ionic/angular/standalone';
import * as fromStore from '@resources/store';

@Component({
  selector: 'automagic-one-path',
  templateUrl: './one-path.page.html',
  styleUrls: ['./one-path.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeroComponent,
    IonContent,
    IonImg,
    IonIcon,
    IonInput,
  ],
})
export class OnePathPage implements OnInit, OnDestroy {
  public resourcesConfig$!: Observable<any>;
  public config: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.resourcesConfig$ = this._store.select(fromStore.getResourcesConfig);
    this.heroConfig = {
      color: '--color-bg-pastel-honey-yellow',
      extraCss: 'padding-bottom: var(--size-xxxxl)',
      template: `
        <h1 class="font-heading-1--bold">OnePath PSM Chat</h1>
      `,
    };
  }

  ngOnInit() {
    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((resourcesConfig) => {
        if (resourcesConfig.supportPatientChat) {
          this.config = resourcesConfig.supportPatientChat;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }
}
