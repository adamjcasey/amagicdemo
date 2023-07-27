import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@resources/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-your-care-team-detail',
  templateUrl: './your-care-team-detail.page.html',
  styleUrls: ['./your-care-team-detail.page.scss'],
})
export class YourCareTeamDetailPage implements OnInit {
  public resourcesConfig$!: Observable<any>;
  public config: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;
  public memberSelected: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.resourcesConfig$ = this._store.select(fromStore.getResourcesConfig);
  }

  ngOnInit() {
    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(resourcesConfig => {
        if (resourcesConfig) {
          this.config = resourcesConfig.yourCareTeam;
          this.memberSelected = this.config.memberSelected;
          if (this.memberSelected) {
            this.heroConfig = {
              color: '--color-bg-pastel-blue',
              extraCss: 'padding-bottom: var(--size-xxxxl)',
              template: `
                <h1 class="font-heading-1--bold">${this.config.memberSelected.name}</h1>
               `,
            }
          }
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  deleteMember(memberToDelete: any) {
    let indexMemberSelected = this.config.myTeam.findIndex((member: any) => {
      return member.name === memberToDelete.name; 
    });
    if (indexMemberSelected >= 0) {
      const myTeam = this.config.myTeam.map((member: any) => member);
      myTeam.splice(indexMemberSelected, 1);
      this._store.dispatch(new fromStore.UpdateCareTeam({
        myTeam: myTeam,
      }));
    }
    else {
      indexMemberSelected = this.config.caregivers.findIndex((member: any) => {
        return member.name === memberToDelete.name; 
      });
      const caregivers = this.config.caregivers.map((member: any) => member);
      caregivers.splice(indexMemberSelected, 1);
      this._store.dispatch(new fromStore.UpdateCareTeam({
        caregivers: caregivers,
      }));
    }

    this.goTo('resources/your-care-team/list');
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
