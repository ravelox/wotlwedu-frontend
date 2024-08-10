import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WotlweduVote } from '../../datamodel/wotlwedu-vote.model';
import { VoteDataService } from '../../service/votedata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-dashboard-vote-card',
  templateUrl: './dashboard-vote-card.component.html',
  styleUrl: './dashboard-vote-card.component.css',
})
export class DashboardVoteCardComponent implements OnInit, OnDestroy {
  votes: WotlweduVote[];
  voteSub: Subscription;
  selectedIndex: number = -1;
  cancelSub: Subscription;
  alertBox: WotlweduAlert = new WotlweduAlert();


  constructor(private voteDataService: VoteDataService) {}

  ngOnInit() {
    this.voteDataService.reset();
    this.voteSub = this.voteDataService.refreshVotes.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.getMyVotes();
      },
    });
    this.getMyVotes();
  }

  ngOnDestroy() {
    if (this.voteSub) this.voteSub.unsubscribe();
    if (this.cancelSub) this.cancelSub.unsubscribe();
  }

  getMyVotes() {
    this.voteDataService.getMyVotes().subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (response && response.data) {
          this.votes = response.data.rows;
        }
      },
    });
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
}
