import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from '../../service/userdata.service';
import { Subscription } from 'rxjs';
import { WotlweduFriend } from '../../datamodel/wotlwedu-friend.model';
import { AuthDataService } from '../../service/authdata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduContextController } from '../../controller/wotlwedu-context-controller.class';
import { WotlweduContextOption } from '../../datamodel/wotlwedu-context-option.model';
import { DataSignalService } from '../../service/datasignal.service';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-friend-select',
  templateUrl: './friend-select.component.html',
  styleUrl: './friend-select.component.css',
})
export class FriendSelectComponent implements OnInit, OnDestroy {
  currentFriends: WotlweduFriend[];
  updateInProgress: boolean = false;
  authSub: Subscription;
  friendsSub: Subscription;
  userId: string = null;
  @Input() allowAdd: boolean = true;
  addFriend: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  listName: string = 'friendlist';
  dnd: WotlweduDragAndDropController;
  contextMenu: WotlweduContextController = new WotlweduContextController();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  private showBlocked: boolean = false;

  // Context Menu properties
  private removeRequestContextOptions: WotlweduContextOption[] = [
    {
      name: 'Remove Request',
      enabled: true,
      cb: this.confirmDeleteRelationship.bind(this),
    },
  ];

  private unfriendContextOptions: WotlweduContextOption[] = [
    {
      name: 'Unfriend',
      enabled: true,
      cb: this.confirmDeleteRelationship.bind(this),
    },
    {
      name: 'Unfriend And Block',
      enabled: true,
      cb: this.confirmUnfriendAndBlock.bind(this),
    },
  ];

  private unblockContextOptions: WotlweduContextOption[] = [
    {
      name: 'Unblock',
      enabled: true,
      cb: this.confirmDeleteRelationship.bind(this),
    },
    {
      name: 'Unblock and Send Request',
      enabled: true,
      cb: this.confirmUnblockAndRequest.bind(this),
    },
  ];

  constructor(
    private userDataService: UserDataService,
    private authDataService: AuthDataService,
    private dragAndDropService: DragAndDropService,
    private dataSignalService: DataSignalService
  ) {}

  ngOnInit(): void {
    this.dnd = new WotlweduDragAndDropController(this.dragAndDropService);
    this.authSub = this.authDataService.authData.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (authdata) => {
        if (authdata) {
          this.userId = authdata.id;
        }
      },
    });

    this.friendsSub = this.dataSignalService.refreshDataSignal.subscribe({
      next: (response) => {
        this.updateFriendsList(this.showBlocked);
      },
    });

    this.updateFriendsList(this.showBlocked);
  }

  confirmUnblockAndRequest(object: any) {
    this.confirmDialog.setYesAction(this.unblockAndRequest.bind(this));
    this.showConfirmationDialog(object);
  }

  confirmUnfriendAndBlock(object: any) {
    this.confirmDialog.setYesAction(this.unfriendAndBlock.bind(this));
    this.showConfirmationDialog(object);
  }

  confirmDeleteRelationship(object: any) {
    this.confirmDialog.setYesAction(this.deleteRelationship.bind(this));
    this.showConfirmationDialog(object);
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogNoClick(object: any) {
    this.confirmDialog.hide();
  }

  deleteRelationship(object: any) {
    if (!object || !object.id) return;
    this.userDataService.deleteRelationship(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.updateFriendsList(this.showBlocked);
      },
    });
  }

  blockByUserId(userId: string) {
    if (!userId) return;
    this.userDataService.blockFriend(userId).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.updateFriendsList(this.showBlocked);
      },
    });
  }

  unfriendAndBlock(object: any) {
    if (!object || !object.id) return;

    this.userDataService.deleteRelationship(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (response && response.data && response.data.friend) {
          this.blockByUserId(response.data.friend);
        } else {
          this.updateFriendsList(this.showBlocked);
        }
      },
    });
  }

  makeFriendRequestById(friendId: string) {
    if (!friendId) return;

    this.userDataService.addFriendById(friendId).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.updateFriendsList(this.showBlocked);
      },
    });
  }

  unblockAndRequest(object: any) {
    if (!object || !object.id) return;

    this.userDataService.deleteRelationship(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (response && response.data && response.data.friend) {
          this.makeFriendRequestById(response.data.friend);
        } else {
          this.updateFriendsList(this.showBlocked);
        }
      },
    });
  }

  updateFriendsList(showBlocked?: boolean) {
    if (this.updateInProgress) return;

    if (this.userId) {
      this.updateInProgress = true;
      this.userDataService.getFriends(this.userId, showBlocked).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (friendsResponse) => {
          if (
            friendsResponse &&
            friendsResponse.data &&
            friendsResponse.data.friends
          ) {
            this.currentFriends = friendsResponse.data.friends;
            this.updateInProgress = false;
          }
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
  }

  onClickAdd() {
    this.addFriend = true;
  }

  onCloseAdd() {
    this.addFriend = false;
  }

  /* Place holder in case we need to do something with a selection event */
  onSelect(index: number) {}

  onShowBlocked(event) {
    this.showBlocked = event.srcElement.checked ? true : false;
    this.updateFriendsList(this.showBlocked);
  }

  onContextMenu(event, index) {
    let menuOptions;
    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);

    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.currentFriends[index].id);

    menuOptions = [];

    if (this.currentFriends[index].status.name === 'Pending') {
      menuOptions = menuOptions.concat(this.removeRequestContextOptions);
    } else if (this.currentFriends[index].status.name === 'Blocked') {
      menuOptions = menuOptions.concat(this.unblockContextOptions);
    } else {
      menuOptions = menuOptions.concat(this.unfriendContextOptions);
    }

    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }
}
