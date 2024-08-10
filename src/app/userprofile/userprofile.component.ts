import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';

import { WotlweduAlert } from '../controller/wotlwedu-alert-controller.class';
import { WotlweduImage } from '../datamodel/wotlwedu-image.model';
import { WotlweduDialogController } from '../controller/wotlwedu-dialog-controller.class';
import { UserDataService } from '../service/userdata.service';
import { WotlweduUser } from '../datamodel/wotlwedu-user.model';
import { AuthDataService } from '../service/authdata.service';
import { Subscription, take } from 'rxjs';
import { DragAndDropService } from '../service/dragdrop.service';
import { ImageDataService } from '../service/imagedata.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userProfileForm: FormGroup;
  alertBox: WotlweduAlert = new WotlweduAlert();
  currentImage: WotlweduImage = null;
  imageSelectorVisible: boolean = false;
  friendListVisible: boolean = false;
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  currentUser: WotlweduUser = null;
  authUserId: string = null;
  enable2faVisible: boolean = false;
  verify2faVisible: boolean = false;
  private _pendingEnable2FA: boolean = false;
  private _pendingEnable2FAValue: boolean = false;
  private _pendingLogout: boolean = false;

  constructor(
    private userDataService: UserDataService,
    private imageDataService: ImageDataService,
    private authDataService: AuthDataService,
    private dragAndDropService: DragAndDropService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authDataService.authData.pipe(take(1)).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (authData) => {
        if (authData && authData.id) {
          this.authUserId = authData.id;
          this.getAuthUserData();
        }
      },
    });
    this.initForm();
  }

  ngOnDestroy(): void {}

  onSubmit(f: NgForm) {
    if (f.value.email != this.currentUser.email) {
      if (f.value.resetpassword) {
        this.alertBox.setErrorMessage(
          'Cannot change email address and reset password at the same time'
        );
        this.userProfileForm.controls['resetpassword'].setValue(false);
        return;
      }
    }

    if( ! this.currentUser.verified ) {
      this.alertBox.setErrorMessage("Cannot make changes until email address is verified");
      return;
    }

    const userObject = new WotlweduUser();

    if (f.value.userId) {
      userObject.id = f.value.userId;
    }
    userObject.email = f.value.email;
    userObject.firstName = f.value.firstName;
    userObject.lastName = f.value.lastName;
    userObject.alias = f.value.alias;
    userObject.enable2fa = f.value.enable2fa;
    userObject.image = new WotlweduImage();
    userObject.image.id = this.currentImage ? this.currentImage.id : null;

    if (f.value.resetpassword) {
      this.authDataService.requestPasswordReset(userObject.email).subscribe({
        error: (err) => {
          this.alertBox.handleError(err);
        },
        next: () => {},
      });
    }

    this.userDataService.saveUser(userObject).subscribe({
      error: (err) => {
        this.alertBox.handleError(err);
      },
      next: (result) => {
        if( result && result.data && result.data.emailChange ) {
          if( result.data.emailChange === true ) {
            this._pendingLogout = true;
            this.alertBox.setErrorMessage("Email address has been changed. You will be logged out until the address has been confirmed");
          }
        } else {
          this.onCancel();
        }
       },
    });
  }

  onCancel() {
    this.userProfileForm.reset();
    this.getAuthUserData();
  }

  onDrop(event) {
    const droppedItem = this.dragAndDropService.objectPickedUp;

    if (!droppedItem || droppedItem.type !== 'image') {
      this.dragAndDropService.reset();
      return;
    }

    if (!this.currentImage) {
      this.currentImage = new WotlweduImage();
    }
    this.currentImage.id = droppedItem.id;
    this.userProfileForm.markAsDirty();

    this.dragAndDropService.reset();

    /*
    Let the DragAndDropService know that it can tell all the subscribers
    that the current item has been dropped.
    */
    this.dragAndDropService.drop('userimage');

    /* Now get the image details so we can display it */
    this.imageDataService.getData(this.currentImage.id).subscribe({
      /* We can ignore any errors */
      error: (err) => {},
      next: (response) => {
        if (response.data && response.data.image) {
          this.currentImage = response.data.image;
        }
      },
    });
  }

  onDragOver(event) {
    event.preventDefault();
  }

  getAuthUserData() {
    if (this.authUserId) {
      this.userDataService.getData(this.authUserId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (userData) => {
          if (userData && userData.data && userData.data.user)
            this.currentUser = userData.data.user;
          this.initForm();
        },
      });
    }
  }

  toggleImageSelector() {
    this.imageSelectorVisible = !this.imageSelectorVisible;
  }

  initForm() {
    let userId: string = '';
    let email: string = '';
    let firstName: string = '';
    let lastName: string = '';
    let alias: string = '';
    let active: boolean = false;
    let verified: boolean = false;
    let enable2fa: boolean = false;

    if (this.currentUser) {
      userId = this.currentUser.id;
      email = this.currentUser.email;
      firstName = this.currentUser.firstName;
      lastName = this.currentUser.lastName;
      alias = this.currentUser.alias;
      if (this.currentUser.active) active = this.currentUser.active;
      if (this.currentUser.verified) verified = this.currentUser.verified;
      this.currentImage = this.currentUser.image
        ? this.currentUser.image
        : null;
      if (this.currentUser.enable2fa) enable2fa = this.currentUser.enable2fa;
    }
    this.userProfileForm = new FormGroup({
      userId: new FormControl(userId),
      email: new FormControl(email, Validators.required),
      firstName: new FormControl(firstName, Validators.required),
      lastName: new FormControl(lastName, Validators.required),
      alias: new FormControl(alias),
      active: new FormControl(active),
      verified: new FormControl(verified),
      resetpassword: new FormControl(false),
      enable2fa: new FormControl(enable2fa),
    });

    this.userProfileForm.markAsUntouched();
  }

  on2FACheckbox(event) {
    this._pendingEnable2FA = true;
    this._pendingEnable2FAValue = event.srcElement.checked;
    if (event.srcElement.checked) {
      this.authDataService.enable2FA().subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (response) => {
          this.enable2faVisible = true;
          this.verify2faVisible = false;
        },
      });
    } else {
      this.enable2faVisible = false;
      this.verify2faVisible = true;
    }
  }

  onClose2FA(verified: boolean) {
    this.enable2faVisible = false;
    if (!verified) {
      this.userProfileForm.controls['enable2fa'].setValue(
        this.currentUser.enable2fa
      );
    }
  }

  onCloseVerify2FA(verified: boolean) {
    this.verify2faVisible = false;
    if (!verified && this.currentUser) {
      this.userProfileForm.controls['enable2fa'].setValue(
        this.currentUser.enable2fa
      );
    }
    this._pendingEnable2FA = false;
    this._pendingEnable2FAValue = false;
  }

  onCloseAlert() {
    if( ! this._pendingLogout ) {
      this.alertBox.onCloseAlert();
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
