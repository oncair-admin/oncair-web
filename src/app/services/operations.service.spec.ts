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
});
