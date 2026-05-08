/* eslint-disable @angular-eslint/prefer-inject */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CorporatesService } from '../../../services/corporates.service';
import { CorporateRegistrationRequest } from '../../../models/corporate.models';

@Component({
  selector: 'app-corporate-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './corporate-register.component.html',
  styleUrls: ['./corporate-register.component.scss'],
})
export class CorporateRegisterComponent {
  loading = false;
  submitted = false;
  errorMessage = '';
  private readonly egyptianPhonePattern = /^(010\d{8}|\+2010\d{8})$/;
  selectedServices = new Set<string>(['OnDemand']);
  otpCode = '';
  otpVerified = false;

  form: CorporateRegistrationRequest = {
    companyName: '',
    businessType: 'E-commerce',
    commercialRegistrationNumber: '',
    taxVatNumber: '',
    websiteUrl: '',
    companyEmail: '',
    companyPhoneNumber: '',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: '',
    billingCountry: 'Egypt',
    requestedServices: ['OnDemand'],
    monthlyShipmentEstimate: 100,
    paymentMethod: 'Invoice',
    contactFullName: '',
    contactJobTitle: '',
    contactEmail: '',
    contactPhoneNumber: '',
    alternateContactNumber: '',
    password: '',
    captchaToken: '',
    isCaptchaVerified: false,
    isEmailOtpVerified: false,
    isPhoneOtpVerified: false,
  };

  constructor(private corporatesService: CorporatesService) {}

  toggleService(service: string, checked: boolean): void {
    if (checked) {
      this.selectedServices.add(service);
    } else {
      this.selectedServices.delete(service);
    }
    this.form.requestedServices = Array.from(this.selectedServices);
  }

  sendOtp(): void {
    this.errorMessage = '';
    if (!this.form.contactEmail) {
      this.errorMessage = 'Contact email is required before sending OTP';
      return;
    }

    this.corporatesService.sendCorporateOtp({ destination: this.form.contactEmail, channel: 'email' }).subscribe({
      error: (error: unknown) => {
        this.errorMessage = (error as Error).message || 'Failed to send OTP';
      },
    });
  }

  verifyOtp(): void {
    this.errorMessage = '';
    this.corporatesService
      .verifyCorporateOtp({ destination: this.form.contactEmail, channel: 'email', otpCode: this.otpCode })
      .subscribe({
        next: () => {
          this.otpVerified = true;
          this.form.isEmailOtpVerified = true;
        },
        error: (error: unknown) => {
          this.errorMessage = (error as Error).message || 'Failed to verify OTP';
        },
      });
  }

  markCaptchaVerified(): void {
    this.form.captchaToken = `local-${Date.now()}`;
    this.form.isCaptchaVerified = true;
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.isValid()) {
      this.errorMessage = 'Please complete required company, contact, OTP, and CAPTCHA fields';
      return;
    }

    const phoneError = this.getPhoneValidationError();
    if (phoneError) {
      this.errorMessage = phoneError;
      return;
    }

    this.loading = true;
    this.corporatesService.registerCorporate(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.errorMessage = (error as Error).message || 'Failed to submit registration';
      },
    });
  }

  private isValid(): boolean {
    return Boolean(
      this.form.companyName &&
        this.form.companyEmail &&
        this.form.companyPhoneNumber &&
        this.form.billingAddressLine1 &&
        this.form.billingCity &&
        this.form.billingCountry &&
        this.form.requestedServices.length &&
        this.form.paymentMethod &&
        this.form.contactFullName &&
        this.form.contactEmail &&
        this.form.contactPhoneNumber &&
        this.form.password &&
        this.form.isCaptchaVerified &&
        this.form.isEmailOtpVerified
    );
  }

  private getPhoneValidationError(): string {
    if (!this.isEgyptianPhone(this.form.companyPhoneNumber)) {
      return 'Company phone must be 01012345678 or +201012345678';
    }

    if (!this.isEgyptianPhone(this.form.contactPhoneNumber)) {
      return 'Contact phone must be 01012345678 or +201012345678';
    }

    if (this.form.alternateContactNumber && !this.isEgyptianPhone(this.form.alternateContactNumber)) {
      return 'Alternate phone must be 01012345678 or +201012345678';
    }

    return '';
  }

  private isEgyptianPhone(value: string): boolean {
    return this.egyptianPhonePattern.test(value.trim());
  }
}
