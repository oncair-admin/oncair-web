import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions: string[] = [];

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
    if (this.permissions.includes('SA')) return true; // Super Admin has all permissions
    return this.permissions.includes(permissionCode);
  }

  hasAnyPermission(permissionCodes: string[]): boolean {
    if (this.permissions.includes('SA')) return true;
    return permissionCodes.some(code => this.permissions.includes(code));
  }

  clearPermissions() {
    this.permissions = [];
  }
}
