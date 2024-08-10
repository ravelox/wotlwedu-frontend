import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from '../../service/userdata.service';
import { Subscription } from 'rxjs';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduImage } from '../../datamodel/wotlwedu-image.model';
import { ImageDataService } from '../../service/imagedata.service';
import { AuthDataService } from '../../service/authdata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  currentUser: WotlweduUser = null;
  userDetailForm: FormGroup;
  editMode: boolean = false;
  currentImage: WotlweduImage = null;
  imageSelectorVisible: boolean = false;
  friendListVisible: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private authDataService: AuthDataService,
    private userDataService: UserDataService,
    private dragAndDropService: DragAndDropService,
    private imageDataService: ImageDataService
  ) {}

  ngOnInit() {
    this.userSub = this.userDataService.details.subscribe({
      error: (err) => {
        this.alertBox.handleError(err);
      },
      next: (user: WotlweduUser) => {
        if (user) {
          if (user.id === this.authDataService.id) {
            this.alertBox.setErrorMessage('Cannot edit your own details');
          } else {
            this.currentUser = user;
            this.editMode = true;
            this.initForm();
          }
        }
      },
    });
    this.initForm();
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteUser(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onSubmit() {
    const userObject = new WotlweduUser();

    if (this.userDetailForm.value.userId) {
      userObject.id = this.userDetailForm.value.userId;
    }
    userObject.email = this.userDetailForm.value.email;
    userObject.firstName = this.userDetailForm.value.firstName;
    userObject.lastName = this.userDetailForm.value.lastName;
    userObject.alias = this.userDetailForm.value.alias;
    userObject.active = this.userDetailForm.value.active;
    userObject.verified = this.userDetailForm.value.verified;
    userObject.image = new WotlweduImage();
    userObject.image.id = this.currentImage ? this.currentImage.id : null;
    userObject.admin = this.userDetailForm.value.admin;

    if (this.userDetailForm.value.resetpassword) {
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
      next: () => {
        this.userDataService.getAllData();
        this.onCancel();
      },
    });
  }

  initForm() {
    let userId: string = '';
    let email: string = '';
    let firstName: string = '';
    let lastName: string = '';
    let alias: string = '';
    let active: boolean = false;
    let verified: boolean = false;
    let admin: boolean = false;

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
        if( this.currentUser.admin ) admin = this.currentUser.admin;
    }
    this.userDetailForm = new FormGroup({
      userId: new FormControl(userId),
      email: new FormControl(email, Validators.required),
      firstName: new FormControl(firstName, Validators.required),
      lastName: new FormControl(lastName, Validators.required),
      alias: new FormControl(alias),
      active: new FormControl(active),
      verified: new FormControl(verified),
      admin: new FormControl(admin),
      resetpassword: new FormControl(false),
    });

    if (this.currentUser) this.userDetailForm.markAsDirty();
  }

  onCancel() {
    this.userDetailForm.reset();
    this.currentUser = null;
    this.editMode = false;
    this.currentImage = null;
    this.userDataService.onCancel();
  }

  deleteUser(userId: string) {
    if (userId) {
      this.userDataService.deleteUser(userId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.userDataService.getAllData();
          this.onCancel();
        },
      });
    }
  }

  onDelete() {
    this.showConfirmationDialog(this.userDetailForm.value.userId);
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
    this.userDetailForm.markAsDirty();

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

  toggleImageSelector() {
    this.imageSelectorVisible = !this.imageSelectorVisible;
  }

  toggleFriendList() {
    this.friendListVisible = !this.friendListVisible;
  }
}
