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
