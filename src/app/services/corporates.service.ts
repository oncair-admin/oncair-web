import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiController } from '../../../services/CarRental.serviceEnd';
import { ApiResponse } from '../models/shipment.models';
import { environment } from '../../environments/environment';
import {
  Company,
  CompanyContact,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CreateCompanyContactRequest,
  UpdateCompanyContactRequest,
  CorporateAuditEntry,
  CorporateLoginRequest,
  CorporateLoginResponse,
  CorporateOtpRequest,
  CorporatePermissionUpdateRequest,
  CorporateRegistrationRequest,
  CorporateRegistrationResponse,
  CorporateReviewActionRequest,
  CorporateRole,
} from '../models/corporate.models';

@Injectable({ providedIn: 'root' })
export class CorporatesService {
  private api = inject(ApiController);
  private http = inject(HttpClient);

  private handleApiResponse<T>(observable: Observable<ApiResponse<T>>): Observable<T> {
    return observable.pipe(
      map((response: ApiResponse<T>) => {
        if (response.succeeded) {
          return response.data;
        } else {
          const errorMsg =
            response.errors?.map((e: { errorsMessage: string }) => e.errorsMessage).join(', ') ||
            response.message ||
            'Unknown error';
          throw new Error(errorMsg);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getAllCompanies(): Observable<Company[]> {
    return this.handleApiResponse<Company[]>(
      this.api.getApi('api/CompanyInformation/GetAllCompanies')
    );
  }

  getCompanyById(id: number): Observable<Company> {
    return this.handleApiResponse<Company>(
      this.api.getApi(`api/CompanyInformation/GetCompanyById?id=${id}`)
    );
  }

  createCompany(body: CreateCompanyRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(body, 'api/CompanyInformation/CreateCompany')
    );
  }

  registerCorporate(body: CorporateRegistrationRequest): Observable<CorporateRegistrationResponse> {
    return this.handleApiResponse<CorporateRegistrationResponse>(
      this.http.post<ApiResponse<CorporateRegistrationResponse>>(
        `${environment.apiUrl}api/CompanyInformation/RegisterCorporate`,
        body
      )
    );
  }

  corporateLogin(body: CorporateLoginRequest): Observable<CorporateLoginResponse> {
    return this.handleApiResponse<CorporateLoginResponse>(
      this.http.post<ApiResponse<CorporateLoginResponse>>(
        `${environment.apiUrl}api/CompanyContactPerson/CompanyLogin`,
        body
      )
    );
  }

  sendCorporateOtp(body: CorporateOtpRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.http.post<ApiResponse<boolean>>(
        `${environment.apiUrl}api/CompanyInformation/SendCorporateOtp`,
        body
      )
    );
  }

  verifyCorporateOtp(body: CorporateOtpRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.http.post<ApiResponse<boolean>>(
        `${environment.apiUrl}api/CompanyInformation/VerifyCorporateOtp`,
        body
      )
    );
  }

  updateCompany(body: UpdateCompanyRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(body, 'api/CompanyInformation/UpdateCompany')
    );
  }

  getPendingCompanies(): Observable<Company[]> {
    return this.handleApiResponse<Company[]>(
      this.api.getApi('api/CompanyInformation/GetPendingCompanies')
    );
  }

  approveCompany(companyId: number): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostLiteApi(`api/CompanyInformation/ApproveCompany?companyId=${companyId}`)
    );
  }

  rejectCompany(companyId: number, reason: string): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostLiteApi(`api/CompanyInformation/RejectCompany?companyId=${companyId}&reason=${encodeURIComponent(reason)}`)
    );
  }

  requestCorporateInfo(body: CorporateReviewActionRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(body, 'api/CompanyInformation/RequestCorporateInfo')
    );
  }

  getCorporateAuditTrail(companyId: number): Observable<CorporateAuditEntry[]> {
    return this.handleApiResponse<CorporateAuditEntry[]>(
      this.api.getApi(`api/CompanyInformation/GetCorporateAuditTrail?companyId=${companyId}`)
    );
  }

  getCorporateRoles(companyId: number): Observable<CorporateRole[]> {
    return this.handleApiResponse<CorporateRole[]>(
      this.api.getApi(`api/CompanyInformation/GetCorporateRoles?companyId=${companyId}`)
    );
  }

  updateCorporatePermissions(body: CorporatePermissionUpdateRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(body, 'api/CompanyInformation/UpdateCorporatePermissions')
    );
  }

  getAllCompanyContacts(companyId: number): Observable<CompanyContact[]> {
    return this.handleApiResponse<CompanyContact[]>(
      this.api.getApi(`api/CompanyContactPerson/GetAllCompanyContacts?CompanyId=${companyId}`)
    );
  }

  getCompanyContactById(id: number): Observable<CompanyContact> {
    return this.handleApiResponse<CompanyContact>(
      this.api.getApi(`api/CompanyContactPerson/GetCompanyContactById?Id=${id}`)
    );
  }

  createCompanyContact(body: CreateCompanyContactRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(body, 'api/CompanyContactPerson/CreateCompanyContact')
    );
  }

  updateCompanyContact(body: UpdateCompanyContactRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(body, 'api/CompanyContactPerson/UpdateCompanyContact')
    );
  }
}
