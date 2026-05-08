import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  Order, 
  OrderStatus, 
  OrderStatistics, 
  ReturnDelivery, 
  CorporateAccount,
  OrderFilters
} from '../models/order.models';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ShipmentListItem, 
  ShipmentDetail,
  TrackingEvent as ApiTrackingEvent,
  CollectionFees,
  OnDemandFees,
  GetAllShipmentsRequest,
  AddShipmentRequest,
  ReqBulkShipmentDto
} from '../models/shipment.models';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}api/Shipment/`;
  private homeUrl = `${environment.apiUrl}api/Home/`;
  private companyUrl = `${environment.apiUrl}api/CompanyInformation/`;

  constructor(private http: HttpClient) {}

  getAllOrders(pageNumber: number = 1, pageSize: number = 10, statusId: number = 0): Observable<PaginatedResponse<Order>> {
    const request: GetAllShipmentsRequest = {
      pageNumber,
      pageSize,
      statusId
    };

    return this.http.post<ApiResponse<PaginatedResponse<ShipmentListItem>>>(`${this.apiUrl}GetAllShipments`, request).pipe(
      map(response => {
        if (response.succeeded) {
          return {
            ...response.data,
            items: response.data.items.map(item => this.mapShipmentToOrder(item))
          };
        }
        throw new Error(response.message);
      })
    );
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<ApiResponse<ShipmentDetail>>(`${this.apiUrl}GetShipmentById?ShipmentId=${id}`).pipe(
      map(response => {
        if (response.succeeded) {
          return this.mapDetailToOrder(response.data);
        }
        throw new Error(response.message);
      })
    );
  }

  createOrder(order: any): Observable<{succeeded: boolean, message: string, data?: any}> {
    // Note: The UI currently passes a Partial<Order>. We need to map it to AddShipmentRequest.
    // This is a complex mapping, simplified for now to use the direct DTO if possible.
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}AddShipment`, order).pipe(
      map(response => ({
        succeeded: response.succeeded,
        message: response.message,
        data: response.data
      }))
    );
  }

  createBulkOrders(shipments: any[]): Observable<{succeeded: boolean, message: string, data?: any}> {
    const request: ReqBulkShipmentDto = {
      shipments: shipments
    };
    return this.http.post<ApiResponse<number[]>>(`${this.apiUrl}AddBulkShipments`, request).pipe(
      map(response => ({
        succeeded: response.succeeded,
        message: response.message,
        data: response.data
      }))
    );
  }

  deleteOrder(id: number): Observable<{succeeded: boolean, message: string}> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}CancelShipment?ShipmentId=${id}`, {}).pipe(
      map(response => ({
        succeeded: response.succeeded,
        message: response.message
      }))
    );
  }

  getOrderStatistics(): Observable<OrderStatistics> {
    return this.http.get<ApiResponse<any>>(`${this.homeUrl}GetOperationsDashboardStats`).pipe(
      map(response => {
        if (response.succeeded) {
          const stats = response.data;
          return {
            totalOrders: (stats.deliveriesCompleted + stats.inTransitShipments + stats.pendingPickups + stats.failedDeliveries) || 0,
            pendingOrders: stats.pendingPickups || 0,
            inTransitOrders: stats.inTransitShipments || 0,
            deliveredOrders: stats.deliveriesCompleted || 0,
            failedOrders: stats.failedDeliveries || 0,
            returnedOrders: 0, // Not provided by this endpoint
            totalRevenue: stats.todayRevenue || 0,
            averageDeliveryTime: stats.averageDeliveryTime || 0
          };
        }
        throw new Error(response.message);
      })
    );
  }

  getReturnDeliveries(pageNumber: number = 1, pageSize: number = 10): Observable<ReturnDelivery[]> {
    const request = { pageNumber, pageSize };
    return this.http.post<ApiResponse<PaginatedResponse<ShipmentListItem>>>(`${this.apiUrl}GetAllReturnShipments`, request).pipe(
      map(response => {
        if (response.succeeded) {
          return response.data.items.map(item => ({
            id: item.shipmentId,
            orderId: item.shipmentId,
            orderNumber: item.shipmentBarcode || `ID-${item.shipmentId}`,
            customerName: item.customerName || 'Unknown',
            returnReason: 'Customer Not Available' as any, // Mocked reason
            returnDate: item.createdat ? new Date(item.createdat) : new Date(),
            returnStatus: 'Pending' as any,
            reattemptCount: 0
          }));
        }
        return [];
      })
    );
  }

  getCorporateAccounts(): Observable<CorporateAccount[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.companyUrl}GetAllCompanies`).pipe(
      map(response => {
        if (response.succeeded) {
          return response.data.map(company => ({
            id: company.id,
            companyName: company.companyName,
            contactPerson: company.businessType || 'Retail',
            email: company.companyEmail || '',
            phone: company.companyPhoneNumber || '',
            address: company.companyAddress || '',
            isActive: company.isActive,
            subUsers: [],
            createdDate: new Date()
          }));
        }
        return [];
      })
    );
  }

  private mapShipmentToOrder(item: ShipmentListItem): Order {
    return {
      id: item.shipmentId,
      orderNumber: item.shipmentBarcode || `ID-${item.shipmentId}`,
      customerName: item.customerName || 'Customer',
      customerPhone: '', // Not in list
      senderName: '',
      senderPhone: '',
      senderAddress: item.shipmentsFromEn,
      recipientName: '',
      recipientPhone: '',
      recipientAddress: item.shipmentsToEn,
      recipientCity: item.shipmentsToEn,
      packageDescription: '',
      packageWeight: 0,
      packageValue: item.totalEgp || 0,
      deliveryType: 'Standard',
      paymentMethod: 'Cash on Delivery',
      shippingCost: 0,
      codAmount: item.codAmount || 0,
      status: this.mapStatusIdToName(item.statusName),
      branchId: 0,
      branchName: '',
      createdDate: item.createdat ? new Date(item.createdat) : new Date(),
      isCorporate: false
    };
  }

  private mapDetailToOrder(detail: ShipmentDetail): Order {
    return {
      id: detail.shipmentId,
      orderNumber: detail.shipmentBarcode || `ID-${detail.shipmentId}`,
      customerName: detail.consignee,
      customerPhone: detail.consigneePhone,
      senderName: '',
      senderPhone: '',
      senderAddress: detail.senderAddress,
      recipientName: detail.consignee,
      recipientPhone: detail.consigneePhone,
      recipientAddress: detail.consigneeAddress,
      recipientCity: detail.shipmentsToEn,
      packageDescription: detail.contentCategoryText,
      packageWeight: detail.chargeableWeight,
      packageValue: detail.total,
      deliveryType: 'Standard',
      paymentMethod: 'Cash on Delivery',
      shippingCost: detail.total - (detail.codAmount || 0),
      codAmount: detail.codAmount,
      status: this.mapStatusIdToName(detail.statusName),
      branchId: 0,
      branchName: detail.brancheNameEn,
      createdDate: new Date(detail.createdat),
      isCorporate: false,
      notes: detail.instructions,
      isFragile: detail.isFragile
    } as any;
  }

  private mapStatusIdToName(statusName: string): OrderStatus {
    // The backend returns statusName directly. We might need to normalize it.
    const mapping: Record<string, OrderStatus> = {
      'Pending': 'Pending',
      'Confirmed': 'Confirmed',
      'Picked Up': 'Picked Up',
      'In Transit': 'In Transit',
      'Out for Delivery': 'Out for Delivery',
      'Delivered': 'Delivered',
      'Failed': 'Failed',
      'Returned': 'Returned',
      'Cancelled': 'Cancelled'
    };
    return mapping[statusName] || 'Pending';
  }
}
