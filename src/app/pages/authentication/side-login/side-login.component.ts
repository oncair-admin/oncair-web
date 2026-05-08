/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { ApiController } from 'services/CarRental.serviceEnd';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  providers: [ApiController],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  private userLogin: any;
  loginResp = {} as any;
  Username: string = '';
  Userpassword: string = '';
  loading: boolean = false;
  //----------------------------------------------------------------
  alert: string = 'or-border m-t-30';
  msg: string = 'Account information';

  constructor(private apiController: ApiController, private router: Router) {
    this.userLogin = { userName: '', password: '' };
  }

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  async submit() {
    this.loading = true;
    this.userLogin.userName = this.Username;
    this.userLogin.password = this.Userpassword;
    if (this.userLogin.userName === '' || this.userLogin.password === '') {
      this.alert = 'alert alert-danger';
      this.msg = 'You must enter the user data';
      this.loading = false;
    }

    const payload = { ...this.userLogin };

    this.apiController.login(payload).subscribe({
      next: (res: any) => {
        if (res.succeeded) {
          this.loginResp = res.data; // Set the response data
          sessionStorage.setItem('token', this.loginResp.token as string);
          sessionStorage.setItem(
            'refreshTokenDate',
            this.loginResp.refreshTokenDate as string
          );
          sessionStorage.setItem(
            'expiryDate',
            this.loginResp.expiryDate.toLocaleString()
          );
          sessionStorage.setItem(
            'refreshExpiryDate',
            this.loginResp.refreshExpiryDate.toLocaleString()
          );
          sessionStorage.setItem(
            'respPermissionList',
            JSON.stringify(this.loginResp.permissions || [])
          );
          // Store userId for SignalR notifications
          if (this.loginResp.id) {
            localStorage.setItem('userId', this.loginResp.id.toString());
          }
          this.router.navigate(['/dashboard']);
        } else {
          this.alert = 'alert alert-danger';
          this.msg = res.message;
        }
      },
      error: (err: any) => {
        console.error('Error fetching posts:', err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
