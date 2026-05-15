import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CheckTokenService {
  private readonly platformId = inject(PLATFORM_ID);
  companyName: string = '';
  expiryDate = new Date();
  refreshExpiryDate = new Date();
  Token: string = '';
  constructor(private router: Router) {}


  CheckToken() {
      if (sessionStorage.getItem('token') != undefined) {
        const refreshExpiry = sessionStorage.getItem('refreshExpiryDate');
        if (refreshExpiry) {
          const refreshDate = new Date(refreshExpiry);
          if (refreshDate < new Date()) {
            // Both tokens are expired, must log in
            this.router.navigate(['/authentication/login']);
          }
        } else {
          // Fallback to checking access token expiry if refresh info is missing
          const expiryStr = sessionStorage.getItem('expiryDate');
          if (expiryStr) {
            const expiryDate = new Date(expiryStr);
            if (expiryDate < new Date()) {
              this.router.navigate(['/authentication/login']);
            }
          }
        }
      }
  }
}
