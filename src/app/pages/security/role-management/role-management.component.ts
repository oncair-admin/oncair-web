import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { RoleService, Role, Permission } from '../../../services/role.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedRoleId: number | null = null;
  selectedRolePermissions: number[] = [];
  loading = false;
  saving = false;

  constructor(
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading = true;
    this.roleService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res.data;
        this.roleService.getAllPermissions().subscribe({
          next: (pRes) => {
            this.permissions = pRes.data;
            this.loading = false;
            if (this.roles.length > 0) {
              this.selectRole(this.roles[0].jobId);
            }
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  selectRole(jobId: number) {
    this.selectedRoleId = jobId;
    this.loading = true;
    this.roleService.getRolePermissionIds(jobId).subscribe({
      next: (res) => {
        this.selectedRolePermissions = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  isPermissionSelected(permId: number): boolean {
    return this.selectedRolePermissions.includes(permId);
  }

  togglePermission(permId: number) {
    const index = this.selectedRolePermissions.indexOf(permId);
    if (index > -1) {
      this.selectedRolePermissions.splice(index, 1);
    } else {
      this.selectedRolePermissions.push(permId);
    }
  }

  savePermissions() {
    if (!this.selectedRoleId) return;
    
    this.saving = true;
    this.roleService.updateRolePermissions(this.selectedRoleId, this.selectedRolePermissions).subscribe({
      next: (res) => {
        this.saving = false;
        this.snackBar.open('Permissions updated successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open('Failed to update permissions', 'Close', { duration: 3000 });
      }
    });
  }

  getRoleName(id: number | null): string {
    return this.roles.find(r => r.jobId === id)?.jobTitle || 'Select a Role';
  }
}
