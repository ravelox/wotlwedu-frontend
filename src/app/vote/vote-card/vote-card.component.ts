import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { DragAndDropService } from '../../service/dragdrop.service';
import { WotlweduVote } from '../../datamodel/wotlwedu-vote.model';
import { VoteDataService } from '../../service/votedata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { WotlweduDragAndDropController } from '../../controller/wotlwedu-draganddrop-controller';

@Component({
  selector: 'app-vote-card',
  templateUrl: './vote-card.component.html',
  styleUrl: './vote-card.component.css',
})
export class VoteCardComponent implements OnInit, OnDestroy {
  votes: WotlweduVote[];
  voteSub: Subscription;
  voteData = new BehaviorSubject<any>(null);
  selectedIndex: number = -1;
  cancelSub: Subscription;
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  dnd: WotlweduDragAndDropController;

  constructor(
    private voteDataService: VoteDataService,
    private dragAndDropService: DragAndDropService
  ) {}

  ngOnInit() {
    this.dnd = new WotlweduDragAndDropController( this.dragAndDropService)
    this.pages.setService(this.voteDataService);
    this.filter.setService(this.voteDataService);
    this.voteSub = this.voteDataService.dataChanged.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (votes) => {
        this.votes = votes;
        this.pages.updatePages();
      },
    });
    this.voteDataService.reset();
  }

  ngOnDestroy() {
    if (this.voteSub) this.voteSub.unsubscribe();
    if (this.cancelSub) this.cancelSub.unsubscribe();
  }

  onSelect(index: number) {
    // If the filter reduces the number of elements in the array
    // to less than the current selected index, just clear out the
    // selected index
    if (this.selectedIndex > this.votes.length) {
      this.selectedIndex = -1;
    }

    // Otherwise, clear out the selected flag
    if (this.selectedIndex >= 0) {
      this.votes[this.selectedIndex].isSelected = false;
    }

    this.selectedIndex = index;
    this.votes[index].isSelected = true;

    this.voteDataService.setData(this.votes[index]);

    /* Listen for a cancelation */
    this.cancelSub = this.voteDataService.cancel.subscribe({
      next: (response) => {
        /* Only work on canceled items within the range of the votes array */
        if (this.selectedIndex < this.votes.length) {
          this.votes[this.selectedIndex].isSelected = false;
        }
        if (this.cancelSub) this.cancelSub.unsubscribe();
      },
    });
  }

  onContextMenu(event, id: string) {
    event.preventDefault();
  }
}
