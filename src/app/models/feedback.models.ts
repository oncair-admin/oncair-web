export interface CustomerFeedback {
  id: number;
  orderId: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  courierId: number;
  courierName: string;
  deliveryDate: Date;
  feedbackDate: Date;
  
  // Ratings (1-5)
  overallRating: number;
  courierRating: number;
  deliverySpeedRating: number;
  packageConditionRating: number;
  communicationRating: number;
  
  // Experience
  deliveryExperience: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor';
  wouldRecommend: boolean;
  
  // Comments
  positiveComments?: string;
  negativeComments?: string;
  suggestions?: string;
  
  // Status
  status: 'Pending' | 'Reviewed' | 'Addressed' | 'Closed';
  reviewedBy?: string;
  reviewedDate?: Date;
  adminResponse?: string;
  
  // Categories
  issueCategories?: FeedbackIssueCategory[];
  
  // Visibility
  isPublic: boolean;
  isVerified: boolean;
}

export type FeedbackIssueCategory = 
  | 'Late Delivery'
  | 'Damaged Item'
  | 'Wrong Address'
  | 'Unprofessional Behavior'
  | 'Poor Communication'
  | 'Package Lost'
  | 'Other';

export interface FeedbackStatistics {
  totalFeedbacks: number;
  averageOverallRating: number;
  averageCourierRating: number;
  averageDeliverySpeedRating: number;
  averagePackageConditionRating: number;
  averageCommunicationRating: number;
  recommendationRate: number;
  pendingFeedbacks: number;
  topCouriers: CourierPerformance[];
  issueBreakdown: IssueBreakdown[];
}

export interface CourierPerformance {
  courierId: number;
  courierName: string;
  totalDeliveries: number;
  averageRating: number;
  totalFeedbacks: number;
  recommendationRate: number;
  positivePercentage: number;
}

export interface IssueBreakdown {
  category: FeedbackIssueCategory;
  count: number;
  percentage: number;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  orderId?: number;
  orderNumber?: string;
  
  // Ticket Details
  category: TicketCategory;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  subject: string;
  description: string;
  
  // Status & Assignment
  status: 'Open' | 'In Progress' | 'Waiting on Customer' | 'Resolved' | 'Closed';
  assignedTo?: string;
  assignedDate?: Date;
  
  // SLA
  createdDate: Date;
  slaDeadline: Date;
  firstResponseDate?: Date;
  resolvedDate?: Date;
  closedDate?: Date;
  slaStatus: 'Within SLA' | 'At Risk' | 'Breached';
  
  // Escalation
  isEscalated: boolean;
  escalatedTo?: string;
  escalationDate?: Date;
  escalationReason?: string;
  
  // Resolution
  resolutionNotes?: string;
  resolutionBy?: string;
  customerSatisfaction?: number; // 1-5
  
  // Attachments & Messages
  attachments?: string[];
  messageCount: number;
  lastMessageDate?: Date;
  lastMessageBy?: string;
}

export type TicketCategory = 
  | 'Late Delivery'
  | 'Damaged Item'
  | 'Lost Package'
  | 'Wrong Delivery'
  | 'Courier Issue'
  | 'Payment Issue'
  | 'Tracking Issue'
  | 'General Inquiry'
  | 'Complaint'
  | 'Other';

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderType: 'Customer' | 'Support' | 'System';
  senderName: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

