import { Routes } from '@angular/router';
import { AllShipmentsComponent } from './all-shipments/all-shipments.component';
import { ReturnShipmentsComponent } from './return-shipments/return-shipments.component';
import { ShipmentDetailsComponent } from './shipment-details/shipment-details.component';
import { NewShipmentComponent } from './new-shipment/new-shipment.component';
import { NewOnDemandShipmentComponent } from './new-on-demand-shipment/new-on-demand-shipment.component';

export const ShipmentsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  },
  {
    path: 'all',
    component: AllShipmentsComponent,
    data: {
      title: 'All Shipments',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Shipments', url: '/dashboard/shipments' },
        { title: 'All Shipments' }
      ]
    }
  },
  {
    path: 'returns',
    component: ReturnShipmentsComponent,
    data: {
      title: 'Return Shipments',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Shipments', url: '/dashboard/shipments' },
        { title: 'Returns' }
      ]
    }
  },
  {
    path: 'new',
    component: NewShipmentComponent,
    data: {
      title: 'New Shipment',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Shipments', url: '/dashboard/shipments' },
        { title: 'New Shipment' }
      ]
    }
  },
  {
    path: 'new-on-demand',
    component: NewOnDemandShipmentComponent,
    data: {
      title: 'New On-Demand Shipment',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Shipments', url: '/dashboard/shipments' },
        { title: 'On-Demand' }
      ]
    }
  },
  {
    path: ':id',
    component: ShipmentDetailsComponent,
    data: {
      title: 'Shipment Details',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Shipments', url: '/dashboard/shipments' },
        { title: 'Details' }
      ]
    }
  }
];



