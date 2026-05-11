import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiController } from '../../../services/CarRental.serviceEnd';
import { OperationsService } from './operations.service';

describe('OperationsService', () => {
  let service: OperationsService;
  let api: jasmine.SpyObj<ApiController>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiController>('ApiController', ['getApi', 'PostApi', 'PostLiteApi']);

    TestBed.configureTestingModule({
      providers: [
        OperationsService,
        { provide: ApiController, useValue: api }
      ]
    });

    service = TestBed.inject(OperationsService);
  });

  it('maps dashboard stats shipment overview fields with numeric fallbacks', async () => {
    api.getApi.and.returnValue(of({
      succeeded: true,
      message: 'ok',
      errors: [],
      data: {
        deliveriesCompleted: 10,
        inTransitShipments: 4,
        pendingPickups: 3,
        failedDeliveries: 2,
        todayRevenue: 1250.75,
        activeCouriers: 5,
        totalShipmentsToday: 6,
        totalShipmentsThisWeek: 7,
        totalShipmentsThisMonth: 8,
        highValueShipments: 9
      }
    }));

    const stats = await firstValueFrom(service.getDashboardStats());

    expect(api.getApi).toHaveBeenCalledWith('api/Home/GetOperationsDashboardStats');
    expect(stats.totalShipmentsToday).toBe(6);
    expect(stats.totalShipmentsThisWeek).toBe(7);
    expect(stats.totalShipmentsThisMonth).toBe(8);
    expect(stats.highValueShipments).toBe(9);
    expect(stats.averageDeliveryTime).toBe(0);
    expect(stats.activeRoutes).toBe(0);
  });

  it('maps shipment-shaped pickup requests to pickup table rows', async () => {
    api.getApi.and.returnValue(of({
      succeeded: true,
      message: 'ok',
      errors: [],
      data: [{
        shipmentId: 1001,
        shipmentBarcode: 'SHP1001',
        customerId: 42,
        customerName: '',
        statusId: 1,
        statusName: 'Order Received',
        shipmentsFromEn: '15 Tahrir St, Dokki, Giza',
        shipmentsFromAr: '',
        shipmentsToEn: 'Nasr City, Cairo',
        shipmentsToAr: '',
        quantity: 2,
        createdat: '2026-05-01T10:30:00'
      }]
    }));

    const rows = await firstValueFrom(service.getPickupRequests());

    expect(api.getApi).toHaveBeenCalledWith('api/Home/GetPickupRequests');
    expect(rows[0].id).toBe(1001);
    expect(rows[0].requestNumber).toBe('SHP1001');
    expect(rows[0].customerName).toBe('Customer #42');
    expect(rows[0].pickupAddress).toBe('15 Tahrir St, Dokki, Giza');
    expect(rows[0].city).toBe('Giza');
    expect(rows[0].status).toBe('Pending');
    expect(rows[0].preferredDate).toEqual(new Date('2026-05-01T10:30:00'));
  });

  it('maps shipment-shaped delivery queue items to delivery table rows', async () => {
    api.getApi.and.returnValue(of({
      succeeded: true,
      message: 'ok',
      errors: [],
      data: [{
        shipmentId: 2002,
        shipmentBarcode: 'SHP2002',
        customerId: 77,
        codAmount: 125.5,
        totalEgp: 150,
        customerName: 'Acme Stores',
        statusId: 3,
        statusName: 'Picked Up',
        shipmentsFromEn: 'Giza',
        shipmentsFromAr: '',
        shipmentsToEn: '22 Abbas El Akkad, Nasr City, Cairo',
        shipmentsToAr: '',
        quantity: 1,
        createdat: '2026-05-02T08:15:00'
      }]
    }));

    const rows = await firstValueFrom(service.getDeliveryQueue());

    expect(api.getApi).toHaveBeenCalledWith('api/Home/GetDeliveryQueue');
    expect(rows[0].id).toBe(2002);
    expect(rows[0].orderNumber).toBe('SHP2002');
    expect(rows[0].customerName).toBe('Acme Stores');
    expect(rows[0].deliveryAddress).toBe('22 Abbas El Akkad, Nasr City, Cairo');
    expect(rows[0].city).toBe('Cairo');
    expect(rows[0].codAmount).toBe(125.5);
    expect(rows[0].status).toBe('In Progress');
    expect(rows[0].scheduledDate).toEqual(new Date('2026-05-02T08:15:00'));
  });

  it('maps operational delivery queue metadata from shipment DTOs', async () => {
    api.getApi.and.returnValue(of({
      succeeded: true,
      message: 'ok',
      errors: [],
      data: [{
        shipmentId: 3003,
        shipmentBarcode: 'SHP3003',
        customerId: 88,
        customerName: 'North Market',
        customerPhone: '01012345678',
        consignee: 'Mona Ali',
        consigneePhone: '01111111111',
        statusId: 2,
        statusName: 'Assigned',
        branchId: 12,
        branchName: 'Nasr City Branch',
        courierId: 501,
        courierName: 'Courier One',
        shipmentsFromEn: 'Warehouse A, Cairo',
        shipmentsToEn: 'Customer Street, Cairo',
        weight: 4.5,
        quantity: 3,
        fromLatitude: 30.01,
        fromLongitude: 31.20,
        toLatitude: 30.05,
        toLongitude: 31.25,
        rescheduledAt: '2026-05-04T12:00:00',
        etaAt: '2026-05-04T14:30:00',
        deliveryPriority: 'High',
        queueOrder: 7,
        vehicleType: 'Bike',
        validationMessages: ['Capacity data unavailable'],
        warnings: ['ETA is estimated']
      }]
    }));

    const rows = await firstValueFrom(service.getDeliveryQueue({
      branchId: 12,
      courierId: 501,
      vehicleType: 'Bike',
      status: 'Assigned',
      priority: 'High',
      search: 'SHP3003'
    }));

    expect(api.getApi).toHaveBeenCalledWith('api/Home/GetDeliveryQueue?branchId=12&courierId=501&vehicleType=Bike&status=Assigned&priority=High&search=SHP3003');
    expect(rows[0]).toEqual(jasmine.objectContaining({
      id: 3003,
      orderNumber: 'SHP3003',
      trackingNumber: 'SHP3003',
      customerName: 'North Market',
      customerPhone: '01012345678',
      consigneeName: 'Mona Ali',
      consigneePhone: '01111111111',
      branchId: 12,
      branchName: 'Nasr City Branch',
      courierId: 501,
      courierName: 'Courier One',
      pickupAddress: 'Warehouse A, Cairo',
      deliveryAddress: 'Customer Street, Cairo',
      weight: 4.5,
      quantity: 3,
      priority: 'High',
      queueOrder: 7,
      vehicleType: 'Bike',
      validationMessages: ['Capacity data unavailable'],
      warnings: ['ETA is estimated']
    }));
    expect(rows[0].pickupCoordinates).toEqual({ latitude: 30.01, longitude: 31.20 });
    expect(rows[0].dropoffCoordinates).toEqual({ latitude: 30.05, longitude: 31.25 });
    expect(rows[0].rescheduledAt).toEqual(new Date('2026-05-04T12:00:00'));
    expect(rows[0].etaAt).toEqual(new Date('2026-05-04T14:30:00'));
  });

  it('calls delivery queue operation endpoints with explicit command payloads', async () => {
    api.PostApi.and.returnValue(of({ succeeded: true, message: 'ok', errors: [], data: { succeeded: true, message: 'ok' } }));

    await firstValueFrom(service.unassignCourierFromDelivery(3003));
    await firstValueFrom(service.rescheduleDelivery(3003, new Date(Date.UTC(2026, 4, 6, 9, 0, 0))));
    await firstValueFrom(service.updateDeliveryPriority(3003, 'Urgent'));
    await firstValueFrom(service.reorderDeliveries([{ deliveryId: 3003, queueOrder: 1 }]));
    await firstValueFrom(service.sendCustomerDeliveryNotification(3003, 'eta_update'));

    expect(api.PostApi).toHaveBeenCalledWith({ shipmentId: 3003 }, 'api/Shipment/UnassignCourier');
    expect(api.PostApi).toHaveBeenCalledWith({ shipmentId: 3003, scheduledAt: '2026-05-06T09:00:00.000Z' }, 'api/Shipment/RescheduleDelivery');
    expect(api.PostApi).toHaveBeenCalledWith({ shipmentId: 3003, priority: 'Urgent' }, 'api/Shipment/UpdateDeliveryPriority');
    expect(api.PostApi).toHaveBeenCalledWith({ changes: [{ shipmentId: 3003, queueOrder: 1 }] }, 'api/Shipment/ReorderDeliveries');
    expect(api.PostApi).toHaveBeenCalledWith({ shipmentId: 3003, messageType: 'eta_update' }, 'api/Shipment/SendCustomerDeliveryNotification');
  });

  it('maps top-level courier coordinates to the current location used by live tracking', async () => {
    api.getApi.and.returnValue(of({
      succeeded: true,
      message: 'ok',
      errors: [],
      data: [{
        id: 501,
        name: 'Courier One',
        phone: '01000000000',
        status: 'Available',
        currentOrders: 1,
        maxCapacity: 5,
        branchId: 10,
        branchName: 'Cairo Hub',
        vehicleType: 'Bike',
        latitude: 30.0444,
        longitude: 31.2357,
        todayDeliveries: 4
      }]
    }));

    const couriers = await firstValueFrom(service.getCouriers());

    expect(api.getApi).toHaveBeenCalledWith('api/Home/GetAllCouriers');
    expect(couriers[0].currentLocation).toEqual({
      latitude: 30.0444,
      longitude: 31.2357
    });
  });

  it('does not create a courier current location when coordinates are null or missing', async () => {
    api.getApi.and.returnValue(of({
      succeeded: true,
      message: 'ok',
      errors: [],
      data: [{
        id: 502,
        name: 'Courier Two',
        phone: '01000000001',
        status: 'Available',
        currentOrders: 0,
        maxCapacity: 5,
        branchId: 10,
        branchName: 'Cairo Hub',
        vehicleType: 'Bike',
        latitude: null,
        longitude: null,
        todayDeliveries: 0
      }, {
        id: 503,
        name: 'Courier Three',
        phone: '01000000002',
        status: 'Offline',
        currentOrders: 0,
        maxCapacity: 5,
        branchId: 10,
        branchName: 'Cairo Hub',
        vehicleType: 'Bike',
        todayDeliveries: 0
      }]
    }));

    const couriers = await firstValueFrom(service.getCouriers());

    expect(couriers[0].currentLocation).toBeUndefined();
    expect(couriers[1].currentLocation).toBeUndefined();
  });
});
