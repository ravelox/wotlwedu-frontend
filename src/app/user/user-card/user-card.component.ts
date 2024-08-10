import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from '../../service/userdata.service';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
} from 'rxjs';
import { Router } from '@angular/router';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent implements OnInit, OnDestroy {
  users: WotlweduUser[];
  usersSub: Subscription;
  userData = new BehaviorSubject<any>(null);
  listName: string = 'usercard';
  selectedIndex: number = -1;
  cancelSub: Subscription;
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  dnd: WotlweduDragAndDropController;

  constructor(
    private userDataService: UserDataService,
    router: Router,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController( this.dragAndDropService)
    this.pages.setService( this.userDataService );
    this.filter.setService( this.userDataService );
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
    if (this.usersSub) this.usersSub.unsubscribe();
    if (this.cancelSub) this.cancelSub.unsubscribe();
  }

  onSelect(index: number) {
    // If the filter reduces the number of elements in the array
    // to less than the current selected index, just clear out the
    // selected index
    if (this.selectedIndex > this.users.length) {
      this.selectedIndex = -1;
    }

    // Otherwise, clear out the selected flag
    if (this.selectedIndex >= 0) {
      this.users[this.selectedIndex].isSelected = false;
    }

    this.selectedIndex = index;
    this.users[index].isSelected = true;

    this.userDataService.setData(this.users[index]);

    /* Listen for a cancelation */
    this.cancelSub = this.userDataService.cancel.subscribe({
      next: (response) => {
        /* Only work on canceled items within the range of the users array */
        if (this.selectedIndex < this.users.length) {
          this.users[this.selectedIndex].isSelected = false;
        }
        if (this.cancelSub) this.cancelSub.unsubscribe();
      },
    });
  }

  onContextMenu(event, id: string){
    event.preventDefault();
  }

}
