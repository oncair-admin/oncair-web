export interface OperationsDashboardStats {
  deliveriesCompleted: number;
  inTransitShipments: number;
  pendingPickups: number;
  failedDeliveries: number;
  todayRevenue: number;
  activeRoutes: number;
  activeCouriers: number;
  averageDeliveryTime: number;
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
  branchId: number;
  branchName: string;
  vehicleType: string;
  latitude?: number | null;
  longitude?: number | null;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  todayDeliveries: number;
  rating?: number;
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

export interface DeliveryQueueItem {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  packageDescription: string;
  scheduledDate: Date;
  timeSlot?: string;
  status: 'Scheduled' | 'Assigned' | 'In Progress' | 'Completed' | 'Failed';
  courierId?: number;
  courierName?: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  deliveryType: string;
  codAmount?: number;
  attempts: number;
  lastAttemptDate?: Date;
  notes?: string;
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
