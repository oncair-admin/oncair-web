/* eslint-disable @angular-eslint/prefer-inject */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CorporatesService } from '../../../services/corporates.service';
import { Company, UpdateCompanyRequest } from '../../../models/corporate.models';

@Component({
  selector: 'app-corporates-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './corporates-list.component.html',
  styleUrls: ['./corporates-list.component.scss'],
})
export class CorporatesListComponent implements OnInit {
  corporates: Company[] = [];
  filtered: Company[] = [];
  loading = false;
  showError = false;
  errorMessage = '';

  // Create form: minimal fields
  createForm = {
    companyName: '',
    phoneNumber: '',
    password: '',
    contactFullName: '',
    contactJobTitle: '',
    contactEmail: '',
    contactPhone: '',
    contactAltPhone: '',
  };

  // Edit form: full UpdateCompany fields
  editForm = {
    companyName: '',
    businessType: 'Retail',
    commercialRegistrationNumber: '',
    taxVatNumber: '',
    websiteUrl: '',
    companyEmail: '',
    companyPhoneNumber: '',
    companyAddress: '',
    isActive: true,
  };

  searchTerm = '';
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  showCreate = false;
  editingCompany: Company | null = null;
  isEditMode = false;

  constructor(
    private corporatesService: CorporatesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  isValidEmail(email: string): boolean {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidEgyptianPhone(phone: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-+]/g, '');
    const phoneRegex = /^(?:(?:\+?20)?1[01256]\d{9}|01[01256]\d{8})$/;
    return phoneRegex.test(cleaned);
  }

  getEmailError(email: string, fieldName: string): string {
    if (!email) return '';
    return this.isValidEmail(email) ? '' : `Please enter a valid ${fieldName} email address`;
  }

  getPhoneError(phone: string): string {
    if (!phone) return '';
    return this.isValidEgyptianPhone(phone)
      ? ''
      : 'Please enter a valid Egyptian phone number (e.g., 01012345678 or +201012345678)';
  }

  load(): void {
    this.loading = true;
    this.showError = false;
    this.corporatesService.getAllCompanies().subscribe({
      next: (list: Company[]) => {
        this.corporates = list;
        this.applyFilters();
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = (error as Error).message || 'Failed to load corporates';
      },
    });
  }

  toggleCreate(): void {
    if (this.isEditMode) {
      this.cancelEdit();
    }
    this.showCreate = !this.showCreate;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingCompany = null;
    this.resetForms();
    this.showCreate = false;
  }

  editCorporate(company: Company): void {
    this.editingCompany = company;
    this.isEditMode = true;
    this.showCreate = true;
    this.showError = false;

    this.loading = true;
    this.corporatesService.getCompanyById(company.id).subscribe({
      next: (c: Company) => {
        this.editForm.companyName = c.companyName;
        this.editForm.businessType = c.businessType || 'Retail';
        this.editForm.commercialRegistrationNumber = c.commercialRegistrationNumber || '';
        this.editForm.taxVatNumber = c.taxVatNumber || '';
        this.editForm.websiteUrl = c.websiteUrl || '';
        this.editForm.companyEmail = c.companyEmail || '';
        this.editForm.companyPhoneNumber = c.companyPhoneNumber || '';
        this.editForm.companyAddress = c.companyAddress || '';
        this.editForm.isActive = c.isActive ?? true;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = (error as Error).message || 'Failed to load company details';
      },
    });
  }

  create(): void {
    if (this.isEditMode) {
      this.updateCorporate();
      return;
    }

    this.showError = false;
    this.errorMessage = '';

    if (!this.createForm.companyName || !this.createForm.phoneNumber) {
      this.showError = true;
      this.errorMessage = 'Please fill Company Name and Phone Number';
      return;
    }

    const hasContact =
      this.createForm.contactFullName && this.createForm.contactEmail && this.createForm.contactPhone;
    if (hasContact && !this.isValidEmail(this.createForm.contactEmail)) {
      this.showError = true;
      this.errorMessage = 'Please enter a valid contact person email address';
      return;
    }
    if (hasContact && !this.isValidEgyptianPhone(this.createForm.contactPhone)) {
      this.showError = true;
      this.errorMessage =
        'Please enter a valid Egyptian phone number for contact person (e.g., 01012345678 or +201012345678)';
      return;
    }

    if (!this.createForm.password || this.createForm.password.length < 8) {
      this.showError = true;
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.loading = true;

    this.corporatesService
      .createCompany({
        companyName: this.createForm.companyName,
        phoneNumber: this.createForm.phoneNumber,
        password: this.createForm.password,
      })
      .subscribe({
        next: () => {
          this.corporatesService.getAllCompanies().subscribe({
            next: (list: Company[]) => {
              this.corporates = list;
              this.applyFilters();
              const found = list.find(
                (c) =>
                  c.companyName === this.createForm.companyName &&
                  c.companyPhoneNumber === this.createForm.phoneNumber
              );
              if (found && hasContact) {
                this.corporatesService
                  .createCompanyContact({
                    id: 0,
                    companyId: found.id,
                    fullName: this.createForm.contactFullName,
                    jobTitle: this.createForm.contactJobTitle || '',
                    emailAddress: this.createForm.contactEmail,
                    phoneNumber: this.createForm.contactPhone,
                    alternateContactNumber: this.createForm.contactAltPhone || '',
                    password: this.createForm.password,
                    isPrimary: true,
                    isActive: true,
                  })
                  .subscribe({
                    next: () => {
                      this.loading = false;
                      this.showCreate = false;
                      this.resetForms();
                      this.load();
                    },
                    error: (error: unknown) => {
                      this.loading = false;
                      this.showError = true;
                      this.errorMessage =
                        (error as Error).message || 'Company created but failed to create contact person';
                      this.load();
                    },
                  });
              } else {
                this.loading = false;
                this.showCreate = false;
                this.resetForms();
                this.load();
              }
            },
            error: (error: unknown) => {
              this.loading = false;
              this.showError = true;
              this.errorMessage = (error as Error).message || 'Failed to refresh list';
            },
          });
        },
        error: (error: unknown) => {
          this.loading = false;
          this.showError = true;
          this.errorMessage = (error as Error).message || 'Failed to create company';
        },
      });
  }

  updateCorporate(): void {
    if (!this.editingCompany) return;

    this.showError = false;
    this.errorMessage = '';

    if (
      !this.editForm.companyName ||
      !this.editForm.companyPhoneNumber ||
      !this.editForm.companyAddress
    ) {
      this.showError = true;
      this.errorMessage = 'Please fill all mandatory Company Information fields';
      return;
    }

    if (this.editForm.companyEmail && !this.isValidEmail(this.editForm.companyEmail)) {
      this.showError = true;
      this.errorMessage = 'Please enter a valid company email address';
      return;
    }

    this.loading = true;

    const body: UpdateCompanyRequest = {
      id: this.editingCompany.id,
      companyName: this.editForm.companyName,
      businessType: this.editForm.businessType,
      commercialRegistrationNumber: this.editForm.commercialRegistrationNumber,
      taxVatNumber: this.editForm.taxVatNumber,
      websiteUrl: this.editForm.websiteUrl,
      companyEmail: this.editForm.companyEmail,
      companyPhoneNumber: this.editForm.companyPhoneNumber,
      companyAddress: this.editForm.companyAddress,
      isActive: this.editForm.isActive,
    };

    this.corporatesService.updateCompany(body).subscribe({
      next: () => {
        this.loading = false;
        this.cancelEdit();
        this.load();
      },
      error: (error: unknown) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = (error as Error).message || 'Failed to update company';
      },
    });
  }

  deleteCorporate(_id: number): void {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }
    this.showError = true;
    this.errorMessage = 'Delete functionality not available - API endpoint not provided';
  }

  resetForms(): void {
    this.createForm = {
      companyName: '',
      phoneNumber: '',
      password: '',
      contactFullName: '',
      contactJobTitle: '',
      contactEmail: '',
      contactPhone: '',
      contactAltPhone: '',
    };
    this.editForm = {
      companyName: '',
      businessType: 'Retail',
      commercialRegistrationNumber: '',
      taxVatNumber: '',
      websiteUrl: '',
      companyEmail: '',
      companyPhoneNumber: '',
      companyAddress: '',
      isActive: true,
    };
    this.isEditMode = false;
    this.editingCompany = null;
  }

  search(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filtered = this.corporates.filter((c) => {
      const matchesTerm =
        !term ||
        c.companyName.toLowerCase().includes(term) ||
        (c.businessType || '').toLowerCase().includes(term) ||
        (c.companyEmail || '').toLowerCase().includes(term) ||
        (c.companyPhoneNumber || '').toLowerCase().includes(term);
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'pending' && c.status === 1) ||
        (this.statusFilter === 'approved' && c.status === 2) ||
        (this.statusFilter === 'rejected' && c.status === 3);
      return matchesTerm && matchesStatus;
    });
  }

  setStatusFilter(status: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  statusLabel(company: Company): string {
    if (company.status === 2) return 'Approved';
    if (company.status === 3) return 'Rejected';
    return 'Pending';
  }

  viewCorporate(company: Company): void {
    this.router.navigate(['/dashboard/corporates', company.id]);
  }

  openUsers(company: Company): void {
    this.router.navigate(['/dashboard/corporates', company.id, 'users']);
  }
}
