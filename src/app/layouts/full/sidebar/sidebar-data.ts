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
    audience: 'both',
    iconName: 'dashboard',
    bgcolor: 'error',
    route: '/dashboard',
  },
  {
    displayName: 'Branches',
    ItemId:0,
    audience: 'admin',
    permissionCode: 'VB',
    iconName: 'business',
    bgcolor: 'primary',
    route: '/dashboard/branches',
  },
  {
    displayName: 'Chats',
    ItemId:0,
    audience: 'admin',
    permissionCode: 'RI',
    iconName: 'message-circle',
    bgcolor: 'success',
    route: '/dashboard/chat',
  },
  {
    displayName: 'Complaints',
    ItemId: 0,
    audience: 'admin',
    permissionCode: 'HC',
    iconName: 'alert-triangle',
    bgcolor: 'warning',
    route: '/dashboard/complaints',
  },
  {
    displayName: 'Corporates',
    ItemId: 0,
    audience: 'admin',
    permissionCode: 'AM',
    iconName: 'building',
    bgcolor: 'primary',
    route: '/dashboard/corporates',
  },

  // {
  //   displayName: 'اضافة قاعدة بيانات',
  //   ItemId:3,
  //   audience: 'admin',
  //   permissionCode: 'VB',
  //   iconName: 'tooltip',
  //   bgcolor: 'primary',
  //   route: '/extra/AddDatabase',
  // },
  {
    displayName: 'Customers',
    ItemId:0,
    audience: 'admin',
    permissionCode: 'MK',
    iconName: 'users',
    bgcolor: 'warning',
    children: [
      {
        displayName: 'Customer Directory',
        iconName: 'users',
        route: '/dashboard/customers/directory',
      },
      {
        displayName: 'Support Tickets',
        iconName: 'message-circle',
        route: '/dashboard/customers/tickets',
      },
      {
        displayName: 'Feedback & Ratings',
        iconName: 'star',
        route: '/dashboard/customers/feedback',
      },
    ],
  },
  {
    displayName: 'Security & Access',
    ItemId: 0,
    audience: 'admin',
    permissionCode: 'SA',
    iconName: 'lock',
    bgcolor: 'error',
    children: [
      {
        displayName: 'Role Management',
        iconName: 'shield-check',
        route: '/dashboard/security/roles',
      },
    ],
  },
  {
    displayName: 'Operations',
    ItemId:0,
    audience: 'admin',
    permissionCode: 'MC',
    iconName: 'dashboard',
    bgcolor: 'success',
    children: [
      {
        displayName: 'Dashboard',
        iconName: 'chart-bar',
        route: '/dashboard/operations/dashboard',
      },
      {
        displayName: 'Live Map Tracking',
        iconName: 'map-pin',
        route: '/dashboard/operations/live-tracking',
      },
      {
        displayName: 'Dispatch Center',
        iconName: 'send',
        route: '/dashboard/operations/dispatch',
      },
      {
        displayName: 'Delivery Queue',
        iconName: 'list-check',
        route: '/dashboard/operations/delivery-queue',
      },
      {
        displayName: 'Pickup Requests',
        iconName: 'package',
        route: '/dashboard/operations/pickup-requests',
      },
    ],
  },
  {
    displayName: 'Orders & Shipments',
    ItemId:0,
    audience: 'admin',
    permissionCode: 'CS',
    iconName: 'package',
    bgcolor: 'accent',
    children: [
      {
        displayName: 'All Orders',
        iconName: 'list',
        route: '/dashboard/orders/all',
      },
      {
        displayName: 'Create New Order',
        iconName: 'plus',
        route: '/dashboard/orders/new',
      },
      {
        displayName: 'Corporate Orders',
        iconName: 'building',
        route: '/dashboard/orders/corporate',
      },
      {
        displayName: 'Order Statuses',
        iconName: 'chart-bar',
        route: '/dashboard/orders/statuses',
      },
      {
        displayName: 'Returns & Failed',
        iconName: 'arrow-back',
        route: '/dashboard/orders/returns',
      },
    ],
  },
  {
    displayName: 'Shipments',
    ItemId:0,
    audience: 'both',
    permissionCode: 'US',
    iconName: 'truck',
    bgcolor: 'info',
    children: [
      {
        displayName: 'All Shipments',
        iconName: 'list',
        route: '/dashboard/shipments/all',
      },
      {
        displayName: 'Create New Shipment',
        iconName: 'plus',
        route: '/dashboard/shipments/new',
      },
      {
        displayName: 'On-Demand Shipment',
        iconName: 'bolt',
        route: '/dashboard/shipments/new-on-demand',
      },
      {
        displayName: 'Return Shipments',
        iconName: 'arrow-back-up',
        route: '/dashboard/shipments/returns',
      },
    ],
  }
];
