import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { AuthDataService } from '../service/authdata.service';
import { GlobalVariable } from '../global';
import { HealthcheckService } from '../service/healthcheck.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  loggedInUserName: string = null;
  isAdmin: boolean = false;
  private loginStatusSub: Subscription;
  private serviceStatusSub: Subscription;
  appVersion: string = GlobalVariable.APP_VERSION;
  serverVersion: string;

  constructor(
    private authDataService: AuthDataService,
    private healthcheckService: HealthcheckService
  ) {}

  ngOnInit() {
    this.loginStatusSub = this.authDataService.isLoggedIn.subscribe({
      next: (loginDetails) => {
        if (loginDetails) {
          this.isLoggedIn = loginDetails.loginState;
          this.loggedInUserName = loginDetails.userName;
          this.isAdmin = loginDetails.isAdmin;
        } else {
          this.isLoggedIn = false;
          this.loggedInUserName = null;
          this.isAdmin = false;
        }
      },
    });

    this.serviceStatusSub = interval(300000).subscribe({
      error: () => {},
      next: () => {
        this.healthcheckService.ping().subscribe({
          error: (err) => {
            console.log('Healthcheck error');
            console.log(err);
            this.serverVersion = 'No Server';
          },
          next: (response) => {
            if (response && response.data && response.data.version) {
              this.serverVersion = response.data.version;
            }
          },
        });
      },
    });
  }

  ngOnDestroy() {
    if (this.loginStatusSub) this.loginStatusSub.unsubscribe();
    if (this.serviceStatusSub) this.serviceStatusSub.unsubscribe();
  }
}
