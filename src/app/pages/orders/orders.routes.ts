import { Routes } from '@angular/router';
import { AllOrdersComponent } from './all-orders/all-orders.component';
import { NewOrderComponent } from './new-order/new-order.component';
import { CorporateOrdersComponent } from './corporate-orders/corporate-orders.component';
import { OrderStatusesComponent } from './order-statuses/order-statuses.component';
import { ReturnsFailuresComponent } from './returns-failures/returns-failures.component';

export const OrdersRoutes: Routes = [
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  },
  {
    path: 'all',
    component: AllOrdersComponent,
    data: {
      title: 'All Orders',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Orders', url: '/dashboard/orders' },
        { title: 'All Orders' }
      ]
    }
  },
  {
    path: 'new',
    component: NewOrderComponent,
    data: {
      title: 'Create New Order',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Orders', url: '/dashboard/orders' },
        { title: 'New Order' }
      ]
    }
  },
  {
    path: 'corporate',
    component: CorporateOrdersComponent,
    data: {
      title: 'Corporate Orders',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Orders', url: '/dashboard/orders' },
        { title: 'Corporate Orders' }
      ]
    }
  },
  {
    path: 'statuses',
    component: OrderStatusesComponent,
    data: {
      title: 'Order Statuses',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Orders', url: '/dashboard/orders' },
        { title: 'Statuses' }
      ]
    }
  },
  {
    path: 'returns',
    component: ReturnsFailuresComponent,
    data: {
      title: 'Returns & Failed Deliveries',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Orders', url: '/dashboard/orders' },
        { title: 'Returns' }
      ]
    }
  }
];
