import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map, catchError, throwError } from 'rxjs';
import { ApiController } from '../../../services/CarRental.serviceEnd';
import { ApiResponse } from '../models/shipment.models';
import {
  OperationsDashboardStats,
  BranchPerformance,
  Escalation,
  Courier,
  DeliveryAssignment,
  HubPackage,
  HubTransfer,
  DeliveryQueueItem,
  PickupRequest,
  Hub
} from '../models/operations.models';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private couriersSubject = new BehaviorSubject<Courier[]>([]);
  private deliveryQueueSubject = new BehaviorSubject<DeliveryQueueItem[]>([]);
  private pickupRequestsSubject = new BehaviorSubject<PickupRequest[]>([]);
  private hubPackagesSubject = new BehaviorSubject<HubPackage[]>([]);

  public couriers$ = this.couriersSubject.asObservable();
  public deliveryQueue$ = this.deliveryQueueSubject.asObservable();
  public pickupRequests$ = this.pickupRequestsSubject.asObservable();
  public hubPackages$ = this.hubPackagesSubject.asObservable();

  constructor(private api: ApiController) {
    // this.initializeDummyData();
  }

  private handleApiResponse<T>(observable: Observable<ApiResponse<T>>): Observable<T> {
    return observable.pipe(
      map((response: ApiResponse<T>) => {
        if (response.succeeded) {
          return response.data;
        } else {
          const errorMsg = response.errors?.map(e => e.errorsMessage).join(', ') || response.message || 'Unknown error';
          throw new Error(errorMsg);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getDashboardStats(): Observable<OperationsDashboardStats> {
    return this.handleApiResponse<OperationsDashboardStats>(
      this.api.getApi('api/Home/GetOperationsDashboardStats')
    );
  }

  getBranchPerformance(): Observable<BranchPerformance[]> {
    return this.handleApiResponse<BranchPerformance[]>(
      this.api.getApi('api/Home/GetBranchPerformance')
    );
  }

  getEscalations(): Observable<Escalation[]> {
    // TODO: Implement backend for escalations
    return of([]).pipe(delay(300));
  }

  getCouriers(): Observable<Courier[]> {
    return this.handleApiResponse<Courier[]>(
      this.api.getApi('api/Home/GetAllCouriers')
    ).pipe(
      map(couriers => {
        this.couriersSubject.next(couriers);
        return couriers;
      })
    );
  }

  updateCourierStatus(courierId: number, status: 'Available' | 'Busy' | 'On Break' | 'Offline'): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<any>(
      this.api.PostLiteApi(`api/Home/UpdateCourierStatus?CourierId=${courierId}&Status=${status}`)
    );
  }

  getDeliveryQueue(): Observable<DeliveryQueueItem[]> {
    return this.handleApiResponse<DeliveryQueueItem[]>(
      this.api.getApi('api/Home/GetDeliveryQueue')
    ).pipe(
      map(items => {
        this.deliveryQueueSubject.next(items);
        return items;
      })
    );
  }

  assignCourierToDelivery(deliveryId: number, courierId: number): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<any>(
      this.api.PostApi({ shipmentId: deliveryId, courierId: courierId }, 'api/Shipment/AssignCourier')
    );
  }

  getPickupRequests(): Observable<PickupRequest[]> {
    return this.handleApiResponse<PickupRequest[]>(
      this.api.getApi('api/Home/GetPickupRequests')
    ).pipe(
      map(items => {
        this.pickupRequestsSubject.next(items);
        return items;
      })
    );
  }

  updatePickupRequest(id: number, updates: Partial<PickupRequest>): Observable<{succeeded: boolean, message: string}> {
    if (updates.status === 'Approved' && updates.assignedCourierId) {
      return this.assignCourierToDelivery(id, updates.assignedCourierId);
    }
    return of({ succeeded: true, message: 'Updated' });
  }

  getHubPackages(): Observable<HubPackage[]> {
    // TODO: Implement real backend for hub packages
    return this.hubPackages$;
  }

  receivePackageAtHub(packageData: Partial<HubPackage>): Observable<{succeeded: boolean, message: string, data?: HubPackage}> {
    // TODO: Implement backend
    return of({ succeeded: true, message: 'Package received' }).pipe(delay(500));
  }

  transferPackage(packageId: number, toHubId: number, toHubName: string, transferredBy: string): Observable<{succeeded: boolean, message: string}> {
    // TODO: Implement backend
    return of({ succeeded: true, message: 'Package transfer initiated' }).pipe(delay(500));
  }

  getHubs(): Observable<Hub[]> {
    return this.handleApiResponse<Hub[]>(
      this.api.getApi('api/Lookup/GetBranch')
    );
  }
}
