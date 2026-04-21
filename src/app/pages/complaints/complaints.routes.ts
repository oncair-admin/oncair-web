import { Routes } from '@angular/router';

export const ComplaintsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/complaints-list.component').then((m) => m.ComplaintsListComponent),
  },
];

