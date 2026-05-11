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
  PagedResult,
  PickupRequest,
  Hub,
  HubMonitoringStats,
  HubTransfer,
  HubException,
  RespOptimizeRoute,
  CustomerServiceMetrics
} from '../models/operations.models';

interface BranchLookup {
  id?: number;
  Id?: number;
  branchId?: number;
  BranchId?: number;
  brancheNameEn?: string;
  BrancheNameEn?: string;
  code?: string;
  Code?: string;
  addresseEn?: string;
  AddresseEn?: string;
  lat?: number;
  Lat?: number;
  lon?: number;
  Lon?: number;
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
  weight?: number;
  Weight?: number;
  instructions?: string;
  Instructions?: string;
  customerPhone?: string;
  CustomerPhone?: string;
  branchName?: string;
  BranchName?: string;
  branchId?: number;
  BranchId?: number;
  courierId?: number;
  CourierId?: number;
  courierName?: string;
  CourierName?: string;
  consignee?: string;
  Consignee?: string;
  consigneePhone?: string;
  ConsigneePhone?: string;
  phoneNumber?: string;
  PhoneNumber?: string;
  fromLatitude?: number;
  FromLatitude?: number;
  fromLongitude?: number;
  FromLongitude?: number;
  toLatitude?: number;
  ToLatitude?: number;
  toLongitude?: number;
  ToLongitude?: number;
  etaAt?: string | Date;
  EtaAt?: string | Date;
  rescheduledAt?: string | Date;
  RescheduledAt?: string | Date;
  reschdule?: string | Date;
  Reschdule?: string | Date;
  deliveryPriority?: string;
  DeliveryPriority?: string;
  priority?: string;
  Priority?: string;
  queueOrder?: number;
  QueueOrder?: number;
  vehicleType?: string;
  VehicleType?: string;
  volume?: number;
  Volume?: number;
  validationMessages?: string[];
  ValidationMessages?: string[];
  warnings?: string[];
  Warnings?: string[];
  canAssign?: boolean;
  CanAssign?: boolean;
  canUnassign?: boolean;
  CanUnassign?: boolean;
  canReschedule?: boolean;
  CanReschedule?: boolean;
  canUpdatePriority?: boolean;
  CanUpdatePriority?: boolean;
  canUpdateStatus?: boolean;
  CanUpdateStatus?: boolean;
  canNotify?: boolean;
  CanNotify?: boolean;
  isDelayed?: boolean;
  IsDelayed?: boolean;
  trafficCondition?: string;
  TrafficCondition?: string;
}

export interface DeliveryQueueFilters {
  branchId?: number | string;
  courierId?: number | string;
  vehicleType?: string;
  status?: string;
  priority?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface DeliveryReorderChange {
  deliveryId: number;
  queueOrder: number;
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
    ).pipe(
      map(stats => this.mapDashboardStats(stats))
    );
  }

  getBranchPerformance(): Observable<BranchPerformance[]> {
    return this.handleApiResponse<BranchPerformance[]>(
      this.api.getApi('api/Home/GetBranchPerformance')
    );
  }

  getCustomerServiceMetrics(): Observable<CustomerServiceMetrics> {
    return this.handleApiResponse<CustomerServiceMetrics>(
      this.api.getApi('api/Home/GetCustomerServiceMetrics')
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
        const normalizedCouriers = couriers.map(courier => this.mapCourier(courier));
        this.couriersSubject.next(normalizedCouriers);
        return normalizedCouriers;
      })
    );
  }

  updateCourierStatus(courierId: number, status: 'Available' | 'Busy' | 'On Break' | 'Offline'): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostLiteApi(`api/Home/UpdateCourierStatus?CourierId=${courierId}&Status=${status}`)
    );
  }

  getDeliveryQueue(filters?: DeliveryQueueFilters): Observable<PagedResult<DeliveryQueueItem>> {
    return this.handleApiResponse<{ items: OperationsShipmentDto[], totalCount: number, pageNumber: number, pageSize: number, totalPages: number }>(
      this.api.getApi(this.withQuery('api/Home/GetDeliveryQueue', filters))
    ).pipe(
      map(pagedResult => {
        const items = pagedResult.items.map(shipment => this.mapDeliveryQueueItem(shipment));
        const result: PagedResult<DeliveryQueueItem> = {
          items,
          totalCount: pagedResult.totalCount,
          pageNumber: pagedResult.pageNumber,
          pageSize: pagedResult.pageSize,
          totalPages: pagedResult.totalPages
        };
        this.deliveryQueueSubject.next(items);
        return result;
      })
    );
  }

  assignCourierToDelivery(deliveryId: number, courierId: number): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostApi({ shipmentId: deliveryId, courierId: courierId }, 'api/Shipment/AssignCourier')
    );
  }

  unassignCourierFromDelivery(deliveryId: number): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostApi({ shipmentId: deliveryId }, 'api/Shipment/UnassignCourier')
    );
  }

  rescheduleDelivery(deliveryId: number, scheduledAt: Date): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostApi({ shipmentId: deliveryId, scheduledAt: scheduledAt.toISOString() }, 'api/Shipment/RescheduleDelivery')
    );
  }

  updateDeliveryPriority(deliveryId: number, priority: DeliveryQueueItem['priority']): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostApi({ shipmentId: deliveryId, priority }, 'api/Shipment/UpdateDeliveryPriority')
    );
  }

  reorderDeliveries(changes: DeliveryReorderChange[]): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostApi({
        changes: changes.map(change => ({
          shipmentId: change.deliveryId,
          queueOrder: change.queueOrder
        }))
      }, 'api/Shipment/ReorderDeliveries')
    );
  }

  updateDeliveryStatus(deliveryId: number, statusId: number, note = ''): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostApi({ shipmentId: deliveryId, statusId, note }, 'api/Shipment/UpdateDeliveryStatus')
    );
  }

  sendCustomerDeliveryNotification(deliveryId: number, messageType: string): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostApi({ shipmentId: deliveryId, messageType }, 'api/Shipment/SendCustomerDeliveryNotification')
    );
  }

  optimizeRoute(shipmentIds: number[]): Observable<RespOptimizeRoute> {
    return this.handleApiResponse<RespOptimizeRoute>(
      this.api.PostApi({ shipmentIds }, 'api/operations/optimize-route')
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

  getHubMonitoringStats(hubId: number): Observable<HubMonitoringStats> {
    return this.handleApiResponse<HubMonitoringStats>(
      this.api.getApi(`api/Hub/GetHubStats?hubId=${hubId}`)
    );
  }

  getPendingTransfers(hubId?: number): Observable<HubTransfer[]> {
    const url = hubId ? `api/Hub/GetPendingTransfers?hubId=${hubId}` : 'api/Hub/GetPendingTransfers';
    return this.handleApiResponse<any[]>(this.api.getApi(url)).pipe(
      map(transfers => transfers.map(t => ({
        id: t.id,
        packageId: t.shipmentId,
        trackingNumber: t.shipmentBarcode,
        fromHubId: t.fromHubId,
        fromHubName: t.fromHubName,
        toHubId: t.toHubId,
        toHubName: t.toHubName,
        transferDate: new Date(t.createdAt),
        transferredBy: '',
        status: this.mapTransferStatus(t.status),
        notes: ''
      })))
    );
  }

  getHubExceptions(hubId: number): Observable<HubException[]> {
    return this.handleApiResponse<HubException[]>(
      this.api.getApi(`api/Hub/GetHubExceptions?hubId=${hubId}`)
    );
  }

  updateTransferStatus(transferId: number, status: number): Observable<{succeeded: boolean, message: string}> {
    return this.handleApiResponse<{succeeded: boolean, message: string}>(
      this.api.PostLiteApi(`api/Hub/UpdateTransferStatus?transferId=${transferId}&status=${status}`)
    );
  }

  private mapTransferStatus(status: number): HubTransfer['status'] {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'In Transit';
      case 3: return 'Received';
      case 4: return 'Cancelled';
      default: return 'Pending';
    }
  }

  getHubs(): Observable<Hub[]> {
    return this.handleApiResponse<BranchLookup[]>(
      this.api.getApi('api/Lookup/GetBranch')
    ).pipe(
      map((branches) => branches.map(branch => ({
        id: branch.branchId || branch.BranchId || branch.id || branch.Id || 0,
        name: branch.brancheNameEn || branch.BrancheNameEn || '',
        code: branch.code || branch.Code || String(branch.branchId || branch.id),
        address: branch.addresseEn || branch.AddresseEn || '',
        city: branch.addresseEn || branch.AddresseEn || '',
        phone: '',
        managerName: '',
        capacity: 100, // Default capacity
        currentLoad: 0,
        isActive: true,
        latitude: branch.lat || branch.Lat,
        longitude: branch.lon || branch.Lon
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

  private mapCourier(courier: any): Courier {
    const normalized: Courier = {
      id: courier.id || courier.Id,
      name: courier.name || courier.Name,
      phone: courier.phone || courier.Phone || '',
      email: courier.email || courier.Email,
      status: courier.status || courier.Status || 'Offline',
      currentOrders: courier.currentOrders ?? courier.CurrentOrders ?? 0,
      maxCapacity: courier.maxCapacity ?? courier.MaxCapacity ?? 10,
      loadPercentage: courier.loadPercentage ?? courier.LoadPercentage,
      branchId: courier.branchId ?? courier.BranchId ?? 0,
      branchName: courier.branchName || courier.BranchName || '',
      branchIds: courier.branchIds || courier.BranchIds,
      vehicleType: courier.vehicleType || courier.VehicleType || '',
      vehicleTypeId: courier.vehicleTypeId ?? courier.VehicleTypeId,
      latitude: courier.latitude ?? courier.Latitude,
      longitude: courier.longitude ?? courier.Longitude,
      todayDeliveries: courier.todayDeliveries ?? courier.TodayDeliveries ?? 0,
      rating: courier.rating ?? courier.Rating ?? 5
    };

    if (normalized.latitude && normalized.longitude) {
      normalized.currentLocation = {
        latitude: normalized.latitude,
        longitude: normalized.longitude
      };
    }

    return normalized;
  }

  private mapDashboardStats(stats: Partial<OperationsDashboardStats> | null | undefined): OperationsDashboardStats {
    return {
      deliveriesCompleted: stats?.deliveriesCompleted ?? 0,
      inTransitShipments: stats?.inTransitShipments ?? 0,
      pendingPickups: stats?.pendingPickups ?? 0,
      failedDeliveries: stats?.failedDeliveries ?? 0,
      todayRevenue: stats?.todayRevenue ?? 0,
      activeRoutes: stats?.activeRoutes ?? 0,
      activeCouriers: stats?.activeCouriers ?? 0,
      averageDeliveryTime: stats?.averageDeliveryTime ?? 0,
      totalShipmentsToday: stats?.totalShipmentsToday ?? 0,
      totalShipmentsThisWeek: stats?.totalShipmentsThisWeek ?? 0,
      totalShipmentsThisMonth: stats?.totalShipmentsThisMonth ?? 0,
      highValueShipments: stats?.highValueShipments ?? 0
    };
  }

  private hasValidCoordinates(courier: Courier): courier is Courier & { latitude: number; longitude: number } {
    return typeof courier.latitude === 'number'
      && Number.isFinite(courier.latitude)
      && typeof courier.longitude === 'number'
      && Number.isFinite(courier.longitude);
  }

  private mapPickupRequest(shipment: OperationsShipmentDto): PickupRequest {
    const id = this.getShipmentId(shipment);
    const createdDate = this.toDate(shipment.createdat ?? shipment.Createdat);
    const pickupAddress = shipment.shipmentsFromEn || shipment.ShipmentsFromEn || shipment.shipmentsFromAr || shipment.ShipmentsFromAr || '';

    return {
      id,
      requestNumber: this.getShipmentBarcode(shipment) || String(id),
      customerName: this.getCustomerName(shipment),
      customerPhone: shipment.customerPhone || shipment.CustomerPhone || '',
      pickupAddress,
      city: this.getCityFromAddress(pickupAddress),
      packageType: 'Shipment',
      estimatedWeight: shipment.weight ?? shipment.Weight,
      estimatedPackages: shipment.quantity ?? shipment.Quantity,
      preferredDate: createdDate,
      preferredTimeSlot: 'Anytime',
      requestDate: createdDate,
      status: this.mapPickupStatus(shipment.statusId ?? shipment.StatusId, shipment.statusName || shipment.StatusName),
      priority: 'Normal',
      specialInstructions: shipment.instructions || shipment.Instructions || '',
      branchName: shipment.branchName || shipment.BranchName || '',
      branchId: shipment.branchId ?? shipment.BranchId
    };
  }

  private mapDeliveryQueueItem(shipment: OperationsShipmentDto): DeliveryQueueItem {
    const id = this.getShipmentId(shipment);
    const trackingNumber = this.getShipmentBarcode(shipment) || String(id);
    const pickupAddress = shipment.shipmentsFromEn || shipment.ShipmentsFromEn || shipment.shipmentsFromAr || shipment.ShipmentsFromAr || '';
    const deliveryAddress = shipment.shipmentsToEn || shipment.ShipmentsToEn || shipment.shipmentsToAr || shipment.ShipmentsToAr || '';
    const rescheduledAt = this.toOptionalDate(shipment.rescheduledAt ?? shipment.RescheduledAt ?? shipment.reschdule ?? shipment.Reschdule);
    const etaAt = this.toOptionalDate(shipment.etaAt ?? shipment.EtaAt);
    const priority = this.mapDeliveryPriority(shipment.deliveryPriority || shipment.DeliveryPriority || shipment.priority || shipment.Priority);

    return {
      id,
      orderNumber: trackingNumber,
      trackingNumber,
      customerName: this.getCustomerName(shipment),
      customerPhone: shipment.customerPhone || shipment.CustomerPhone || shipment.phoneNumber || shipment.PhoneNumber || '',
      consigneeName: shipment.consignee || shipment.Consignee,
      consigneePhone: shipment.consigneePhone || shipment.ConsigneePhone,
      branchId: shipment.branchId ?? shipment.BranchId,
      branchName: shipment.branchName || shipment.BranchName || '',
      courierId: shipment.courierId ?? shipment.CourierId,
      courierName: shipment.courierName || shipment.CourierName,
      pickupAddress,
      deliveryAddress,
      city: this.getCityFromAddress(deliveryAddress),
      packageDescription: shipment.instructions || shipment.Instructions || 'Shipment',
      scheduledDate: rescheduledAt || this.toDate(shipment.createdat ?? shipment.Createdat),
      rescheduledAt,
      etaAt,
      status: this.mapDeliveryStatus(shipment.statusId ?? shipment.StatusId, shipment.statusName || shipment.StatusName),
      priority,
      queueOrder: shipment.queueOrder ?? shipment.QueueOrder,
      vehicleType: shipment.vehicleType || shipment.VehicleType,
      weight: shipment.weight ?? shipment.Weight,
      volume: shipment.volume ?? shipment.Volume,
      quantity: shipment.quantity ?? shipment.Quantity,
      pickupCoordinates: this.toCoordinates(shipment.fromLatitude ?? shipment.FromLatitude, shipment.fromLongitude ?? shipment.FromLongitude),
      dropoffCoordinates: this.toCoordinates(shipment.toLatitude ?? shipment.ToLatitude, shipment.toLongitude ?? shipment.ToLongitude),
      deliveryType: shipment.vehicleType || shipment.VehicleType || '',
      codAmount: shipment.codAmount ?? shipment.CodAmount ?? shipment.totalEgp ?? shipment.TotalEgp,
      attempts: 0,
      notes: shipment.instructions || shipment.Instructions || '',
      isDelayed: shipment.isDelayed ?? shipment.IsDelayed ?? false,
      trafficCondition: shipment.trafficCondition || shipment.TrafficCondition || '',
      validationMessages: shipment.validationMessages || shipment.ValidationMessages || [],
      warnings: shipment.warnings || shipment.Warnings || [],
      allowedActions: {
        canAssign: shipment.canAssign ?? shipment.CanAssign ?? true,
        canUnassign: shipment.canUnassign ?? shipment.CanUnassign ?? Boolean(shipment.courierId ?? shipment.CourierId),
        canReschedule: shipment.canReschedule ?? shipment.CanReschedule ?? true,
        canUpdatePriority: shipment.canUpdatePriority ?? shipment.CanUpdatePriority ?? true,
        canUpdateStatus: shipment.canUpdateStatus ?? shipment.CanUpdateStatus ?? true,
        canNotify: shipment.canNotify ?? shipment.CanNotify ?? true
      },
      availableStatuses: (shipment as any).availableStatuses || (shipment as any).AvailableStatuses || []
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

  private toOptionalDate(value?: string | Date): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  private toCoordinates(latitude?: number, longitude?: number): { latitude: number; longitude: number } | undefined {
    if (typeof latitude !== 'number' || !Number.isFinite(latitude) || typeof longitude !== 'number' || !Number.isFinite(longitude)) {
      return undefined;
    }

    return { latitude, longitude };
  }

  private mapDeliveryPriority(priority?: string): DeliveryQueueItem['priority'] {
    const normalizedPriority = (priority || '').trim().toLowerCase();

    if (normalizedPriority === 'low') return 'Low';
    if (normalizedPriority === 'high') return 'High';
    if (normalizedPriority === 'urgent') return 'Urgent';

    return 'Normal';
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

    if (normalizedStatus.includes('cancel')) {
      return 'Cancelled';
    }

    if (normalizedStatus.includes('return')) {
      return 'Returned';
    }

    return 'Scheduled';
  }

  private normalizeStatus(statusName?: string): string {
    return (statusName || '').trim().toLowerCase();
  }

  private withQuery(url: string, filters?: DeliveryQueueFilters): string {
    const params = new URLSearchParams();

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    return query ? `${url}?${query}` : url;
  }
}
