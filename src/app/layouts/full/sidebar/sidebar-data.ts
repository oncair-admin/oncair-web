import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  // {
  //   navCap: 'Home',
  // },
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'layout-dashboard',
  //   bgcolor: 'primary',
  //   route: '/dashboard',
  //  }
  // ,
  // {
  //   navCap: 'Ui Components',
  // },
  // {
  //   displayName: 'Badge',
  //   iconName: 'rosette',
  //   bgcolor: 'accent',
  //   route: '/ui-components/badge',
  // },
  // {
  //   displayName: 'Chips',
  //   iconName: 'poker-chip',
  //   bgcolor: 'warning',
  //   route: '/ui-components/chips',
  // },
  // {
  //   displayName: 'Lists',
  //   iconName: 'list',
  //   bgcolor: 'success',
  //   route: '/ui-components/lists',
  // },
  // {
  //   displayName: 'Menu',
  //   iconName: 'layout-navbar-expand',
  //   bgcolor: 'error',
  //   route: '/ui-components/menu',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'tooltip',
  //   bgcolor: 'primary',
  //   route: '/ui-components/tooltips',
  // },
  // {
  //   navCap: 'Auth',
  // },
  // {
  //   displayName: 'Login',
  //   iconName: 'lock',
  //   bgcolor: 'accent',
  //   route: '/authentication/login',
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'user-plus',
  //   bgcolor: 'warning',
  //   route: '/authentication/register',
  // }
  // ,
  
  {
    displayName: 'Dashboard',
    ItemId:0,
    iconName: 'dashboard',
    bgcolor: 'error',
    route: '/dashboard',
  },
  {
    displayName: 'Branches',
    ItemId:0,
    iconName: 'business',
    bgcolor: 'primary',
    route: '/dashboard/branches',
  },
  {
    displayName: 'Users',
    ItemId:2,
    iconName: 'user-plus',
    bgcolor: 'warning',
    route: '/extra/UsersData',
  },
  {
    displayName: 'اضافة قاعدة بيانات',
    ItemId:3,
    iconName: 'tooltip',
    bgcolor: 'primary',
    route: '/extra/AddDatabase',
  }
];
