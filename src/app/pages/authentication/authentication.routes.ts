import { Routes } from '@angular/router';

import { AppSideLoginComponent } from './side-login/side-login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { CorporateLoginComponent } from './corporate-login/corporate-login.component';
import { CorporateRegisterComponent } from './corporate-register/corporate-register.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: AppSideLoginComponent,
      },
      {
        path: 'register',
        component: AppSideRegisterComponent,
      },
      {
        path: 'corporate-register',
        component: CorporateRegisterComponent,
      },
      {
        path: 'corporate-login',
        component: CorporateLoginComponent,
      },
    ],
  },
];
