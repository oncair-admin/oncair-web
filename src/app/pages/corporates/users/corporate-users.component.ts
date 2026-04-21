/* eslint-disable @angular-eslint/prefer-inject */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CorporatesService } from '../../../services/corporates.service';
import { CompanyContact } from '../../../models/corporate.models';

@Component({
  selector: 'app-corporate-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule],
  templateUrl: './corporate-users.component.html',
  styleUrls: ['./corporate-users.component.scss'],
})
export class CorporateUsersComponent implements OnInit {
  corporateId!: number;
  contacts: CompanyContact[] = [];
  loading = false;
  showError = false;
  errorMessage = '';

  form = {
    fullName: '',
    jobTitle: 'Viewer',
    emailAddress: '',
    phoneNumber: '',
    alternateContactNumber: '',
    password: '',
    isPrimary: false,
    isActive: true,
  };

  editingContact: CompanyContact | null = null;
  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private corporatesService: CorporatesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((p) => {
      this.corporateId = +p['id'];
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.showError = false;
    this.corporatesService.getAllCompanyContacts(this.corporateId).subscribe({
      next: (list: CompanyContact[]) => {
        this.contacts = list;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = (error as Error).message || 'Failed to load contacts';
      },
    });
  }

  addContact(): void {
    if (this.isEditMode) {
      this.updateContact();
      return;
    }

    this.showError = false;
    this.errorMessage = '';

    if (!this.form.fullName || !this.form.emailAddress || !this.form.phoneNumber) {
      this.showError = true;
      this.errorMessage = 'Please fill Full Name, Email, and Phone Number';
      return;
    }

    if (!this.form.password || this.form.password.length < 8) {
      this.showError = true;
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.loading = true;
    this.corporatesService
      .createCompanyContact({
        id: 0,
        companyId: this.corporateId,
        fullName: this.form.fullName,
        jobTitle: this.form.jobTitle,
        emailAddress: this.form.emailAddress,
        phoneNumber: this.form.phoneNumber,
        alternateContactNumber: this.form.alternateContactNumber || '',
        password: this.form.password,
        isPrimary: this.form.isPrimary,
        isActive: this.form.isActive,
      })
      .subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (error: unknown) => {
          this.loading = false;
          this.showError = true;
          this.errorMessage = (error as Error).message || 'Failed to create contact';
        },
      });
  }

  editContact(contact: CompanyContact): void {
    this.editingContact = contact;
    this.isEditMode = true;
    this.showError = false;

    this.loading = true;
    this.corporatesService.getCompanyContactById(contact.id).subscribe({
      next: (c: CompanyContact) => {
        this.form.fullName = c.fullName;
        this.form.jobTitle = c.jobTitle || 'Viewer';
        this.form.emailAddress = c.emailAddress || '';
        this.form.phoneNumber = c.phoneNumber || '';
        this.form.alternateContactNumber = c.alternateContactNumber || '';
        this.form.password = '';
        this.form.isPrimary = c.isPrimary ?? false;
        this.form.isActive = c.isActive ?? true;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = (error as Error).message || 'Failed to load contact details';
      },
    });
  }

  updateContact(): void {
    if (!this.editingContact) return;

    this.showError = false;
    this.errorMessage = '';

    if (!this.form.fullName || !this.form.emailAddress || !this.form.phoneNumber) {
      this.showError = true;
      this.errorMessage = 'Please fill Full Name, Email, and Phone Number';
      return;
    }

    this.loading = true;
    this.corporatesService
      .updateCompanyContact({
        id: this.editingContact.id,
        companyId: this.corporateId,
        fullName: this.form.fullName,
        jobTitle: this.form.jobTitle,
        emailAddress: this.form.emailAddress,
        phoneNumber: this.form.phoneNumber,
        alternateContactNumber: this.form.alternateContactNumber || '',
        password: this.form.password || '',
        isPrimary: this.form.isPrimary,
        isActive: this.form.isActive,
      })
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.load();
        },
        error: (error: unknown) => {
          this.loading = false;
          this.showError = true;
          this.errorMessage = (error as Error).message || 'Failed to update contact';
        },
      });
  }

  deleteContact(id: number): void {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }
    this.showError = true;
    this.errorMessage = 'Delete functionality not available - API endpoint not provided';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingContact = null;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      fullName: '',
      jobTitle: 'Viewer',
      emailAddress: '',
      phoneNumber: '',
      alternateContactNumber: '',
      password: '',
      isPrimary: false,
      isActive: true,
    };
    this.isEditMode = false;
    this.editingContact = null;
  }
}
