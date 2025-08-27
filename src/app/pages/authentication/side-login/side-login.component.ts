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

  submit() {
    this.loading = true;
    this.userLogin.userName = this.Username;
    this.userLogin.password = this.Userpassword;
    if (this.userLogin.userName === '' || this.userLogin.password === '') {
      this.alert = 'alert alert-danger';
      this.msg = 'You must enter the user data';
      this.loading = false;
    }

    this.router.navigate(['/dashboard']);

    this.apiController.login(this.userLogin).subscribe({
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
            JSON.stringify(this.loginResp.respPermissionList)
          );
          this.router.navigate(['/dashboard']);
        } else {
          this.alert = 'alert alert-danger';
          this.msg = res.message;
        }
      },
      error: (err: any) => {
        console.error('Error fetching posts:', err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
