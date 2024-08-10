import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WotlweduCap } from '../datamodel/wotlwedu-cap.model';
import { CapDataService } from '../service/capdata.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DragAndDropService } from '../service/dragdrop.service';
import { WotlweduPages } from '../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../controller/wotlwedu-filter-controller';
import { WotlweduDragAndDropController } from '../controller/wotlwedu-draganddrop-controller';

@Component({
  selector: 'app-cap-select',
  templateUrl: './cap-select.component.html',
  styleUrl: './cap-select.component.css',
})
export class CapSelectComponent implements OnInit, OnDestroy {
  listName: string = 'capselect';
  caps: WotlweduCap[];
  capsSub: Subscription;
  capData = new BehaviorSubject<any>(null);
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  dnd: WotlweduDragAndDropController;

  constructor(
    private capDataService: CapDataService,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController(this.dragAndDropService);
    this.pages.setService(this.capDataService);
    this.filter.setService(this.capDataService);
    this.capsSub = this.capDataService.dataChanged.subscribe((caps) => {
      this.caps = caps;
    });
  }

  ngOnDestroy() {
    this.capsSub.unsubscribe();
  }

  onSelectCap(index: number) {
    this.capDataService.setData(this.caps[index]);
  }

  onContextMenu(event, index: number) {
    event.preventDefault();
  }
}
