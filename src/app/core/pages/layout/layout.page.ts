import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '../../store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-layout',
  templateUrl: 'layout.page.html',
  styleUrls: ['layout.page.scss'],
})
export class LayoutPage implements OnInit {
  public config$: Observable<any>;
  public config: any;
  public backdropConfig$: Observable<any>;
  public backdropConfig: any;
  public bottomToolbarConfig$: Observable<any>;
  public bottomToolbarConfig: any;
  @ViewChild('main') wrapper!: ElementRef;

  constructor(
    private _store: Store<fromStore.LayoutState>,
  ) {
    this.config$ = this._store.select(fromStore.getLayoutConfig);
    this.backdropConfig$ = this._store.select(fromSharedStore.getBackdropConfig);
    this.bottomToolbarConfig$ = this._store.select(fromSharedStore.getBottomToolbarConfig);
  }

  ngOnInit() {
    this.config$.subscribe(config => {
      if (config) {
        this.config = config;
      }
    });
    
    this.backdropConfig$.subscribe(backdropConfig => {
      if (backdropConfig) {
        this.backdropConfig = backdropConfig;
      }
    });

    this.bottomToolbarConfig$.subscribe(bottomToolbarConfig => {
      if (bottomToolbarConfig) {
        this.bottomToolbarConfig = bottomToolbarConfig;
      }
    });
  }

  onPanGesture(event: any) {
    console.log('onPanGesture ', event);
  }
}
