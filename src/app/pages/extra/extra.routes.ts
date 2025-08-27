import { Routes } from '@angular/router';


// pages

import { UsersDataComponent } from './users-data/users-data.component';
import { AddDatabaseComponent } from './add-database/add-database.component';


export const ExtraRoutes: Routes = [
  {
    path: '',
    children: [
   { path: 'UsersData',component: UsersDataComponent},
   { path: 'AddDatabase',component: AddDatabaseComponent}, 
  ],
  },
  
];
