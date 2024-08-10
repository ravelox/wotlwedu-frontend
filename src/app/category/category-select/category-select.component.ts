import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { WotlweduCategory } from '../../datamodel/wotlwedu-category.model';
import { CategoryDataService } from '../../service/categorydata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';
import { WotlweduContextOption } from '../../datamodel/wotlwedu-context-option.model';
import { WotlweduContextController } from '../../controller/wotlwedu-context-controller.class';
import { DataSignalService } from '../../service/datasignal.service';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrl: './category-select.component.css',
})
export class CategorySelectComponent implements OnInit, OnDestroy {
  categories: WotlweduCategory[];
  categoriesSub: Subscription;
  preferenceData = new Subject<any>();
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  contextMenu: WotlweduContextController = new WotlweduContextController();

  private deleteContextOptions: WotlweduContextOption[] = [
    {
      name: 'Delete',
      enabled: true,
      cb: this.showDeleteConfirmationDialog.bind(this),
    },
  ];

  constructor(
    private categoryDataService: CategoryDataService,
    private dataSignalService: DataSignalService,
  ) {}

  ngOnInit() {
    this.pages.setService(this.categoryDataService);
    this.filter.setService(this.categoryDataService);
    this.categoriesSub = this.categoryDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (categories) => {
        this.categories = categories;
        this.pages.updatePages();
      },
    });
  }

  ngOnDestroy() {
    this.categoriesSub.unsubscribe();
  }

  
  onSelect(index: number) {
    this.categoryDataService.setData(this.categories[index]);
  }

  onContextMenu(event, index: number)
  {
    event.preventDefault();
    this.contextMenu.closeDown();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);

    this.contextMenu.getMousePosition(event);

    const objectData = { index: index };
    this.contextMenu.setObjectId( this.categories[index].id );
    this.contextMenu.setObjectData( objectData );

    let menuOptions = [];
  
    menuOptions = menuOptions.concat( this.deleteContextOptions);

    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
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
          },
        });
      }
    }

    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }
}
