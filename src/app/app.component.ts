import { Component, OnInit } from '@angular/core';
import { AuthDataService } from './service/authdata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private authDataService: AuthDataService){};

  ngOnInit() {
    this.authDataService.autoLogin();
  }
}
