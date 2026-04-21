/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiController } from '../../../services/CarRental.serviceEnd';

export interface Complaint {
  complaintId: number;
  complaintDate: string;
  customerName: string;
  userId: number;
  message: string;
  status: string;
  isClosed: boolean;
  complaintType: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  constructor(private api: ApiController) {}

  getAllComplaints(): Observable<any> {
    return this.api.getApi('api/Conversation/GetAllComplaint').pipe(
      map((res: any) => {
        const items = (res?.data?.items as Complaint[]) ?? [];
        return { succeeded: true, data: items };
      })
    );
  }

  addComplaint(input: { message: string; complaintType?: string; customerName?: string }): Observable<any> {
    // Assuming backend expects query params for Message and Type (adjust if needed)
    const params = new URLSearchParams();
    params.set('Message', input.message || '');
    if (input.complaintType) params.set('ComplaintType', input.complaintType);
    if (input.customerName) params.set('CustomerName', input.customerName);
    const url = `api/Conversation/AddComplaint?${params.toString()}`;
    return this.api.PostApi(null, url);
  }
}


