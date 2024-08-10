import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduList } from '../../datamodel/wotlwedu-list.model';
import { ListDataService } from '../../service/listdata.service';
import { WotlweduItem } from '../../datamodel/wotlwedu-item.model';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.component.html',
  styleUrl: './list-detail.component.css',
})
export class ListDetailComponent implements OnInit, OnDestroy {
  itemListName: string = 'listitems';
  listSub: Subscription;
  currentList: WotlweduList = null;
  listDetailForm: FormGroup;
  filterForm: FormGroup;
  editMode: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  dnd: WotlweduDragAndDropController;
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private listDataService: ListDataService,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController( this.dragAndDropService );
    this.dnd.setDropCallback( this.handleDroppedItem.bind(this));
    this.listSub = this.listDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (list: WotlweduList) => {
        if (list) {
          this.currentList = list;
          this.editMode = true;
          this.initForm();
        }
      },
    });
    this.initForm();
  }

  ngOnDestroy() {
    if (this.listSub) this.listSub.unsubscribe();
    if( this.dnd ) this.dnd.unsub();
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteList(object);
    this.confirmDialog.hide();
    this.onCancel();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onSubmit() {
    let listId = null;
    if (this.listDetailForm.value.listId) {
      listId = this.listDetailForm.value.listId;
    }
    const name = this.listDetailForm.value.name;
    const description = this.listDetailForm.value.description;
    const items = this.currentList.items;

    /* Work out which capabilities are added or deleted */
    let itemsToAdd = [];
    let itemsToDelete = [];
    for (let item of items) {
      if (item.isDeleted) {
        itemsToDelete.push(item.id);
      } else if (item.isNew) {
        itemsToAdd.push(item.id);
      }
    }

    /* Update the list itself */
    this.listDataService.saveList(listId, name, description).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (response && response.data && response.data.list.id) {
          const savedListId = response.data.list.id;
          this.listDataService
            .deleteItems(savedListId, itemsToDelete)
            .subscribe({
              error: (err) => this.alertBox.handleError(err),
              next: () => {
                this.listDataService
                  .addItems(savedListId, itemsToAdd)
                  .subscribe({
                    error: (err) => this.alertBox.handleError(err),
                    next: () => {
                      this.listDataService.getAllData();
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
    let listId = '';
    let name = '';
    let description = '';

    if (this.currentList) {
      listId = this.currentList.id;
      name = this.currentList.name;
      description = this.currentList.description;
    }
    this.listDetailForm = new FormGroup({
      listId: new FormControl(listId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentList) this.listDetailForm.markAsDirty();
  }

  onCancel() {
    this.listDetailForm.reset();

    /* Remove any newly added or deleted items */
    if (this.currentList && this.currentList.items) {
      const revertItems = this.currentList.items.filter((item) => !item.isNew);
      revertItems.forEach((item) => (item.isDeleted = false));
      this.currentList.items = revertItems;
    }

    this.currentList = null;
    this.editMode = false;
  }

  deleteList(listId: string) {
    if (listId) {
      this.listDataService.deleteList(listId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.listDataService.getAllData();
          this.onCancel();
        },
      });
    }
  }

  onDelete() {
    this.showConfirmationDialog( this.listDetailForm.value.listId);
  }

  onDropItem(event) {
    const droppedItem = this.dragAndDropService.objectPickedUp;

    if (
      droppedItem.type === 'item' &&
      droppedItem.source !== this.itemListName
    ) {
      if (!this.currentList) {
        this.currentList = new WotlweduList();
        this.currentList.id = null;
      }
      if (!this.currentList.items) {
        this.currentList.items = [];
      }

      const itemExists = this.currentList.items.find(
        (c) => c.id === droppedItem.id
      );

      if (!itemExists) {
        const newItem = new WotlweduItem();
        newItem.id = droppedItem.id;
        newItem.name = droppedItem.name;
        newItem.description = '';
        newItem.isNew = true;
        newItem.isDeleted = false;
        this.currentList.items.push(newItem);
      } else {
        /* If the item exists in the list already, it might have been
        deleted so we need to reinstate it */
        itemExists.isDeleted = false;
      }
      this.dragAndDropService.reset();
    }
    /*
    Let the DragAndDropService know that it can tell all the subscribers
    that the current item has been dropped.
    */
    this.dragAndDropService.drop(this.itemListName);
  }

  handleDroppedItem( id: string ) {
    this.currentList.items.forEach((item) => {
      if (item.id === id) {
        item.isDeleted = true;
      }
    });
  }

}
