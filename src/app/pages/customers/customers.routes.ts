import { Routes } from '@angular/router';
import { UsersDataComponent } from '../extra/users-data/users-data.component';
import { FeedbackRatingsComponent } from './feedback-ratings/feedback-ratings.component';
import { ChatListComponent } from '../chat/chat-list/chat-list.component';
import { ChatDetailComponent } from '../chat/chat-detail/chat-detail.component';

export const CustomersRoutes: Routes = [
  {
    path: '',
    redirectTo: 'directory',
    pathMatch: 'full'
  },
  {
    path: 'directory',
    component: UsersDataComponent,
    data: {
      title: 'Customer Directory',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Customers', url: '/dashboard/customers' },
        { title: 'Directory' }
      ]
    }
  },
  {
    path: 'tickets',
    component: ChatListComponent,
    data: {
      title: 'Support Tickets',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Customers', url: '/dashboard/customers' },
        { title: 'Support Tickets' }
      ]
    }
  },
  {
    path: 'tickets/:id',
    component: ChatDetailComponent,
    data: {
      title: 'Ticket Details',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Customers', url: '/dashboard/customers' },
        { title: 'Tickets', url: '/dashboard/customers/tickets' },
        { title: 'Details' }
      ]
    }
  },
  {
    path: 'feedback',
    component: FeedbackRatingsComponent,
    data: {
      title: 'Feedback & Ratings',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Customers', url: '/dashboard/customers' },
        { title: 'Feedback & Ratings' }
      ]
    }
  }
];

