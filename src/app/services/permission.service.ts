import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions: any[] = [];

  constructor() {
    this.loadPermissions();
  }

  loadPermissions() {
    const storedPermissions = sessionStorage.getItem('respPermissionList');
    if (storedPermissions) {
      try {
        this.permissions = JSON.parse(storedPermissions);
      } catch (e) {
        this.permissions = [];
      }
    }
  }

  hasPermission(permissionCode: string): boolean {
    if (!this.permissions || !Array.isArray(this.permissions)) return false;

    // 1. Check for Super Admin (SA) in any form
    const isSA = this.permissions.some(p => {
      if (typeof p === 'string') return p === 'SA';
      if (p && typeof p === 'object') return p.code === 'SA' || p.permissionName === 'Super Admin';
      return false;
    });
    
    if (isSA) return true;

    // 2. Check for specific permission
    return this.permissions.some(p => {
      if (typeof p === 'string') return p === permissionCode;
      if (p && typeof p === 'object') return p.code === permissionCode;
      return false;
    });
  }

  hasAnyPermission(permissionCodes: string[]): boolean {
    return permissionCodes.some(code => this.hasPermission(code));
  }

  clearPermissions() {
    this.permissions = [];
  }
}
