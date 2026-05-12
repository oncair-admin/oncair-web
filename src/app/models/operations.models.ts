export interface OperationsDashboardStats {
  deliveriesCompleted: number;
  inTransitShipments: number;
  pendingPickups: number;
  failedDeliveries: number;
  todayRevenue: number;
  activeRoutes: number;
  activeCouriers: number;
  averageDeliveryTime: number;
  totalShipmentsToday: number;
  totalShipmentsThisWeek: number;
  totalShipmentsThisMonth: number;
  highValueShipments: number;
}

export interface BranchPerformance {
  branchId: number;
  branchName: string;
  deliveries: number;
  successRate: number;
  avgDeliveryTime: number;
  revenue: number;
  activeCouriers: number;
}

export interface Escalation {
  id: number;
  orderId: number;
  orderNumber: string;
  type: 'Delay' | 'Customer Complaint' | 'Damaged Package' | 'Lost Package' | 'Wrong Address';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  reportedBy: string;
  reportedDate: Date;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  resolution?: string;
}

export interface Courier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: 'Available' | 'Busy' | 'On Break' | 'Offline';
  currentOrders: number;
  maxCapacity: number;
  loadPercentage?: number;
  branchId: number;
  branchName: string;
  branchIds?: number[];
  vehicleType: string;
  vehicleTypeId?: number;
  latitude?: number | null;
  longitude?: number | null;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  todayDeliveries: number;
  rating?: number;
}

export interface CourierAssignmentOtp {
  shipmentId: number;
  courierId: number;
  expiresAtUtc: string;
  maskedCourierPhone: string;
  maskedShipmentBarcode?: string;
  validationMessages: string[];
  otpCode?: string;
}

export interface DispatchAlert {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  title: string;
  detail: string;
}

export interface DeliveryAssignment {
  orderId: number;
  orderNumber: string;
  courierId?: number;
  courierName?: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime: number; // in minutes
  distance: number; // in km
  packageWeight: number;
  status: string;
}

export interface HubPackage {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  senderName: string;
  recipientName: string;
  recipientAddress: string;
  packageType: string;
  weight: number;
  dimensions?: string;
  currentHubId: number;
  currentHubName: string;
  destinationHubId?: number;
  destinationHubName?: string;
  receivedDate: Date;
  receivedBy: string;
  packageCondition: 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  conditionRemarks?: string;
  status: 'Received' | 'In Storage' | 'Ready for Transfer' | 'In Transit' | 'Delivered';
  transferDate?: Date;
  transferredBy?: string;
}

export interface HubTransfer {
  id: number;
  packageId: number;
  trackingNumber: string;
  fromHubId: number;
  fromHubName: string;
  toHubId: number;
  toHubName: string;
  transferDate: Date;
  transferredBy: string;
  receivedDate?: Date;
  receivedBy?: string;
  status: 'Pending' | 'In Transit' | 'Received' | 'Cancelled';
  courierAssigned?: string;
  estimatedArrival?: Date;
  notes?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface DeliveryQueueItem {
  id: number;
  orderNumber: string;
  trackingNumber?: string;
  customerName: string;
  customerPhone: string;
  consigneeName?: string;
  consigneePhone?: string;
  branchId?: number;
  branchName?: string;
  pickupAddress?: string;
  deliveryAddress: string;
  city: string;
  packageDescription: string;
  scheduledDate: Date;
  rescheduledAt?: Date;
  etaAt?: Date;
  timeSlot?: string;
  status: 'Scheduled' | 'Assigned' | 'In Progress' | 'Completed' | 'Failed' | 'Cancelled' | 'Returned';
  courierId?: number;
  courierName?: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  queueOrder?: number;
  vehicleType?: string;
  weight?: number;
  volume?: number;
  quantity?: number;
  pickupCoordinates?: {
    latitude: number;
    longitude: number;
  };
  dropoffCoordinates?: {
    latitude: number;
    longitude: number;
  };
  deliveryType: string;
  codAmount?: number;
  attempts: number;
  lastAttemptDate?: Date;
  notes?: string;
  isDelayed?: boolean;
  trafficCondition?: string;
  validationMessages?: string[];
  warnings?: string[];
  allowedActions?: {
    canAssign?: boolean;
    canUnassign?: boolean;
    canReschedule?: boolean;
    canUpdatePriority?: boolean;
    canUpdateStatus?: boolean;
    canNotify?: boolean;
  };
  availableStatuses?: { id: number; statusNameEn: string; statusNameAr: string }[];
}

export interface PickupRequest {
  id: number;
  requestNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  city: string;
  district?: string;
  packageType: string;
  estimatedWeight?: number;
  estimatedPackages?: number;
  preferredDate: Date;
  preferredTimeSlot: 'Morning (9-12)' | 'Afternoon (12-3)' | 'Evening (3-6)' | 'Anytime';
  requestDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Normal' | 'High';
  assignedCourierId?: number;
  assignedCourierName?: string;
  branchId?: number;
  branchName?: string;
  scheduledDate?: Date;
  actualPickupDate?: Date;
  remarks?: string;
  rejectionReason?: string;
  specialInstructions?: string;
}

export interface Hub {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  managerName: string;
  capacity: number;
  currentLoad: number;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
}

export interface HubMonitoringStats {
  hubId: number;
  hubName: string;
  totalInbound: number;
  totalOutbound: number;
  currentCapacity: number;
  maxCapacity: number;
  capacityPercentage: number;
}

export interface HubException {
  shipmentId: number;
  shipmentBarcode: string;
  conditionName?: string;
  failReasonName?: string;
  note?: string;
  timestamp: Date;
}

export interface RespOptimizeRoute {
  optimizedOrder: number[];
  polylineCoords: string;
}

export interface DelayAlert {
  courierId: number;
  shipmentId: number;
  message: string;
  timestamp: string | Date;
}

export interface TopCorporateCustomer {
  customerId: number;
  companyName: string;
  shipmentVolume: number;
}

export interface CustomerSatisfactionStats {
  averageRating: number;
  totalReviews: number;
}

export interface ComplaintStatistics {
  openTickets: number;
  resolvedTickets: number;
  slaBreachedTickets: number;
}

export interface ChatManagementActivity {
  activeConversations: number;
  averageResponseTimeMinutes: number;
}

export interface CustomerServiceMetrics {
  topCorporateCustomers: TopCorporateCustomer[];
  customerSatisfaction: CustomerSatisfactionStats;
  complaintStatistics: ComplaintStatistics;
  chatActivity: ChatManagementActivity;
}
