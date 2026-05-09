import { Routes } from '@angular/router';
import { RoleManagementComponent } from './role-management/role-management.component';

export const SecurityRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'roles',
        component: RoleManagementComponent,
        data: {
          title: 'Role Management',
          urls: [
            { title: 'Dashboard', url: '/dashboard' },
            { title: 'Security' },
            { title: 'Role Management' },
          ],
        },
      },
    ],
  },
];
