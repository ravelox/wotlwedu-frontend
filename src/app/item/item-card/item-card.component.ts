import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WotlweduItem } from '../../datamodel/wotlwedu-item.model';
import { ItemDataService } from '../../service/itemdata.service';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';
import { WotlweduContextController } from '../../controller/wotlwedu-context-controller.class';
import { WotlweduContextOption } from '../../datamodel/wotlwedu-context-option.model';
import { DataSignalService } from '../../service/datasignal.service';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.css',
})
export class ItemCardComponent implements OnInit, OnDestroy {
  items: WotlweduItem[];
  itemsSub: Subscription;
  itemData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  dnd: WotlweduDragAndDropController;
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  contextMenu: WotlweduContextController = new WotlweduContextController();
  friendMiniVisible: boolean = false;
  private _pendingShare: string = null;

  // Context Menu properties
  private shareContextOptions: WotlweduContextOption[] = [
    {
      name: 'Share',
      enabled: true,
      cb: this.shareItemAction.bind(this),
    },
  ];

  private deleteContextOptions: WotlweduContextOption[] = [
    {
      name: 'Delete',
      enabled: true,
      cb: this.showDeleteConfirmationDialog.bind(this),
    },
  ];

  constructor(
    private itemDataService: ItemDataService,
    private dragAndDropService: DragAndDropService,
    private dataSignalService: DataSignalService,
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController( this.dragAndDropService)
    this.pages.setService(this.itemDataService);
    this.filter.setService(this.itemDataService);
    this.itemsSub = this.itemDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (items) => {
        this.items = items;
        this.pages.updatePages();
      },
    });
  }

  ngOnDestroy() {
    this.itemsSub.unsubscribe();
  }

  onSelect(index: number) {
    this.itemDataService.setData(this.items[index]);
  }
  
  onContextMenu(event, index: number) {
    let menuOptions = [];
    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);
    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.items[index].id);

    menuOptions = menuOptions.concat(this.shareContextOptions);
    menuOptions = menuOptions.concat(this.contextMenu.separatorOption);
    menuOptions = menuOptions.concat(this.deleteContextOptions);

    /* Toggle the read/unread option */
    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  shareItemAction(object: any) {
    this._pendingShare = object.id;
    this.friendMiniVisible = true;
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.deleteItem.bind(this));
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage(
      'Are you sure?'
    );
    this.confirmDialog.setObjectData(object.id);
    this.confirmDialog.show();
  }

  onFriendMiniClose() {
    this.friendMiniVisible = false;
  }

  dialogNoClick(object) {
    this.confirmDialog.hide();
    this._pendingShare = null;
  }

  onFriendSelect(event: WotlweduUser) {
    this.confirmDialog.setYesAction(this.shareItem.bind(this));
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage(
      'Are you sure you want to share an item with ' + event.fullName + '?'
    );
    this.confirmDialog.setObjectData({
      imageId: this._pendingShare,
      userId: event.id,
    });
    this.confirmDialog.show();
  }

  shareItem(object: any) {
    this.itemDataService.shareItem(object.imageId, object.userId).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {},
    });
  }

  deleteItem(object: any) {
    this.itemDataService.deleteItem(object).subscribe({
      error: (err)=>this.alertBox.handleError(err),
      next: (response)=>{
        this.itemDataService.setData(null);
        this.itemDataService.getAllData();
      }
    })
  }
  
}
