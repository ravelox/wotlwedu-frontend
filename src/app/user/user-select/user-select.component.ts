import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from '../../service/userdata.service';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduContextOption } from '../../datamodel/wotlwedu-context-option.model';
import { WotlweduContextController } from '../../controller/wotlwedu-context-controller.class';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { DataSignalService } from '../../service/datasignal.service';

@Component({
  selector: 'app-user-select',
  templateUrl: './user-select.component.html',
  styleUrl: './user-select.component.css',
})
export class UserSelectComponent implements OnInit, OnDestroy {
  users: WotlweduUser[];
  usersSub: Subscription;
  userData = new BehaviorSubject<any>(null);
  listName: string = 'userselect';
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  dnd: WotlweduDragAndDropController;

  constructor(
    private userDataService: UserDataService,
    private dataSignalService: DataSignalService,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController(this.dragAndDropService);
    this.filter.setService(this.userDataService);
    this.pages.setService(this.userDataService);
    this.usersSub = this.userDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (users) => {
        this.users = users;
        this.pages.updatePages();
      },
    });
    this.userDataService.reset();
  }

  ngOnDestroy() {
    this.usersSub.unsubscribe();
  }

  onSelect(index: number) {
    this.userDataService.setData(this.users[index]);
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }
}
