import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthDataService } from '../service/authdata.service';
import { Router } from '@angular/router';
import { TokenDataStorageService } from '../service/tokendata.service';
import { of } from 'rxjs';
import { GlobalVariable } from '../global';
import { WotlweduAlert } from '../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(
    private authService: AuthDataService,
    private router: Router,
    private tokenDataService: TokenDataStorageService
  ) {}

  onSubmit(authForm: NgForm) {
    this.authService
      .login(authForm.value.email, authForm.value.password)
      .subscribe({
        next: (response) => {
          this.authService.setLoggedIn(true);
          return this.router.navigate([GlobalVariable.DEFAULT_START_PAGE]);
        },
        error: (err) => {
          this.alertBox.handleError(err);
          return of(err);
        },
      });
  }

  ngOnInit() {
    this.authService.reset();
  }
}
