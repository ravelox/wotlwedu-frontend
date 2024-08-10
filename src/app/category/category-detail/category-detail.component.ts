import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WotlweduCategory } from '../../datamodel/wotlwedu-category.model';
import { CategoryDataService } from '../../service/categorydata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';
import { WotlweduContextController } from '../../controller/wotlwedu-context-controller.class';
import { DataSignalService } from '../../service/datasignal.service';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.css',
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  categoryDetailForm: FormGroup;
  categorySub: Subscription;
  editMode: boolean = false;
  currentCategory: WotlweduCategory;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(private categoryDataService: CategoryDataService) {}

  ngOnInit() {
    this.categorySub = this.categoryDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (category: WotlweduCategory) => {
        if (category) {
          this.currentCategory = category;
          this.editMode = true;
          this.initForm();
        }
      },
    });
    this.initForm();
  }

  ngOnDestroy() {
    this.categorySub.unsubscribe();
  }

  onSubmit() {
    let categoryId = null;
    if (this.categoryDetailForm.value.categoryId) {
      categoryId = this.categoryDetailForm.value.categoryId;
    }
    const name = this.categoryDetailForm.value.name;
    const description = this.categoryDetailForm.value.description;

    this.categoryDataService
      .saveCategory(categoryId, name, description)
      .subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.categoryDataService.getAllData();
          this.onCancel();
        },
      });
  }

  initForm() {
    let categoryId = null;
    let name = '';
    let description = '';

    if (this.currentCategory) {
      categoryId = this.currentCategory.id;
      name = this.currentCategory.name;
      description = this.currentCategory.description;
    }

    this.categoryDetailForm = new FormGroup({
      categoryId: new FormControl(categoryId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentCategory) this.categoryDetailForm.markAsDirty();
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    if (object && object.id) {
      const categoryId = object.id;

      if (categoryId) {
        this.categoryDataService.deleteCategory(categoryId).subscribe({
          error: (err) => this.alertBox.handleError(err),
          next: (response) => {
            this.categoryDataService.getAllData();
            this.onCancel();
          },
        });
      }
    }

    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onCancel() {
    this.categoryDetailForm.reset();
    this.editMode = false;
  }

  onDelete() {
    this.showDeleteConfirmationDialog({
      id: this.categoryDetailForm.value.categoryId,
    });
  }
}
