import { 
  Component, 
  OnInit, OnDestroy,
  ViewChild,
} from '@angular/core';
import { Store } from "@ngrx/store";
import { Observable, Subscription } from "rxjs";

import * as fromStore from '@shared/store';
import * as fromDirectives from '@shared/directives';

import { WelcomeTestComponent } from '@welcome/components';

@Component({
  selector: 'automagic-overlay',
  templateUrl: 'overlay.component.html',
  styleUrls: ['overlay.component.scss'],
})
export class OverlayComponent implements OnInit, OnDestroy {
  public show$: Observable<boolean>;
  private _showSubs$!: Subscription;
  public show: boolean = false;

  public options$: Observable<any>;
  private _optionsSubs$!: Subscription;
  public options: any = {};

  public content$: Observable<any>;
  private _contentSubs$!: Subscription;
  public content: any;

  @ViewChild(fromDirectives.HostDirective, {static: true}) host!: fromDirectives.HostDirective;

  constructor(
    private _store: Store<fromStore.SharedState>,
  ) {
    this.show$ = this._store.select(fromStore.getOverlayShow);
    this.options$ = this._store.select(fromStore.getOverlayOptions);
    this.content$ = this._store.select(fromStore.getOverlayContent);
  }

  get isComponent(): boolean {
    return !!this.content && typeof this.content !== 'string';
  }

  ngOnInit() {
    this._showSubs$ = this.show$.subscribe(show => {
      this.show = show;
    });

    this._optionsSubs$ = this.options$.subscribe(options => {
      this.options = options;
    });

    this._contentSubs$ = this.content$.subscribe(content => {
      this.content = content;
      if (this.isComponent) {
        this._loadComponent();
      } else {
        const viewContainerRef = this.host.viewContainerRef;
        viewContainerRef.clear();
      }
    });
  }

  ngOnDestroy() {
    this._showSubs$.unsubscribe();
    this._optionsSubs$.unsubscribe();
    this._contentSubs$.unsubscribe();
    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();
  }

  toggle() {
    if (this.show) {
      this._store.dispatch(new fromStore.OverlayClose);
    }
    else {
      this._store.dispatch(new fromStore.OverlayShow({
        options: this.options,
        content: this.content,
      }));
    }
  }

  private _loadComponent() {
    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(WelcomeTestComponent);
  }
}
