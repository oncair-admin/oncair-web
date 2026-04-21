import { Routes } from '@angular/router';

export const CorporatesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/corporates-list.component').then((m) => m.CorporatesListComponent),
  },
  {
    path: ':id/users',
    loadComponent: () =>
      import('./users/corporate-users.component').then((m) => m.CorporateUsersComponent),
  },
];

