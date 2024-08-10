import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WotlweduImage } from '../../datamodel/wotlwedu-image.model';
import { ImageDataService } from '../../service/imagedata.service';
import { WotlweduDragWindowController } from '../../controller/wotlwedu-dragwindow-controller.class';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.css',
})
export class ImageViewerComponent implements OnInit {
  @Input() dataId: string = null;
  @Input() extra: any = null;
  @Output() close = new EventEmitter<void>();
  image: WotlweduImage = null;
  dragWindow: WotlweduDragWindowController = new WotlweduDragWindowController();

  constructor(private imageDataService: ImageDataService) {}

  ngOnInit(): void {
    if (this.dataId) {
      this.imageDataService.getData(this.dataId, this.extra).subscribe({
        next: (response) => {
          if (response && response.data && response.data.image) {
            this.image = response.data.image;
            this.dragWindow.dragElement("imageviewer")
          }
        },
      });
    }
  }

  onClose() {
    this.close.emit();
  }

  onContextMenu(event: any, index: number) {
    event.preventDefault();
  }
}
