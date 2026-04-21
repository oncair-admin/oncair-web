import { Routes } from '@angular/router';
import { OperationsDashboardComponent } from './dashboard/dashboard.component';
import { DispatchCenterComponent } from './dispatch-center/dispatch-center.component';
import { DeliveryQueueComponent } from './delivery-queue/delivery-queue.component';
import { PickupRequestsComponent } from './pickup-requests/pickup-requests.component';
import { LiveTrackingComponent } from '../live-tracking/live-tracking.component';

export const OperationsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: OperationsDashboardComponent,
    data: {
      title: 'Operations Dashboard',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Operations', url: '/dashboard/operations' },
        { title: 'Dashboard' }
      ]
    }
  },
  {
    path: 'live-tracking',
    component: LiveTrackingComponent,
    data: {
      title: 'Live Map Tracking',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Operations', url: '/dashboard/operations' },
        { title: 'Live Tracking' }
      ]
    }
  },
  {
    path: 'dispatch',
    component: DispatchCenterComponent,
    data: {
      title: 'Dispatch Center',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Operations', url: '/dashboard/operations' },
        { title: 'Dispatch Center' }
      ]
    }
  },
  {
    path: 'delivery-queue',
    component: DeliveryQueueComponent,
    data: {
      title: 'Delivery Queue',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Operations', url: '/dashboard/operations' },
        { title: 'Delivery Queue' }
      ]
    }
  },
  {
    path: 'pickup-requests',
    component: PickupRequestsComponent,
    data: {
      title: 'Pickup Requests',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Operations', url: '/dashboard/operations' },
        { title: 'Pickup Requests' }
      ]
    }
  }
];
