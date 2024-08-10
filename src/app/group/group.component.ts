import { Component } from '@angular/core';
import { DragAndDropService } from '../service/dragdrop.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrl: './group.component.css',
})
export class GroupComponent {
  constructor(private dragAndDropService: DragAndDropService) {}

  onDrop(event) {
    this.dragAndDropService.drop(event.target.listid);
  }

  onDragOver(event) {
    event.preventDefault();
  }
}
