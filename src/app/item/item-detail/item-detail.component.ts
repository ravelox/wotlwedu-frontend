import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WotlweduItem } from '../../datamodel/wotlwedu-item.model';
import { ItemDataService } from '../../service/itemdata.service';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduImage } from '../../datamodel/wotlwedu-image.model';
import { ImageDataService } from '../../service/imagedata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.css',
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  itemDetailForm: FormGroup;
  itemSub: Subscription;
  editMode: boolean = false;
  currentItem: WotlweduItem = null;
  currentImage: WotlweduImage = null;
  imageSelectorVisible: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private itemDataService: ItemDataService,
    private dragAndDropService: DragAndDropService,
    private imageDataService: ImageDataService
  ) {}

  ngOnInit() {
    this.itemSub = this.itemDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (item: WotlweduItem) => {
        if (item) {
          this.currentItem = item;
          this.editMode = true;
          this.initForm();
        }
      },
    });
    this.initForm();
  }

  ngOnDestroy() {
    this.itemSub.unsubscribe();
  }

  onSubmit() {
    const itemObject = new WotlweduItem();

    if (this.itemDetailForm.value.itemId) {
      itemObject.id = this.itemDetailForm.value.itemId;
    }
    itemObject.name = this.itemDetailForm.value.name;
    itemObject.description = this.itemDetailForm.value.description;
    itemObject.url = this.itemDetailForm.value.url;
    itemObject.location = this.itemDetailForm.value.location;
    itemObject.image = new WotlweduImage();
    itemObject.image.id = this.currentImage ? this.currentImage.id : null;

    this.itemDataService
      /* TODO: Add image ID and category ID */
      .saveItem(itemObject)
      .subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.itemDataService.getAllData();
          this.onCancel();
        },
      });
  }

  initForm() {
    let itemId = null;
    let name = '';
    let description = '';
    let url = '';
    let location = '';

    if (this.currentItem) {
      itemId = this.currentItem.id;
      name = this.currentItem.name;
      description = this.currentItem.description;
      url = this.currentItem.url;
      location = this.currentItem.location;

      this.currentImage = this.currentItem.image
        ? this.currentItem.image
        : null;
    }

    this.itemDetailForm = new FormGroup({
      itemId: new FormControl(itemId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
      url: new FormControl(url),
      location: new FormControl(location),
    });

    if (this.currentItem) this.itemDetailForm.markAsDirty();
  }

  onCancel() {
    this.itemDetailForm.reset();
    this.editMode = false;
    this.currentImage = null;
    this.currentItem = null;
  }

  deleteItem(itemId: string) {
    if (itemId) {
      this.itemDataService.deleteItem(itemId).subscribe((response) => {
        this.itemDataService.getAllData();
        this.onCancel();
      });
    }
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteItem(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }


  onDelete() {
    this.showConfirmationDialog( this.itemDetailForm.value.itemId );
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
    this.itemDetailForm.markAsDirty();

    this.dragAndDropService.reset();

    /*
    Let the DragAndDropService know that it can tell all the subscribers
    that the current item has been dropped.
    */
    this.dragAndDropService.drop('itemimage');

    /* Now get the image details so we can display it */
    this.imageDataService.getData(this.currentImage.id).subscribe({
      // We can ignore any errors
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
}
