import { HttpEvent } from "@angular/common/http";

export interface WotlweduDragAndDrop {
  onDragStart(event: HttpEvent<any>): void;
  onDrop(event: HttpEvent<any>): void;
  onDragOver(event: HttpEvent<any>): void;
}
