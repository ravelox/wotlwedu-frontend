import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ElectionDataService } from '../../service/electiondata.service';
import { WotlweduElection } from '../../datamodel/wotlwedu-election.model';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduPages } from '../../controller/wotlwedu-pagination-controller.class';
import { WotlweduFilterController } from '../../controller/wotlwedu-filter-controller';
import { WotlweduContextOption } from '../../datamodel/wotlwedu-context-option.model';
import { WotlweduContextController } from '../../controller/wotlwedu-context-controller.class';
import { DataSignalService } from '../../service/datasignal.service';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';

@Component({
  selector: 'app-election-select',
  templateUrl: './election-select.component.html',
  styleUrl: './election-select.component.css',
})
export class ElectionSelectComponent implements OnInit, OnDestroy {
  @Input() isCard: boolean = false;
  elections: WotlweduElection[];
  electionsSub: Subscription;
  dataRefreshSub: Subscription;
  electionData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  isLoading: boolean = false;
  contextMenu: WotlweduContextController = new WotlweduContextController();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  // Context Menu properties
  private stopContextOptions: WotlweduContextOption[] = [
    {
      name: 'Stop Election',
      enabled: true,
      cb: this.stopElection.bind(this),
    },
  ];

  private startContextOptions: WotlweduContextOption[] = [
    {
      name: 'Start Election',
      enabled: true,
      cb: this.startElection.bind(this),
    },
  ];
  private deleteContextOptions: WotlweduContextOption[] = [
    {
      name: 'Delete',
      enabled: true,
      cb: this.showDeleteConfirmationDialog.bind(this),
    },
  ];

  constructor(private electionDataService: ElectionDataService, private dataSignalService: DataSignalService) {}

  ngOnInit() {
    this.isLoading = false;
    this.pages.setService(this.electionDataService);
    this.filter.setService(this.electionDataService);
    this.electionsSub = this.electionDataService.dataChanged.subscribe({
      error: (err) => {
        this.isLoading = false;
        this.alertBox.handleError(err)
      },
      next: (elections) => {
        this.elections = elections;
        this.pages.updatePages();
      },
    });
  }

  ngOnDestroy() {
    this.electionsSub.unsubscribe();
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteElection(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onSelect(index: number) {
    this.electionDataService.setElectionDetails(this.elections[index]);
  }

  onContextMenu(event, index: number) {
    event.preventDefault();

    this.contextMenu.closeDown();

    const status = this.elections[index].status.name;
    if(! ( ["In Progress","Not Started","Stopped"].includes(status) )) return;

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);

    
    this.contextMenu.getMousePosition(event);

    const objectData = { index: index };
    this.contextMenu.setObjectId( this.elections[index].id );
    this.contextMenu.setObjectData( objectData );

    let menuOptions = [];

    if ( status === "Not Started" ) {
      menuOptions = menuOptions.concat(this.startContextOptions);
      menuOptions = menuOptions.concat( this.contextMenu.separatorOption);
    } else if (status  === "In Progress") {
      menuOptions = menuOptions.concat(this.stopContextOptions);
      menuOptions = menuOptions.concat( this.contextMenu.separatorOption);
    }

    
    menuOptions = menuOptions.concat( this.deleteContextOptions);

    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  deleteElection( object: any )
  {
  if( ! object || ! object.id ) return;
    this.electionDataService.deleteElection(object.id).subscribe({
      error: (err) => {
        this.isLoading = false;
        this.alertBox.handleError(err)
      },
      next: () => {
        this.electionDataService.getAllData();
        this.dataSignalService.refreshData();
      },
    });
  }
  
  startElection(object: any) {
    if (!object || !object.data) return;
    const index = object.data.index;
    if (
      !(
        this.elections &&
        this.elections[index].status.name === 'Not Started'
      )
    ) {
      this.alertBox.setErrorMessage('Election cannot be started');
      return;
    }

    this.isLoading = true;
    this.electionDataService
      .startElection(this.elections[index].id)
      .subscribe({
        error: (err) => {
          this.isLoading = false;
          this.alertBox.handleError(err)
        },
        next: (response) => {
          this.isLoading = false;
          this.electionDataService.getAllData();
          this.dataSignalService.refreshData();
        },
      });
  }

  stopElection(object: any) {
    if (!object || !object.data) return;
    const index = object.data.index;
    if (
      !(
        this.elections &&
        this.elections[index].status.name === 'In Progress'
      )
    ) {
      this.alertBox.setErrorMessage('Election cannot be stopped');
      return;
    }

    this.isLoading = true;
    this.electionDataService
      .stopElection(this.elections[index].id)
      .subscribe({
        error: (err) => {
          this.isLoading = false;
          this.alertBox.handleError(err)
        },
        next: (response) => {
          this.isLoading = false;
          this.electionDataService.getAllData();
          this.dataSignalService.refreshData();
        },
      });
  }
}
