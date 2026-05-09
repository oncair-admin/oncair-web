import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { BlankComponent } from '../layouts/blank/blank.component';
import { BranchesComponent } from './branches/branches.component';
import { LiveTrackingComponent } from './live-tracking/live-tracking.component';

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
  {
    path: 'chat',
    loadChildren: () =>
      import('./chat/chat.routes').then((m) => m.ChatRoutes),
    data: {
      title: 'Chat',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Chat' },
      ],
    },
  },
  {
    path: 'operations',
    loadChildren: () =>
      import('./operations/operations.routes').then((m) => m.OperationsRoutes),
    data: {
      title: 'Operations',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Operations' },
      ],
    },
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./orders/orders.routes').then((m) => m.OrdersRoutes),
    data: {
      title: 'Orders',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Orders' },
      ],
    },
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./customers/customers.routes').then((m) => m.CustomersRoutes),
    data: {
      title: 'Customers',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Customers' },
      ],
    },
  },
  {
    path: 'complaints',
    loadChildren: () =>
      import('./complaints/complaints.routes').then((m) => m.ComplaintsRoutes),
    data: {
      title: 'Complaints',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Complaints' },
      ],
    },
  },
  {
    path: 'corporates',
    loadChildren: () =>
      import('./corporates/corporates.routes').then((m) => m.CorporatesRoutes),
    data: {
      title: 'Corporates',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Corporates' },
      ],
    },
  },
  {
    path: 'security',
    loadChildren: () =>
      import('./security/security.routes').then((m) => m.SecurityRoutes),
    data: {
      title: 'Security',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Security' },
      ],
    },
  },
  {
    path: 'shipments',
    loadChildren: () =>
      import('./shipments/shipments.routes').then((m) => m.ShipmentsRoutes),
    data: {
      title: 'Shipments',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Shipments' },
      ],
    },
  },
];
