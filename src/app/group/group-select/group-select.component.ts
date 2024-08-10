import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GroupDataService } from '../../service/groupdata.service';
import { FormControl, FormGroup } from '@angular/forms';
import { WotlweduGroup } from '../../datamodel/wotlwedu-group.model';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';

@Component({
  selector: 'app-group-select',
  templateUrl: './group-select.component.html',
  styleUrl: './group-select.component.css',
})
export class GroupSelectComponent implements OnInit, OnDestroy {
  groups: WotlweduGroup[];
  groupsSub: Subscription;
  groupData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();

  constructor(private groupDataService: GroupDataService, router: Router) {}

  ngOnInit() {
    this.pages.setService(this.groupDataService);
    this.filter.setService(this.groupDataService);
    this.groupsSub = this.groupDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (groups) => {
        this.groups = groups;
        this.pages.updatePages();
      },
    });
  }

  ngOnDestroy() {
    this.groupsSub.unsubscribe();
  }

  onSelect(index: number) {
    this.groupDataService.setData(this.groups[index]);
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }
}
