import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Role {
  jobId: number;
  jobTitle: string;
  roleCode?: string;
  description?: string;
}

export interface Permission {
  permissionId: number;
  permissionName: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private get apiUrl() {
    const base = environment.apiUrl.endsWith('/') 
      ? environment.apiUrl.slice(0, -1) 
      : environment.apiUrl;
    return `${base}/api/Role`;
  }

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetAllRoles`);
  }

  getAllPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetAllPermissions`);
  }

  getRolePermissionIds(jobId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetRolePermissionIds?jobId=${jobId}`);
  }

  updateRolePermissions(jobId: number, permissionIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateRolePermissions`, { jobId, permissionIds });
  }
}
