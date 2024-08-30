import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { WotlweduRegistration } from '../datamodel/wotlwedu-registration.model';
import { RegisterService } from '../service/register.service';
import { ActivatedRoute } from '@angular/router';
import { WotlweduAlert } from '../controller/wotlwedu-alert-controller.class';
import * as bcrypt from 'bcryptjs';
import { CompareValidator } from '../validator/compare.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  registrationInProgress: boolean = true;
  registrationComplete: boolean = false;
  userConfirmed: boolean = false;
  isProcessing: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(
    private route: ActivatedRoute,
    private registerService: RegisterService
  ) {}

  ngOnInit(): void {
    const urlPath = this.route.snapshot.url[0].path;

    if (urlPath === 'register') {
      this.isProcessing = false;
      this.userConfirmed = false;
      this.registrationComplete = false;
      this.registrationInProgress = true;
    } else if (urlPath === 'confirm') {
      this.isProcessing = true;
      this.registrationInProgress = false;
      this.registrationComplete = false;
      this.userConfirmed = false;

      this.confirmUser(this.route.snapshot.params.registertoken);
    }

    this.initForm();
  }

  onSubmit(registerForm: NgForm) {
    const registration = new WotlweduRegistration();

    registration.email = registerForm.value.email;
    registration.firstName = registerForm.value.firstName;
    registration.lastName = registerForm.value.lastName;
    registration.alias = registerForm.value.alias;

    const salt = bcrypt.genSaltSync(12);
    const encryptedPwd = bcrypt.hashSync(
      this.registrationForm.value.newpass,
      salt
    );
    registration.auth = encryptedPwd;

    this.registerService.register(registration).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.registrationComplete = true;
        this.registrationInProgress = false;
      },
    });
  }

  initForm() {
    this.registrationForm = new FormGroup({
      email: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      alias: new FormControl('', Validators.required),
      newpass: new FormControl('', Validators.required),
      verifypass: new FormControl('', Validators.required),
    });

    this.registrationForm.addValidators(
      new CompareValidator().validate(
        this.registrationForm.get('newpass'),
        this.registrationForm.get('verifypass')
      )
    );
  }

  confirmUser(token: string) {
    this.registerService.confirm(token).subscribe({
      error: (err) => {
        this.isProcessing = false;
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.isProcessing = false;
        this.userConfirmed = true;
      },
    });
  }
}
