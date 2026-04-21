/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiController } from '../../../services/CarRental.serviceEnd';
import {
  ApiResponse,
  PaginatedResponse,
  ShipmentListItem,
  CourierShipmentItem,
  ShipmentDetail,
  TrackingEvent,
  CollectionFees,
  OnDemandFees,
  GetAllShipmentsRequest,
  GetAllReturnShipmentsRequest,
  GetCourierShipmentsRequest,
  GetCollectionFeesRequest,
  AddShipmentRequest,
  GetOnDemandFeesRequest,
  AddOnDemandShipmentRequest,
  AddShipmentTrackingRequest,
  CourierItem,
  LookupItem,
  City,
  ShipmentStatus,
} from '../models/shipment.models';

@Injectable({ providedIn: 'root' })
export class ShipmentsService {
  constructor(private api: ApiController) {}

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

  getAllShipments(request: GetAllShipmentsRequest): Observable<PaginatedResponse<ShipmentListItem>> {
    return this.handleApiResponse<PaginatedResponse<ShipmentListItem>>(
      this.api.PostApi(request, 'api/Shipment/GetAllShipments')
    );
  }

  getAllShipmentsForCourier(request: GetCourierShipmentsRequest): Observable<PaginatedResponse<CourierShipmentItem>> {
    return this.handleApiResponse<PaginatedResponse<CourierShipmentItem>>(
      this.api.PostApi(request, 'api/Shipment/GetAllShipmentsForCourier')
    );
  }

  getAllReturnShipments(request: GetAllReturnShipmentsRequest): Observable<PaginatedResponse<ShipmentListItem>> {
    return this.handleApiResponse<PaginatedResponse<ShipmentListItem>>(
      this.api.PostApi(request, 'api/Shipment/GetAllReturnShipments')
    );
  }

  getShipmentByBarcode(barcode: string): Observable<PaginatedResponse<ShipmentListItem>> {
    return this.handleApiResponse<PaginatedResponse<ShipmentListItem>>(
      this.api.PostLiteApi(`api/Shipment/GetShipmentByBarCode?barcode=${encodeURIComponent(barcode)}`)
    );
  }

  getShipmentById(shipmentId: number): Observable<ShipmentDetail> {
    return this.handleApiResponse<ShipmentDetail>(
      this.api.getApi(`api/Shipment/GetShipmentById?ShipmentId=${shipmentId}`)
    );
  }

  getShipmentTracking(shipmentId: number): Observable<TrackingEvent[]> {
    return this.handleApiResponse<TrackingEvent[]>(
      this.api.getApi(`api/Shipment/GetShipmentTracking?ShipmentId=${shipmentId}`)
    );
  }

  getCollectionFees(request: GetCollectionFeesRequest): Observable<CollectionFees> {
    return this.handleApiResponse<CollectionFees>(
      this.api.PostApi(request, 'api/Shipment/GetCollectionFees')
    );
  }

  getOnDemandFees(request: GetOnDemandFeesRequest): Observable<OnDemandFees> {
    return this.handleApiResponse<OnDemandFees>(
      this.api.PostApi(request, 'api/Shipment/GetOnDenamdFees')
    );
  }

  addShipment(request: AddShipmentRequest): Observable<number> {
    return this.handleApiResponse<number>(
      this.api.PostApi(request, 'api/Shipment/AddShipment')
    );
  }

  addOnDemandShipment(request: AddOnDemandShipmentRequest): Observable<number> {
    return this.handleApiResponse<number>(
      this.api.PostApi(request, 'api/Shipment/AddOnDenamdShipment')
    );
  }

  cancelShipment(shipmentId: number, note: string): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostLiteApi(`api/Shipment/CancelShipment?ShipmentId=${shipmentId}&Note=${encodeURIComponent(note)}`)
    );
  }

  returnShipment(shipmentId: number): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostLiteApi(`api/Shipment/ReturnTheShipment?ShipmentId=${shipmentId}`)
    );
  }

  addShipmentTracking(request: AddShipmentTrackingRequest): Observable<boolean> {
    return this.handleApiResponse<boolean>(
      this.api.PostApi(request, 'api/Shipment/AddShipmentTracking')
    );
  }

  getCities(): Observable<City[]> {
    return this.handleApiResponse<City[]>(
      this.api.getApi('api/Lookup/GetCity')
    );
  }

  getShipmentStatuses(): Observable<ShipmentStatus[]> {
    return this.handleApiResponse<ShipmentStatus[]>(
      this.api.getApi('api/Lookup/GetShipmentStatus')
    );
  }

  getCouriersNames(): Observable<CourierItem[]> {
    return this.handleApiResponse<CourierItem[]>(
      this.api.getApi('auth/Auth/GetAllCouriersNames')
    );
  }

  private normalizeLookupItem(item: any): LookupItem {
    if (item.shipmentTypeId) {
      return {
        id: item.shipmentTypeId,
        name: item.shipmentTypeEn || '',
        nameAr: item.shipmentTypeAr || '',
        shipmentTypeId: item.shipmentTypeId,
        shipmentTypeEn: item.shipmentTypeEn,
        shipmentTypeAr: item.shipmentTypeAr
      };
    }
    return {
      ...item,
      id: item.id || item.shipmentTypeId || 0,
      name: item.name || item.nameEn || item.statusNameEn || item.shipmentTypeEn || '',
      nameAr: item.nameAr || item.statusNameAr || item.shipmentTypeAr || ''
    };
  }

  getDeliveryMethods(): Observable<LookupItem[]> {
    return this.handleApiResponse<LookupItem[]>(
      this.api.getApi('api/Lookup/GetDeliveryMethods')
    ).pipe(
      map((items) => items.map(item => this.normalizeLookupItem(item)))
    );
  }

  getServiceTypes(): Observable<LookupItem[]> {
    return this.handleApiResponse<LookupItem[]>(
      this.api.getApi('api/Lookup/GetServiceTypes')
    ).pipe(
      map((items) => items.map(item => this.normalizeLookupItem(item)))
    );
  }

  getShipmentTypes(): Observable<LookupItem[]> {
    return this.handleApiResponse<LookupItem[]>(
      this.api.getApi('api/Lookup/GetShipmentTypes')
    ).pipe(
      map((items) => items.map(item => this.normalizeLookupItem(item)))
    );
  }

  getPaymentMethods(): Observable<LookupItem[]> {
    return this.handleApiResponse<LookupItem[]>(
      this.api.getApi('api/Lookup/GetPaymentsMethods')
    ).pipe(
      map((items) => items.map(item => this.normalizeLookupItem(item)))
    );
  }

  getContentCategories(): Observable<LookupItem[]> {
    return this.handleApiResponse<LookupItem[]>(
      this.api.getApi('api/Lookup/GetContentCategory')
    ).pipe(
      map((items) => items.map(item => this.normalizeLookupItem(item)))
    );
  }
}
