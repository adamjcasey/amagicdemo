import { 
  Component,
  ViewEncapsulation, 
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-inject-dose-notes',
  templateUrl: 'start-dose-inject-dose-notes.component.html',
  styleUrls: ['start-dose-inject-dose-notes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseInjectDoseNotesFormComponent implements OnInit {
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public doseNotesFormGroup: FormGroup;
  public symptoms: any[];

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
    this.doseNotesFormGroup = this._formBuilder.group({
      painful: ['', [Validators.required]],
      mood: ['', [Validators.required]],
      symptoms: ['', [Validators.required]],
      note: ['', ''],
    });

    this.symptoms = [
      {
        marked: false,
        label: 'Redness'
      },
      {
        marked: false,
        label: 'Swelling'
      },
      {
        marked: false,
        label: 'Itching'
      },
      {
        marked: false,
        label: 'No Reaction'
      },
    ]
  }

  ngOnInit() {}

  markReaction(event: any, index: number) {
    event.preventDefault();
    this.symptoms[index].marked = !this.symptoms[index].marked;
    this.doseNotesFormGroup.patchValue({
      symptoms: this.symptoms,
    });
  }

  ratingFieldUpdate(event: any, field: string) {
    this.doseNotesFormGroup.get(field)?.setValue(event);
  }
}
