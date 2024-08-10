import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PreferenceDataService } from '../../service/preferencedata.service';
import { WotlweduPreference } from '../../datamodel/wotlwedu-preference.model';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-preference-detail',
  templateUrl: './preference-detail.component.html',
  styleUrl: './preference-detail.component.css',
})
export class PreferenceDetailComponent implements OnInit, OnDestroy {
  preferenceDetailForm: FormGroup;
  prefSub: Subscription;
  editMode: boolean = false;
  currentPreference: WotlweduPreference;
alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(private preferenceDataService: PreferenceDataService) {}

  ngOnInit() {
    this.prefSub =
      this.preferenceDataService.details.subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (pref: WotlweduPreference) => {
          if (pref) {
            this.currentPreference = pref;
            this.editMode = true;
            this.initForm();
          }
        },
      });
    this.initForm();
  }

  ngOnDestroy() {
    this.prefSub.unsubscribe();
  }

  onSubmit() {
    let preferenceId = null;
    if (this.preferenceDetailForm.value.preferenceId) {
      preferenceId = this.preferenceDetailForm.value.preferenceId;
    }
    const name = this.preferenceDetailForm.value.name;
    const value = this.preferenceDetailForm.value.value;

    this.preferenceDataService
      .savePreference(preferenceId, name, value)
      .subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (response) => {
          this.preferenceDataService.getAllData();
          this.onCancel();
        },
      });
  }

  initForm() {
    let preferenceId = null;
    let name = '';
    let value = '';

    if (this.currentPreference) {
      preferenceId = this.currentPreference.id;
      name = this.currentPreference.name;
      value = this.currentPreference.value;
    }

    this.preferenceDetailForm = new FormGroup({
      preferenceId: new FormControl(preferenceId),
      name: new FormControl(name, Validators.required),
      value: new FormControl(value, Validators.required),
    });

    if (this.currentPreference) this.preferenceDetailForm.markAsDirty();
  }

  onCancel() {
    this.preferenceDetailForm.reset();
    this.editMode = false;
  }

  onDelete() {
    const preferenceId = this.preferenceDetailForm.value.preferenceId;

    if (preferenceId) {
      this.preferenceDataService.deletePreference(preferenceId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (response) => {
          this.preferenceDataService.getAllData();
          this.onCancel();
        },
      });
    }
  }

}
