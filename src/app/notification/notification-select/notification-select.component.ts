import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { NotificationDataService } from '../../service/notificationdata.service';
import { WotlweduNotification } from '../../datamodel/wotlwedu-notification.model';
import { WotlweduContextOption } from '../../datamodel/wotlwedu-context-option.model';
import { WotlweduContextController } from '../../controller/wotlwedu-context-controller.class';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { SharedDataService } from '../../service/shareddata.service';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';
import { VoteDataService } from '../../service/votedata.service';
import { UserDataService } from '../../service/userdata.service';
import { DataSignalService } from '../../service/datasignal.service';
import { ImageDataService } from '../../service/imagedata.service';
import { ListDataService } from '../../service/listdata.service';
import { ItemDataService } from '../../service/itemdata.service';
import { WotlweduViewerController } from '../../controller/wotlwedu-viewer-controller.class';

@Component({
  selector: 'app-notification-select',
  templateUrl: './notification-select.component.html',
  styleUrl: './notification-select.component.css',
})
export class NotificationSelectComponent implements OnInit, OnDestroy {
  notifications: WotlweduNotification[];
  notificationSub: Subscription;
  contextMenu: WotlweduContextController = new WotlweduContextController();
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  listViewer: WotlweduViewerController = new WotlweduViewerController();
  itemViewer: WotlweduViewerController = new WotlweduViewerController();
  imageViewer: WotlweduViewerController = new WotlweduViewerController();

  // Context Menu properties
  private voteContextOptions: WotlweduContextOption[] = [
    {
      name: 'Vote',
      enabled: true,
      cb: this.getVoteFromNotification.bind(this),
    },
  ];
  private friendContextOptions: WotlweduContextOption[] = [
    {
      name: 'Accept Friend Request',
      enabled: true,
      cb: this.acceptFriendRequest.bind(this),
    },
    {
      name: 'Block',
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private imageShareContextOptions: WotlweduContextOption[] = [
    {
      name: 'View Image',
      enabled: true,
      cb: this.viewImage.bind(this),
    },
    {
      name: 'Accept Image',
      enabled: true,
      cb: this.acceptImageShare.bind(this),
    },
    {
      name: 'Block Sender',
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private itemShareContextOptions: WotlweduContextOption[] = [
    {
      name: 'View Item',
      enabled: true,
      cb: this.viewItem.bind(this),
    },
    {
      name: 'Accept Item',
      enabled: true,
      cb: this.acceptItemShare.bind(this),
    },
    {
      name: 'Block Sender',
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private listShareContextOptions: WotlweduContextOption[] = [
    {
      name: 'View List',
      enabled: true,
      cb: this.viewList.bind(this),
    },
    {
      name: 'Accept List',
      enabled: true,
      cb: this.acceptListShare.bind(this),
    },
    {
      name: 'Block Sender',
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private markAsReadOptions: WotlweduContextOption[] = [
    {
      name: 'Mark as Read',
      enabled: true,
      cb: this.markAsRead.bind(this),
    },
  ];
  private markAsUnreadOptions: WotlweduContextOption[] = [
    {
      name: 'Mark as Unread',
      enabled: true,
      cb: this.markAsUnread.bind(this),
    },
  ];

  private defaultContextOptions: WotlweduContextOption[] = [
    {
      name: 'Delete',
      enabled: true,
      cb: this.showDeleteConfirmationDialog.bind(this),
    },
  ];

  constructor(
    private notificationDataService: NotificationDataService,
    private voteDataService: VoteDataService,
    private userDataService: UserDataService,
    private imageDataService: ImageDataService,
    private itemDataService: ItemDataService,
    private listDataService: ListDataService,
    private sharedDataService: SharedDataService,
    private dataSignalService: DataSignalService
  ) {}

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  showBlockConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogBlockYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogBlockNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure you want to block this user?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogBlockYesClick(object: any) {
    this.blockUser(object);
    this.confirmDialog.hide();
  }

  dialogBlockNoClick(object: any) {
    this.confirmDialog.hide();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteNotification(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  acceptImageShare(object: any) {
    if (!object || !object.id) return;
    this.imageDataService.acceptImage(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.notificationDataService.getAllData();
      },
    });
  }

  acceptItemShare(object: any) {
    if (!object || !object.id) return;
    this.itemDataService.acceptItem(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.notificationDataService.getAllData();
      },
    });
  }

  acceptListShare(object: any) {
    if (!object || !object.id) return;
    this.listDataService.acceptList(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.notificationDataService.getAllData();
      },
    });
  }

  acceptFriendRequest(object: any) {
    if (!object || !object.id) return;

    this.notificationDataService.getData(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (
          response &&
          response.data &&
          response.data.notification &&
          response.data.notification.objectId
        ) {
          this.userDataService
            .confirmFriend(response.data.notification.objectId)
            .subscribe({
              error: (err) => this.alertBox.handleError(err),
              next: (response) => {
                this.deleteNotification(object);
                this.dataSignalService.refreshData();
              },
            });
        } else {
          return of(null);
        }
      },
    });
  }

  blockUser(object: any) {
    if (!object || !object.id) return;
    this.notificationDataService.getData(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (
          response &&
          response.data &&
          response.data.notification &&
          response.data.notification.sender
        ) {
          this.userDataService
            .blockFriend(response.data.notification.sender.id)
            .subscribe({
              error: (err) => this.alertBox.handleError(err),
              next: (response) => {
                this.deleteNotification(object);
                this.dataSignalService.refreshData();
              },
            });
        } else {
          return of(null);
        }
      },
    });
  }

  getVoteFromNotification(object: any) {
    if (!object || !object.id) return;
    this.notificationDataService.getData(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (notifResponse) => {
        if (
          notifResponse &&
          notifResponse.data &&
          notifResponse.data.notification
        ) {
          this.voteDataService
            .getNextVote(notifResponse.data.notification.objectId)
            .subscribe({
              error: (err) => this.alertBox.handleError(err),
              next: (voteResponse) => {
                if (
                  voteResponse &&
                  voteResponse.data &&
                  voteResponse.data.count > 0
                ) {
                  this.voteDataService.setData(voteResponse.data.rows[0]);
                  this.markAsRead({ id: object.id });
                }
              },
            });
        }
      },
    });
  }

  deleteNotification(object: any) {
    if (!object || !object.id) return;
    this.notificationDataService.deleteNotification(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.notificationDataService.getAllData();
      },
    });
  }

  markAsRead(object: any) {
    this.notificationDataService.setStatus(object.id, 'Read').subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.notificationDataService.getAllData();
      },
    });
  }

  markAsUnread(object: any) {
    this.notificationDataService.setStatus(object.id, 'Unread').subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.notificationDataService.getAllData();
      },
    });
  }

  ngOnInit() {
    this.contextMenu.setService(this.dataSignalService);
    this.notificationSub = this.notificationDataService.dataChanged.subscribe(
      (notifications) => {
        this.notifications = notifications;
      }
    );
    this.notificationDataService.getAllData();
  }

  ngOnDestroy() {
    if (this.notificationSub) this.notificationSub.unsubscribe();
  }

  onSelect(index: number) {
    this.notificationDataService.setData(this.notifications[index]);
  }

  onContextMenu(event, index) {
    let menuOptions;
    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);
    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.notifications[index].id);

    menuOptions = [];

    switch (this.notifications[index].type) {
      case this.sharedDataService.getStatusId('Election Start'):
        menuOptions = this.voteContextOptions;
        break;
      case this.sharedDataService.getStatusId('Friend Request'):
        menuOptions = this.friendContextOptions;
        break;
      case this.sharedDataService.getStatusId('Share Image'):
        menuOptions = this.imageShareContextOptions;
        break;
      case this.sharedDataService.getStatusId('Share Item'):
        menuOptions = this.itemShareContextOptions;
        break;
      case this.sharedDataService.getStatusId('Share List'):
        menuOptions = this.listShareContextOptions;
        break;
    }

    menuOptions = menuOptions.concat(this.contextMenu.separatorOption);

    /* Toggle the read/unread option */
    const unreadStatus = this.sharedDataService.getStatusId('Unread');
    menuOptions = menuOptions.concat(
      this.notifications[index].status.id === unreadStatus
        ? this.markAsReadOptions
        : this.markAsUnreadOptions
    );
    menuOptions = menuOptions.concat(this.defaultContextOptions);
    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  viewList(object: any) {
    this.notificationDataService.getData(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (
          response &&
          response.data &&
          response.data.notification &&
          response.data.notification.objectId
        ) {
          this.listViewer.setDataId(response.data.notification.objectId);
          this.listViewer.setExtra(object.id);
          this.listViewer.show();
        }
      },
    });
  }

  onCloseListViewer() {
    this.listViewer.hide();
  }

  viewItem(object: any) {
    this.notificationDataService.getData(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (
          response &&
          response.data &&
          response.data.notification &&
          response.data.notification.objectId
        ) {
          this.itemViewer.setDataId(response.data.notification.objectId);
          this.itemViewer.setExtra(object.id);
          this.itemViewer.show();
        }
      },
    });
  }

  onCloseItemViewer() {
    this.itemViewer.hide();
  }

  viewImage(object: any) {
    this.notificationDataService.getData(object.id).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (
          response &&
          response.data &&
          response.data.notification &&
          response.data.notification.objectId
        ) {
          this.imageViewer.setDataId(response.data.notification.objectId);
          this.imageViewer.setExtra(object.id);
          this.imageViewer.show();
        }
      },
    });
  }

  onCloseImageViewer() {
    this.imageViewer.hide();
  }
}
