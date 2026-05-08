// Company (from GetAllCompanies, GetCompanyById)
export interface Company {
  id: number;
  companyName: string;
  businessType: string;
  commercialRegistrationNumber: string;
  taxVatNumber: string;
  websiteUrl: string;
  companyEmail: string;
  companyPhoneNumber: string;
  companyAddress: string;
  isActive: boolean;
  status: number;
  rejectionReason?: string;
  submittedDate?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingCountry?: string;
  requestedServices?: string;
  monthlyShipmentEstimate?: number;
  paymentMethod?: string;
  isCaptchaVerified?: boolean;
  isEmailOtpVerified?: boolean;
  isPhoneOtpVerified?: boolean;
  corporateAccountId?: string;
  requestInfoMessage?: string;
}

// Company Contact (from GetAllCompanyContacts, GetCompanyContactById)
export interface CompanyContact {
  id: number;
  companyId: number;
  fullName: string;
  jobTitle: string;
  emailAddress: string;
  phoneNumber: string;
  alternateContactNumber: string;
  password: string;
  isPrimary: boolean;
  isActive: boolean;
}

// Request DTOs
export interface CreateCompanyRequest {
  companyName: string;
  phoneNumber: string;
  password: string;
}

export interface CorporateRegistrationRequest {
  companyName: string;
  businessType?: string;
  commercialRegistrationNumber?: string;
  taxVatNumber?: string;
  websiteUrl?: string;
  companyEmail: string;
  companyPhoneNumber: string;
  billingAddressLine1: string;
  billingAddressLine2?: string;
  billingCity: string;
  billingCountry: string;
  requestedServices: string[];
  monthlyShipmentEstimate: number;
  paymentMethod: string;
  contactFullName: string;
  contactJobTitle?: string;
  contactEmail: string;
  contactPhoneNumber: string;
  alternateContactNumber?: string;
  password: string;
  captchaToken: string;
  isCaptchaVerified: boolean;
  isEmailOtpVerified: boolean;
  isPhoneOtpVerified: boolean;
}

export interface CorporateRegistrationResponse {
  companyId: number;
  status: string;
}

export interface CorporateLoginRequest {
  userName: string;
  password: string;
  firebaseToken: string;
}

export interface CorporateLoginResponse {
  id: number;
  fullName: string;
  companyId: number;
  mobileNo?: string;
  token: string;
  expiryDate: string;
  refreshTokenDate: string;
  refreshExpiryDate: string;
  permissionId?: number;
}

export interface CorporateReviewActionRequest {
  companyId: number;
  reason?: string;
  message?: string;
  actor?: string;
}

export interface CorporateAuditEntry {
  id: number;
  companyId: number;
  action: string;
  details?: string;
  actor?: string;
  createdAt: string;
}

export interface CorporateRole {
  id: number;
  companyId: number;
  roleName: string;
  canCreateShipments: boolean;
  canTrackShipments: boolean;
  canViewBilling: boolean;
  canViewReports: boolean;
}

export interface CorporatePermissionUpdateRequest {
  companyId: number;
  roleName: string;
  canCreateShipments: boolean;
  canTrackShipments: boolean;
  canViewBilling: boolean;
  canViewReports: boolean;
  actor?: string;
}

export interface CorporateOtpRequest {
  destination: string;
  channel: 'email' | 'phone';
  otpCode?: string;
}

export interface UpdateCompanyRequest {
  id: number;
  companyName: string;
  businessType: string;
  commercialRegistrationNumber: string;
  taxVatNumber: string;
  websiteUrl: string;
  companyEmail: string;
  companyPhoneNumber: string;
  companyAddress: string;
  isActive: boolean;
}

export interface CreateCompanyContactRequest {
  id: number;
  companyId: number;
  fullName: string;
  jobTitle: string;
  emailAddress: string;
  phoneNumber: string;
  alternateContactNumber: string;
  password: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface UpdateCompanyContactRequest {
  id: number;
  companyId: number;
  fullName: string;
  jobTitle: string;
  emailAddress: string;
  phoneNumber: string;
  alternateContactNumber: string;
  password: string;
  isPrimary: boolean;
  isActive: boolean;
}
