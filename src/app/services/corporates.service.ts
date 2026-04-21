/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiController } from '../../../services/CarRental.serviceEnd';
import { ApiResponse } from '../models/shipment.models';
import {
  Company,
  CompanyContact,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CreateCompanyContactRequest,
  UpdateCompanyContactRequest,
} from '../models/corporate.models';

@Injectable({ providedIn: 'root' })
export class CorporatesService {
  constructor(private api: ApiController) {}

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

  updateCompany(body: UpdateCompanyRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(body, 'api/CompanyInformation/UpdateCompany')
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
