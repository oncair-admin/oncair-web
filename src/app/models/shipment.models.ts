// API Response wrapper
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: ApiError[];
  data: T;
}

export interface ApiError {
  errorsCode: number;
  errorsMessage: string;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Courier shipment list item (from GetAllShipmentsForCourier)
export interface CourierShipmentItem {
  shipmentId: number;
  shipmentBarcode: string;
  customerId: number;
  statusName: string;
  statusNameAr: string;
  shipmentsFromAr: string;
  shipmentsFromEn: string;
  shipmentsToAr: string;
  shipmentsToEn: string;
  total: number;
  [key: string]: unknown; // Allow additional fields from API
}

// Shipment list item (from GetAllShipments, GetAllReturnShipments, GetShipmentByBarCode)
export interface ShipmentListItem {
  shipmentId: number;
  shipmentBarcode: string;
  customerId: number;
  totalEgp: number;
  statusName: string;
  statusNameAr: string;
  shipmentsFromAr: string;
  shipmentsFromEn: string;
  shipmentsToAr: string;
  shipmentsToEn: string;
  customerName?: string;
  codAmount?: number;
  createdat?: string;
}

// ... rest of interfaces ...

export interface ReqBulkShipmentDto {
  shipments: AddShipmentRequest[];
}

// Full shipment details (from GetShipmentById)
export interface ShipmentDetail {
  shipmentId: number;
  createdat: string;
  shipmentBarcode: string;
  consignee: string;
  consigneePhone: string;
  consigneeAddress: string;
  senderAddress: string;
  customerId: number;
  instructions: string;
  brancheNameAr: string;
  brancheNameEn: string;
  contentCategoryText: string;
  totalEgp?: number | null;
  statusName: string;
  statusNameAr: string;
  shipmentsFromAr: string;
  shipmentsFromEn: string;
  shipmentsToAr: string;
  shipmentsToEn: string;
  pickupFees: number;
  zonalRate: number;
  chargeableWeight: number;
  codAmount: number;
  codCollectionFees: number;
  goPlusService: number;
  insurance: number;
  fragile: number;
  taxPercentage: number;
  total: number;
  openPackageAllowedFees: number;
  openPackageAllowed: boolean;
  isFragile: boolean;
  tax: number;
}

// Tracking event (from GetShipmentTracking)
export interface TrackingEvent {
  shipmentId: number;
  statusName: string;
  trackingDate: string;
}

// Collection fees response (from GetCollectionFees)
export interface CollectionFees {
  pickupFees: number;
  zonalRate: number;
  chargeableWeight: number;
  codCollectionFees: number;
  goPlusService: number;
  insurance: number;
  fragile: number;
  taxPercentage: number;
  total: number;
  openPackageAllowed: number;
}

// On-demand fees response (from GetOnDenamdFees)
export interface OnDemandFees {
  packageRate: number;
  tax: number;
  total: number;
}

// Request DTOs
export interface GetAllShipmentsRequest {
  pageNumber: number;
  pageSize: number;
  statusId: number;
}

export interface GetAllReturnShipmentsRequest {
  pageNumber: number;
  pageSize: number;
}

export interface GetCourierShipmentsRequest {
  pageNumber: number;
  pageSize: number;
  statusId: number;
  serviceType: number;
  courierId: number;
  fromDate?: string;
  toDate?: string;
}

export interface GetCollectionFeesRequest {
  openPackageAllowed: boolean;
  isPickup: boolean;
  isReturn: boolean;
  isReplacment: boolean;
  fromCityId: number;
  toCityId: number;
  codAmount: number;
  insuranance: number;
  lenght: number;
  width: number;
  height: number;
  weight: number;
  isFragile: boolean;
}

export interface ShipmentPaymentDetails {
  openPackageAllowed: boolean;
  isPickup: boolean;
  isReturn: boolean;
  isReplacment: boolean;
  fromCityId: number;
  toCityId: number;
  codAmount: number;
  insuranance: number;
  lenght: number;
  width: number;
  height: number;
  weight: number;
  isFragile: boolean;
  pickupFees: number;
  zonalRate: number;
  chargeableWeight: number;
  codCollectionFees: number;
  goPlusService: number;
  insurance: number;
  fragile: number;
  taxPercentage: number;
  total: number;
  openPackageAllowedFees: number;
}

export interface AddShipmentRequest {
  shipmentType: number;
  openPackageAllowed: boolean;
  consignee: string;
  consigneePhone: string;
  fromCityId: number;
  fromAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toAddress: string;
  toCityId: number;
  consigneeAddress: string;
  senderAddress: string;
  instructions: string;
  quantity: number;
  toLatitude: number;
  toLongitude: number;
  kilometres: number;
  deliveryMethod: number;
  serviceType: number;
  paymentMethod: number;
  expiryMonthYear: string;
  cardHolderName: string;
  cardNuber: string;
  contentCategoryId: number;
  contentCategoryText: string;
  reqShipmentPaymentDetailsDto: ShipmentPaymentDetails;
}

export interface GetOnDemandFeesRequest {
  quantity: number;
  sizeId: number;
  kilometre: number;
}

export interface AddOnDemandShipmentRequest {
  shipmentType: number;
  consignee: string;
  consigneePhone: string;
  fromAddress: string;
  fromLatitude: number;
  fromLongitude: number;
  toAddress: string;
  toLatitude: number;
  toLongitude: number;
  kilometres: number;
  sizeId: number;
  transportType: number;
  taxPercentage: number;
  total: number;
  expiryMonthYear: string;
  cardHolderName: string;
  cardNuber: string;
}

export interface CourierItem {
  id: number;
  nameEn: string;
  nameAr: string;
  jobId: number;
}

export interface AddShipmentTrackingRequest {
  shipmentId: number;
  statusId: number;
  userId: number;
  note: string;
}

// Lookup types
export interface LookupItem {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  statusNameEn?: string;
  statusNameAr?: string;
  shipmentTypeId?: number;
  shipmentTypeEn?: string;
  shipmentTypeAr?: string;
}

export interface City {
  id: number;
  name: string;
  nameAr: string;
}

export interface ShipmentStatus {
  id: number;
  statusNameEn: string;
  statusNameAr: string;
}
