import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { BlankComponent } from '../layouts/blank/blank.component';
import { BranchesComponent } from './branches/branches.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: BlankComponent,
    data: {
      title: 'Starter',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Starter' },
      ],
    },
  },
  {
    path: 'branches',
    component: BranchesComponent,
    data: {
      title: 'Branches',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Branches' },
      ],
    },
  },
];
