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
  private apiUrl = `${environment.apiUrl}/api/Role`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Lang': 'en',
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
  }

  getAllRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetAllRoles`, { headers: this.getHeaders() });
  }

  getAllPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetAllPermissions`, { headers: this.getHeaders() });
  }

  getRolePermissionIds(jobId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetRolePermissionIds?jobId=${jobId}`, { headers: this.getHeaders() });
  }

  updateRolePermissions(jobId: number, permissionIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateRolePermissions`, { jobId, permissionIds }, { headers: this.getHeaders() });
  }
}
