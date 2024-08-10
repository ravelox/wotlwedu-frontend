import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WotlweduImage } from '../../datamodel/wotlwedu-image.model';
import { ImageDataService } from '../../service/imagedata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrl: './image-detail.component.css',
})
export class ImageDetailComponent implements OnInit, OnDestroy {
  imageDetailForm: FormGroup;
  imageSub: Subscription;
  editMode: boolean = false;
  currentImage: WotlweduImage = null;
  alertBox: WotlweduAlert = new WotlweduAlert();
  currentUploadFile: File = null;
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(private imageDataService: ImageDataService) {}

  ngOnInit() {
    this.imageSub = this.imageDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (image: WotlweduImage) => {
        if (image) {
          this.currentImage = image;
          this.currentUploadFile = null;
          this.editMode = true;
          this.initForm();
        } else {
          this.currentImage = null;
          this.currentUploadFile = null;
          this.editMode = false;
        }
        this.initForm();
      },
    });
    this.initForm();
  }

  ngOnDestroy() {
    this.imageSub.unsubscribe();
  }

  onSubmit() {
    let imageId = null;
    if (this.imageDetailForm.value.imageId) {
      imageId = this.imageDetailForm.value.imageId;
    }
    const name = this.imageDetailForm.value.name;
    const description = this.imageDetailForm.value.description;

    this.imageDataService.saveImage(imageId, name, description).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (this.currentUploadFile) {
          if (response.data.image.id) {
            this.imageDataService
              .saveImageFile(response.data.image.id, this.currentUploadFile)
              .subscribe({
                error: (err) => this.alertBox.handleError(err),
              });
          }
        }
        this.imageDataService.getAllData();
        this.onCancel();
      },
    });
  }

  initForm() {
    let imageId = null;
    let name = '';
    let description = '';
    let filename = null;

    if (this.currentImage) {
      imageId = this.currentImage.id;
      name = this.currentImage.name;
      description = this.currentImage.description;
    }

    this.imageDetailForm = new FormGroup({
      imageId: new FormControl(imageId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
      filename: new FormControl(filename),
    });

    if (this.currentImage) this.imageDetailForm.markAsDirty();
  }

  onCancel() {
    this.imageDetailForm.reset();
    this.editMode = false;
    this.currentUploadFile = null;
    this.currentImage = null;
  }

  deleteImage(imageId: string) {
    this.imageDataService.deleteImageFile(imageId).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.imageDataService.deleteImage(imageId).subscribe({
          error: (err) => this.alertBox.handleError(err),
          next: () => {
            this.imageDataService.getAllData();
            this.onCancel();
          },
        });
      },
    });
    this.onCancel();
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteImage(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showDeleteConfirmationDialog(this.imageDetailForm.value.imageId);
    this.onCancel();
  }

  onUploadFileChange(event) {
    if (event.target.files[0]) {
      this.currentUploadFile = event.target.files[0];

      /* Preview the chosen file */
      const fileReader = new FileReader();
      fileReader.addEventListener('loadend', (loadevent) => {
        if (!this.currentImage) {
          this.currentImage = new WotlweduImage();
        }
        this.currentImage.url = loadevent.target.result.toString();
      });
      fileReader.readAsDataURL(this.currentUploadFile);
    }

    this.imageDetailForm.markAsDirty();
    this.imageDetailForm.markAsTouched();
  }
}
