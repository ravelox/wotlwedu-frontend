import { Component } from '@angular/core';
import { DragAndDropService } from '../service/dragdrop.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  constructor(private dragAndDropService: DragAndDropService) {}

  onDrop(event) {
    this.dragAndDropService.drop(event.target.listid);
  }

  onDragOver(event) {
    event.preventDefault();
  }
}
