import { Component, OnInit } from '@angular/core';
import { DragAndDropService } from '../service/dragdrop.service';
import { ElectionDataService } from '../service/electiondata.service';

@Component({
  selector: 'app-election',
  templateUrl: './election.component.html',
  styleUrl: './election.component.css',
})
export class ElectionComponent implements OnInit {

  constructor( private electionDataService: ElectionDataService, private dragAndDropService: DragAndDropService){}

  ngOnInit() {
    this.electionDataService.setElectionDetails(null);
  }

  onDrop(event)
  {
    this.dragAndDropService.drop( event.target.listid );
  }

  onDragOver(event){ event.preventDefault(); }

}