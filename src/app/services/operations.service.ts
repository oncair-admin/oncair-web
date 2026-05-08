import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map, catchError, throwError } from 'rxjs';
import { ApiController } from '../../../services/CarRental.serviceEnd';
import { ApiResponse } from '../models/shipment.models';
import {
  OperationsDashboardStats,
  BranchPerformance,
  Escalation,
  Courier,
  HubPackage,
  DeliveryQueueItem,
  PickupRequest,
  Hub
} from '../models/operations.models';

interface BranchLookup {
  id?: number;
  Id?: number;
  brancheNameEn?: string;
  BrancheNameEn?: string;
  code?: string;
  Code?: string;
  addresseEn?: string;
  AddresseEn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private api = inject(ApiController);
  private couriersSubject = new BehaviorSubject<Courier[]>([]);
  private deliveryQueueSubject = new BehaviorSubject<DeliveryQueueItem[]>([]);
  private pickupRequestsSubject = new BehaviorSubject<PickupRequest[]>([]);
  private hubPackagesSubject = new BehaviorSubject<HubPackage[]>([]);

  public couriers$ = this.couriersSubject.asObservable();
  public deliveryQueue$ = this.deliveryQueueSubject.asObservable();
  public pickupRequests$ = this.pickupRequestsSubject.asObservable();
  public hubPackages$ = this.hubPackagesSubject.asObservable();

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
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
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
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
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

  getHubPackages(hubId: number): Observable<HubPackage[]> {
    return this.handleApiResponse<HubPackage[]>(
      this.api.getApi(`api/Hub/GetHubPackages?HubId=${hubId}`)
    ).pipe(
      map(packages => {
        this.hubPackagesSubject.next(packages);
        return packages;
      })
    );
  }

  receivePackageAtHub(packageData: Partial<HubPackage>): Observable<{succeeded: boolean, message: string, data?: HubPackage}> {
    const shipmentIdentifier = packageData.trackingNumber || packageData.orderNumber || '';
    return this.api.PostApi({
      shipmentIdentifier,
      hubId: packageData.currentHubId,
      conditionId: this.getConditionId(packageData.packageCondition),
      conditionName: packageData.packageCondition,
      conditionRemarks: packageData.conditionRemarks
    }, 'api/Hub/ReceivePackageAtHub');
  }

  transferPackage(packageId: number, toHubId: number, note?: string): Observable<{succeeded: boolean, message: string}> {
    return this.api.PostApi({
      shipmentId: packageId,
      toHubId,
      note
    }, 'api/Hub/TransferPackage');
  }

  getHubs(): Observable<Hub[]> {
    return this.handleApiResponse<BranchLookup[]>(
      this.api.getApi('api/Lookup/GetBranch')
    ).pipe(
      map((branches) => branches.map(branch => ({
        id: branch.id || branch.Id || 0,
        name: branch.brancheNameEn || branch.BrancheNameEn || '',
        code: branch.code || branch.Code || String(branch.id),
        address: branch.addresseEn || branch.AddresseEn || '',
        city: branch.addresseEn || branch.AddresseEn || '',
        phone: '',
        managerName: '',
        capacity: 0,
        currentLoad: 0,
        isActive: true
      })))
    );
  }

  private getConditionId(condition?: HubPackage['packageCondition']): number | null {
    const conditionIds: Record<string, number> = {
      Excellent: 1,
      Good: 2,
      Fair: 3,
      Damaged: 4
    };

    return condition ? conditionIds[condition] ?? null : null;
  }
}
