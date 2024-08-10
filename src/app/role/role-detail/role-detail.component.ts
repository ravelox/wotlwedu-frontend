import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleDataService } from '../../service/roledata.service';
import { WotlweduRole } from '../../datamodel/wotlwedu-role.model';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import { WotlweduCap } from '../../datamodel/wotlwedu-cap.model';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDragAndDrop } from '../../interface/draganddrop.interface';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrl: './role-detail.component.css',
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  capListName: string = 'roledetail';
  userListName: string = 'userdetail';
  roleSub: Subscription;
  currentRole: WotlweduRole = null;
  roleDetailForm: FormGroup;
  filterForm: FormGroup;
  editMode: boolean = false;
  dragAndDropSub: Subscription;
  alertBox: WotlweduAlert = new WotlweduAlert();
  dnd: WotlweduDragAndDropController;
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private roleDataService: RoleDataService,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController(this.dragAndDropService);
    this.roleSub = this.roleDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (role: WotlweduRole) => {
        if (role) {
          this.currentRole = role;
          this.editMode = true;
          this.initForm();
        }
      },
    });
    this.initForm();
  }

  ngOnDestroy() {
    if (this.roleSub) this.roleSub.unsubscribe();
    if (this.dragAndDropSub) this.dragAndDropSub.unsubscribe();
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteRole(object);
    this.confirmDialog.hide();
    this.onCancel();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onSubmit() {
    let roleId = null;
    if (this.roleDetailForm.value.roleId) {
      roleId = this.roleDetailForm.value.roleId;
    }
    const name = this.roleDetailForm.value.name;
    const description = this.roleDetailForm.value.description;
    const capabilities = ( this.currentRole ? this.currentRole.capabilities : [] );
    const users = ( this.currentRole ? this.currentRole.users : []);

    /* Work out which capabilities are added or deleted */
    let capsToAdd = [];
    let capsToDelete = [];
    for (let cap of capabilities) {
      if (cap.isDeleted) {
        capsToDelete.push(cap.id);
      } else if (cap.isNew) {
        capsToAdd.push(cap.id);
      }
    }

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
    this.roleDataService.saveRole(roleId, name, description).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (updateResponse) => {
        if (updateResponse && updateResponse.data.role.id) {
          const newRoleId = updateResponse.data.role.id;
          this.roleDataService
            .deleteCapabilities(newRoleId, capsToDelete)
            .subscribe({
              error: (err) => this.alertBox.handleError(err),
              next: () => {
                this.roleDataService
                  .addCapabilities(newRoleId, capsToAdd)
                  .subscribe({
                    error: (err) => this.alertBox.handleError(err),
                    next: () => {
                      this.roleDataService
                        .deleteUsers(newRoleId, usersToDelete)
                        .subscribe({
                          error: (err) => this.alertBox.handleError(err),
                          next: () => {
                            this.roleDataService
                              .addUsers(newRoleId, usersToAdd)
                              .subscribe({
                                error: (err) => this.alertBox.handleError(err),
                                next: () => {
                                  this.roleDataService.getAllData();
                                  this.onCancel();
                                },
                              });
                          },
                        });
                    },
                  });
              },
            });
        }
      },
    });
  }

  initForm() {
    let roleId = '';
    let name = '';
    let description = '';

    if (this.currentRole) {
      roleId = this.currentRole.id;
      name = this.currentRole.name;
      description = this.currentRole.description;
    }
    this.roleDetailForm = new FormGroup({
      roleId: new FormControl(roleId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentRole) this.roleDetailForm.markAsDirty();
  }

  onCancel() {
    this.roleDetailForm.reset();

    /* Remove any newly added or deleted capabilities */
    if (this.currentRole && this.currentRole.capabilities) {
      const revertCapabilities = this.currentRole.capabilities.filter(
        (cap) => !cap.isNew
      );
      revertCapabilities.forEach((cap) => (cap.isDeleted = false));
      this.currentRole.capabilities = revertCapabilities;
    }

    if (this.currentRole && this.currentRole.users) {
      /* Remove any newly-added or deleted users */
      const revertUsers = this.currentRole.users.filter((user) => !user.isNew);
      revertUsers.forEach((user) => (user.isDeleted = false));
      this.currentRole.users = revertUsers;
    }

    this.currentRole = null;
    this.editMode = false;
  }

  deleteRole( roleId: string ){
    if (roleId) {
      this.roleDataService.deleteRole(roleId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.roleDataService.getAllData();
          this.onCancel();
        },
      });
    }
  }

  onDelete() {
    this.showConfirmationDialog(this.roleDetailForm.value.roleId);
  }

  onDropCap(event) {
    const droppedItem = this.dragAndDropService.objectPickedUp;

    /* 
If something got dropped on this component and it is a "capability" type and has a source property,
and that source isn't the same as our listName property, it means a new capability is being added
*/
    if (
      droppedItem.type === 'capability' &&
      droppedItem.source !== this.capListName
    ) {
      if (!this.currentRole) {
        this.currentRole = new WotlweduRole();
        this.currentRole.id = null;
        this.currentRole.capabilities = [];
        this.currentRole.users = [];
      }
      /* Check to see if this capability already exists in the array */
      const capaExists = this.currentRole.capabilities.find(
        (c) => c.id === droppedItem.id
      );

      if (!capaExists) {
        const newCap = new WotlweduCap();
        newCap.id = droppedItem.id;
        newCap.name = droppedItem.name;
        newCap.description = '';
        newCap.isNew = true;
        newCap.isDeleted = false;
        this.currentRole.capabilities.push(newCap);
      } else {
        /* If the capability exists in the list already, it might have been
        deleted so we need to reinstate it */
        capaExists.isDeleted = false;
      }
      this.dragAndDropService.reset();
    }
    /*
    Let the DragAndDropService know that it can tell all the subscribers
    that the current item has been dropped.
    */
    this.dragAndDropService.drop(this.capListName);
  }

  handleDroppedCap(droppedId) {
    this.currentRole.capabilities.forEach((c) => {
      if (c.id === droppedId) {
        c.isDeleted = true;
      }
    });
  }

  handleDroppedUser(droppedId) {
    this.currentRole.users.forEach((u) => {
      if (u.id === droppedId) {
        u.isDeleted = true;
      }
    });
  }

  onDragStartCap(event, type) {
    this.dnd.setDropCallback(this.handleDroppedCap.bind(this));
    this.dnd.setListName(this.capListName);
    this.dnd.onDragStart(event, type);
  }

  onDragStartUser(event, type) {
    this.dnd.setDropCallback(this.handleDroppedUser.bind(this));
    this.dnd.setListName(this.userListName);
    this.dnd.onDragStart(event, type);
  }

  onDropUser(event) {
    const droppedItem = this.dragAndDropService.objectPickedUp;

    /* 
If something got dropped on this component and it is a "user" type and has a source property,
and that source isn't the same as our listName property, it means a new user is being added
*/
    if (
      droppedItem.type === 'user' &&
      droppedItem.source !== this.userListName
    ) {
      if (!this.currentRole) {
        this.currentRole = new WotlweduRole();
        this.currentRole.id = null;
        this.currentRole.capabilities = [];
        this.currentRole.users = [];
      }

      /* Check to see if this user already exists in the array */
      const userExists = this.currentRole.users.find(
        (u) => u.id === droppedItem.id
      );

      if (!userExists) {
        const newUser = new WotlweduUser();
        newUser.id = droppedItem.id;
        newUser.email = droppedItem.name;
        newUser.isNew = true;
        newUser.isDeleted = false;
        this.currentRole.users.push(newUser);
      } else {
        /* If the capability exists in the list already, it might have been
        deleted so we need to reinstate it */
        userExists.isDeleted = false;
      }
      this.dragAndDropService.reset();
    }
    /*
    Let the DragAndDropService know that it can tell all the subscribers
    that the current item has been dropped.
    */
    this.dragAndDropService.drop(this.userListName);
  }
}
