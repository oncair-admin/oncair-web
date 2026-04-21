import { Routes } from '@angular/router';

export const ChatRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./chat-list/chat-list.component').then((m) => m.ChatListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./chat-detail/chat-detail.component').then((m) => m.ChatDetailComponent),
  },
];
