/* eslint-disable @angular-eslint/prefer-inject */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MaterialModule } from '../../../material.module';
import { CorporatesService } from '../../../services/corporates.service';

@Component({
  selector: 'app-corporate-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule, MatButtonModule],
  templateUrl: './corporate-login.component.html',
})
export class CorporateLoginComponent {
  email = '';
  password = '';
  loading = false;
  alert = 'or-border m-t-30';
  msg = 'Corporate account information';

  constructor(private corporatesService: CorporatesService, private router: Router) {}

  submit(): void {
    this.alert = 'or-border m-t-30';
    this.msg = 'Corporate account information';

    if (!this.isValidEmail(this.email) || !this.password) {
      this.alert = 'alert alert-danger';
      this.msg = 'Enter a valid corporate email and password';
      return;
    }

    this.loading = true;
    this.corporatesService
      .corporateLogin({
        userName: this.email.trim(),
        password: this.password,
        firebaseToken: '1234567890',
      })
      .subscribe({
        next: (loginResp) => {
          sessionStorage.setItem('token', loginResp.token);
          sessionStorage.setItem('refreshTokenDate', loginResp.refreshTokenDate);
          sessionStorage.setItem('expiryDate', String(loginResp.expiryDate));
          sessionStorage.setItem('refreshExpiryDate', String(loginResp.refreshExpiryDate));
          sessionStorage.setItem('respPermissionList', JSON.stringify([]));
          localStorage.setItem('userId', loginResp.id.toString());
          localStorage.setItem('companyId', loginResp.companyId.toString());
          this.router.navigate(['/dashboard/corporates', loginResp.companyId, 'users']);
        },
        error: (error: unknown) => {
          this.alert = 'alert alert-danger';
          this.msg = (error as Error).message || 'Corporate sign in failed';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
}
