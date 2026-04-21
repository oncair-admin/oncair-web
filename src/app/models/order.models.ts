export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientDistrict?: string;
  packageDescription: string;
  packageWeight: number;
  packageDimensions?: string;
  packageValue: number;
  deliveryType: 'Standard' | 'Express' | 'Same Day' | 'Next Day';
  paymentMethod: 'Cash on Delivery' | 'Prepaid' | 'Credit Card' | 'Bank Transfer';
  shippingCost: number;
  codAmount?: number;
  status: OrderStatus;
  courierId?: number;
  courierName?: string;
  branchId: number;
  branchName: string;
  createdDate: Date;
  pickupDate?: Date;
  deliveryDate?: Date;
  estimatedDeliveryDate?: Date;
  notes?: string;
  trackingHistory?: TrackingEvent[];
  attemptCount?: number;
  returnReason?: string;
  isCorporate?: boolean;
  corporateAccountId?: number;
}

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Delivery Attempted'
  | 'Failed'
  | 'Returned'
  | 'Cancelled';

export interface TrackingEvent {
  id: number;
  orderId: number;
  status: OrderStatus;
  description: string;
  location?: string;
  timestamp: Date;
  performedBy?: string;
}

export interface OrderFilters {
  searchTerm?: string;
  status?: OrderStatus | 'All';
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: number;
  courierId?: number;
  branchId?: number;
  deliveryType?: string;
  paymentMethod?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  returnedOrders: number;
  totalRevenue: number;
  averageDeliveryTime: number;
}

export interface CorporateAccount {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  subUsers: CorporateSubUser[];
  createdDate: Date;
}

export interface CorporateSubUser {
  id: number;
  corporateAccountId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  canPlaceOrders: boolean;
  canViewAllOrders: boolean;
  isActive: boolean;
}

export interface BulkOrderUpload {
  fileName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: BulkOrderError[];
  uploadedBy: string;
  uploadDate: Date;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
}

export interface BulkOrderError {
  rowNumber: number;
  field: string;
  errorMessage: string;
  rowData?: any;
}

export interface ReturnDelivery {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  returnReason: ReturnReason;
  returnReasonDetails?: string;
  returnDate: Date;
  returnStatus: 'Pending' | 'Approved' | 'Rejected' | 'Reattempt Scheduled' | 'Refunded';
  refundAmount?: number;
  refundDate?: Date;
  reattemptDate?: Date;
  reattemptCount: number;
  customerFeedback?: string;
  courierNotes?: string;
}

export type ReturnReason = 
  | 'Customer Refused'
  | 'Customer Not Available'
  | 'Wrong Address'
  | 'Damaged Package'
  | 'Customer Changed Mind'
  | 'Cash Not Available'
  | 'Other';
