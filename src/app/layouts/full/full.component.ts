import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { navItems } from './sidebar/sidebar-data';
import { NavService } from '../../services/nav.service';
import { AppNavItemComponent } from './sidebar/nav-item/nav-item.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HeaderComponent } from './header/header.component';
import { PermissionService } from '../../services/permission.service';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';


@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
  ],
  templateUrl: './full.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})

export class FullComponent implements OnInit {

  navItems = navItems;

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav | any;

  //get options from service
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;
  respPermissionList: string[] = [];
  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor(
    private breakpointObserver: BreakpointObserver, 
    private navService: NavService,
    private permissionService: PermissionService
  ) {
  
    this.htmlElement = document.querySelector('html')!;
    this.htmlElement.classList.add('light-theme');
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes

        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];

        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
      });
  }

  ngOnInit(): void {
    this.permissionService.loadPermissions();
    
    const companyId = localStorage.getItem('companyId');
    const isCorporate = !!companyId;

    this.navItems = navItems.filter(item => {
      // 1. Super Admin bypass 
      if (this.permissionService.hasPermission('SA')) {
        return true;
      }

      // 2. Filter by audience (legacy compatibility)
      const matchesAudience = isCorporate 
        ? (item.audience === 'corporate' || item.audience === 'both')
        : (item.audience === 'admin' || item.audience === 'both');
      
      if (!matchesAudience) return false;

      // 3. Filter by granular permissionCode
      if (item.permissionCode) {
        return this.permissionService.hasPermission(item.permissionCode);
      }

      return true;
    }).map(item => {
      // Deep clone to avoid polluting the original shared data
      const clonedItem = JSON.parse(JSON.stringify(item));
      
      // Inject companyId into routes if applicable
      if (isCorporate && companyId && clonedItem.route && clonedItem.route.includes(':id')) {
        clonedItem.route = clonedItem.route.replace(':id', companyId);
      }

      // Also process children
      if (clonedItem.children) {
        clonedItem.children = clonedItem.children.map((child: any) => {
          if (isCorporate && companyId && child.route && child.route.includes(':id')) {
            return { ...child, route: child.route.replace(':id', companyId) };
          }
          return child;
        });
      }

      return clonedItem;
    });
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe(); 
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
  }
}
