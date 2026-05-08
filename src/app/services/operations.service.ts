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

interface OperationsShipmentDto {
  shipmentId?: number;
  ShipmentId?: number;
  shipmentBarcode?: string;
  ShipmentBarcode?: string;
  customerId?: number;
  CustomerId?: number;
  codAmount?: number;
  CodAmount?: number;
  totalEgp?: number;
  TotalEgp?: number;
  customerName?: string;
  CustomerName?: string;
  statusId?: number;
  StatusId?: number;
  statusName?: string;
  StatusName?: string;
  shipmentsFromAr?: string;
  ShipmentsFromAr?: string;
  shipmentsFromEn?: string;
  ShipmentsFromEn?: string;
  shipmentsToAr?: string;
  ShipmentsToAr?: string;
  shipmentsToEn?: string;
  ShipmentsToEn?: string;
  quantity?: number;
  Quantity?: number;
  createdat?: string | Date;
  Createdat?: string | Date;
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
    return this.handleApiResponse<OperationsShipmentDto[]>(
      this.api.getApi('api/Home/GetDeliveryQueue')
    ).pipe(
      map(shipments => {
        const items = shipments.map(shipment => this.mapDeliveryQueueItem(shipment));
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
    return this.handleApiResponse<OperationsShipmentDto[]>(
      this.api.getApi('api/Home/GetPickupRequests')
    ).pipe(
      map(shipments => {
        const items = shipments.map(shipment => this.mapPickupRequest(shipment));
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

  private mapPickupRequest(shipment: OperationsShipmentDto): PickupRequest {
    const id = this.getShipmentId(shipment);
    const createdDate = this.toDate(shipment.createdat ?? shipment.Createdat);
    const pickupAddress = shipment.shipmentsFromEn || shipment.ShipmentsFromEn || shipment.shipmentsFromAr || shipment.ShipmentsFromAr || '';

    return {
      id,
      requestNumber: this.getShipmentBarcode(shipment) || String(id),
      customerName: this.getCustomerName(shipment),
      customerPhone: '',
      pickupAddress,
      city: this.getCityFromAddress(pickupAddress),
      packageType: 'Shipment',
      estimatedPackages: shipment.quantity ?? shipment.Quantity,
      preferredDate: createdDate,
      preferredTimeSlot: 'Anytime',
      requestDate: createdDate,
      status: this.mapPickupStatus(shipment.statusId ?? shipment.StatusId, shipment.statusName || shipment.StatusName),
      priority: 'Normal'
    };
  }

  private mapDeliveryQueueItem(shipment: OperationsShipmentDto): DeliveryQueueItem {
    const id = this.getShipmentId(shipment);
    const deliveryAddress = shipment.shipmentsToEn || shipment.ShipmentsToEn || shipment.shipmentsToAr || shipment.ShipmentsToAr || '';

    return {
      id,
      orderNumber: this.getShipmentBarcode(shipment) || String(id),
      customerName: this.getCustomerName(shipment),
      customerPhone: '',
      deliveryAddress,
      city: this.getCityFromAddress(deliveryAddress),
      packageDescription: 'Shipment',
      scheduledDate: this.toDate(shipment.createdat ?? shipment.Createdat),
      status: this.mapDeliveryStatus(shipment.statusId ?? shipment.StatusId, shipment.statusName || shipment.StatusName),
      priority: 'Normal',
      deliveryType: '',
      codAmount: shipment.codAmount ?? shipment.CodAmount ?? shipment.totalEgp ?? shipment.TotalEgp,
      attempts: 0
    };
  }

  private getShipmentId(shipment: OperationsShipmentDto): number {
    return shipment.shipmentId ?? shipment.ShipmentId ?? 0;
  }

  private getShipmentBarcode(shipment: OperationsShipmentDto): string {
    return shipment.shipmentBarcode || shipment.ShipmentBarcode || '';
  }

  private getCustomerName(shipment: OperationsShipmentDto): string {
    const customerName = shipment.customerName || shipment.CustomerName;
    const customerId = shipment.customerId ?? shipment.CustomerId;

    return customerName || (customerId ? `Customer #${customerId}` : '');
  }

  private getCityFromAddress(address: string): string {
    const parts = address.split(',').map(part => part.trim()).filter(Boolean);
    return parts[parts.length - 1] || '';
  }

  private toDate(value?: string | Date): Date {
    return value ? new Date(value) : new Date();
  }

  private mapPickupStatus(statusId?: number, statusName?: string): PickupRequest['status'] {
    const normalizedStatus = this.normalizeStatus(statusName);

    if (statusId === 1 || normalizedStatus === 'order received' || normalizedStatus === 'pending') {
      return 'Pending';
    }

    if (normalizedStatus.includes('deliver')) {
      return 'Completed';
    }

    if (normalizedStatus.includes('cancel')) {
      return 'Cancelled';
    }

    if (normalizedStatus.includes('reject') || normalizedStatus.includes('fail')) {
      return 'Rejected';
    }

    if (normalizedStatus.includes('assign') || normalizedStatus.includes('pick')) {
      return 'Approved';
    }

    return 'Scheduled';
  }

  private mapDeliveryStatus(statusId?: number, statusName?: string): DeliveryQueueItem['status'] {
    const normalizedStatus = this.normalizeStatus(statusName);

    if (statusId === 2 || normalizedStatus.includes('assign')) {
      return 'Assigned';
    }

    if (statusId === 3 || statusId === 4 || normalizedStatus.includes('picked up') || normalizedStatus.includes('at hub')) {
      return 'In Progress';
    }

    if (normalizedStatus.includes('deliver') && !normalizedStatus.includes('fail')) {
      return 'Completed';
    }

    if (normalizedStatus.includes('fail')) {
      return 'Failed';
    }

    return 'Scheduled';
  }

  private normalizeStatus(statusName?: string): string {
    return (statusName || '').trim().toLowerCase();
  }
}
