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
  todaty = new Date();
  Token: string = '';
  constructor(private router: Router) {}


  CheckToken() {
   
      if (sessionStorage.getItem('token') != undefined) {
        this.expiryDate = new Date(sessionStorage.getItem('expiryDate') as string);

        if (this.expiryDate < this.todaty) {
          // token and Refresh token is not active
          this.router.navigate(['/authentication/login']);
        }
      }
   
  }
}
