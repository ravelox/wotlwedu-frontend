import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WotlweduVote } from '../../datamodel/wotlwedu-vote.model';
import { VoteDataService } from '../../service/votedata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-vote-detail',
  templateUrl: './vote-detail.component.html',
  styleUrl: './vote-detail.component.css',
})
export class VoteDetailComponent implements OnInit, OnDestroy {
  voteSub: Subscription;
  currentVote: WotlweduVote = null;
  editMode: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(
    private voteDataService: VoteDataService,
  ) {}

  ngOnInit() {
    this.voteSub = this.voteDataService.details.subscribe({
      error: (err) => {
        this.alertBox.handleError(err);
      },
      next: (vote: WotlweduVote) => {
        if (vote) {
          this.currentVote = vote;
          this.editMode = true;
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.voteSub) this.voteSub.unsubscribe();
  }

  onCancel() {
    this.currentVote = null;
    this.editMode = false;
    this.voteDataService.onCancel();
  }

  onDelete(voteId) {
    if (voteId) {
      this.voteDataService.deleteVote(voteId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.voteDataService.getAllData();
          this.onCancel();
        },
      });
    }
    this.onCancel();
  }
}
