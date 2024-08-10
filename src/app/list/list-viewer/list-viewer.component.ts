import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ListDataService } from '../../service/listdata.service';
import { WotlweduList } from '../../datamodel/wotlwedu-list.model';
import { WotlweduDragWindowController } from '../../controller/wotlwedu-dragwindow-controller.class';

@Component({
  selector: 'app-list-viewer',
  templateUrl: './list-viewer.component.html',
  styleUrl: './list-viewer.component.css',
})
export class ListViewerComponent implements OnInit {
  @Input() dataId: string = null;
  @Input() extra: any = null;
  @Output() close = new EventEmitter<void>();
  list: WotlweduList = null;
  dragWindow: WotlweduDragWindowController = new WotlweduDragWindowController();

  constructor(private listDataService: ListDataService) {}

  ngOnInit(): void {
    if (this.dataId) {
      this.listDataService.getData(this.dataId, this.extra).subscribe({
        next: (response) => {
          if (response && response.data && response.data.list) {
            this.list = response.data.list;
            this.dragWindow.dragElement("listviewer");
          }
        },
      });
    }
  }

  onClose() {
    this.close.emit();
  }

  onContextMenu(event, index) {
    event.preventDefault();
  }
}
