import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import { WotlweduGroup } from '../../datamodel/wotlwedu-group.model';
import { GroupDataService } from '../../service/groupdata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.css',
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  listName: string = 'userdetail';
  groupSub: Subscription;
  currentGroup: WotlweduGroup = null;
  groupDetailForm: FormGroup;
  editMode: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  dnd: WotlweduDragAndDropController;
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private groupDataService: GroupDataService,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController(this.dragAndDropService);
    this.dnd.setListName( this.listName );
    this.dnd.setDropCallback(this.handleDroppedItem.bind(this));
    this.groupSub = this.groupDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (role: WotlweduGroup) => {
        if (role) {
          this.currentGroup = role;
          this.editMode = true;
          this.initForm();
        }
      },
    });
    this.initForm();
  }

  ngOnDestroy() {
    if (this.groupSub) this.groupSub.unsubscribe();
    if (this.dnd) this.dnd.unsub();
  }

  onSubmit() {
    let groupId = null;
    if (this.groupDetailForm.value.groupId) {
      groupId = this.groupDetailForm.value.groupId;
    }
    const name = this.groupDetailForm.value.name;
    const description = this.groupDetailForm.value.description;
    const users = this.currentGroup.users;

    /* Work out which users are added or deleted */
    let usersToAdd = [];
    let usersToDelete = [];
    for (let user of users) {
      if (user.isDeleted) {
        usersToDelete.push(user.id);
      } else if (user.isNew) {
        usersToAdd.push(user.id);
      }
    }

    /* Update the role itself */
    this.groupDataService.saveGroup(groupId, name, description).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (updateResponse) => {
        /* Add and delete the capabilities */
        if (updateResponse && updateResponse.data.group) {
          const newGroupId = updateResponse.data.group.id;
          this.groupDataService
            .deleteUsers(newGroupId, usersToDelete)
            .subscribe({
              error: (err) => this.alertBox.handleError(err),
              next: (delResponse) => {
                this.groupDataService
                  .addUsers(newGroupId, usersToAdd)
                  .subscribe({
                    error: (err) => this.alertBox.handleError(err),
                    next: (addResponse) => {
                      this.groupDataService.getAllData();
                      this.onCancel();
                    },
                  });
              },
            });
        }
      },
    });
  }

  initForm() {
    let groupId = '';
    let name = '';
    let description = '';

    if (this.currentGroup) {
      groupId = this.currentGroup.id;
      name = this.currentGroup.name;
      description = this.currentGroup.description;
    }
    this.groupDetailForm = new FormGroup({
      groupId: new FormControl(groupId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentGroup) this.groupDetailForm.markAsDirty();
  }

  onCancel() {
    this.groupDetailForm.reset();

    /* Remove any newly-added or deleted users */
    if (this.currentGroup && this.currentGroup.users) {
      const revertUsers = this.currentGroup.users.filter((user) => !user.isNew);
      revertUsers.forEach((user) => (user.isDeleted = false));
      this.currentGroup.users = revertUsers;
    }

    this.currentGroup = null;
    this.editMode = false;
  }

  deleteGroup(groupId: string) {
    this.groupDataService.deleteGroup(groupId).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.groupDataService.getAllData();
        this.onCancel();
      },
    });
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteGroup(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showDeleteConfirmationDialog( this.groupDetailForm.value.groupId );
    this.onCancel();
  }

  onDropUser(event) {
    const droppedItem = this.dragAndDropService.objectPickedUp;
    /* 
If something got dropped on this component and it is a "user" type and has a source property,
and that source isn't the same as our listName property, it means a new user is being added
*/
    if (
      droppedItem &&
      droppedItem.type &&
      droppedItem.type === 'user' &&
      droppedItem.source !== this.listName
    ) {
      if (!this.currentGroup) {
        this.currentGroup = new WotlweduGroup();
        this.currentGroup.id = null;
        this.currentGroup.users = [];
      }
      /* Check to see if this user already exists in the array */
      const userExists = this.currentGroup.users.find(
        (user) => user.id === droppedItem.id
      );

      if (!userExists) {
        const newUser = new WotlweduUser();
        newUser.id = droppedItem.id;
        newUser.fullName = droppedItem.name;
        newUser.isNew = true;
        newUser.isDeleted = false;
        this.currentGroup.users.push(newUser);
      } else {
        /* If the user exists in the list already, it might have been
        deleted so we need to reinstate it */
        userExists.isDeleted = false;
      }
      this.dragAndDropService.reset();
    }
    /*
    Let the DragAndDropService know that it can tell all the subscribers
    that the current item has been dropped.
    */
    this.dragAndDropService.drop(this.listName);
    this.groupDetailForm.markAsDirty();
    this.groupDetailForm.markAsTouched();
  }

  handleDroppedItem(id: string) {
    this.currentGroup.users.forEach((user) => {
      if (user.id === id) {
        user.isDeleted = true;
      }
    });
  }
}
