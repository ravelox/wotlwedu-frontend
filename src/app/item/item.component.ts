import { Component, OnInit } from '@angular/core';
import { ItemDataService } from '../service/itemdata.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrl: './item.component.css',
})
export class ItemComponent implements OnInit{
  constructor(private itemDataService: ItemDataService) {
  }

  ngOnInit(): void {
    this.itemDataService.setData(null);
  }

}