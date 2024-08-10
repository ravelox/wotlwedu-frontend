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
import { DataSignalService } from '../../service/datasignal.service';
import { WotlweduContextOption } from '../../datamodel/wotlwedu-context-option.model';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';

@Component({
  selector: 'app-item-select',
  templateUrl: './item-select.component.html',
  styleUrl: './item-select.component.css',
})
export class ItemSelectComponent implements OnInit, OnDestroy {
  items: WotlweduItem[];
  itemsSub: Subscription;
  itemData = new BehaviorSubject<any>(null);
  listName: string = 'itemselect';
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  dnd: WotlweduDragAndDropController;


  constructor(
    private itemDataService: ItemDataService,
    private dragAndDropService: DragAndDropService,
    private dataSignalService: DataSignalService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController( this.dragAndDropService)
    this.pages.setService(this.itemDataService);
    this.filter.setService(this.itemDataService)
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

 

}
