/* eslint-disable @angular-eslint/prefer-inject */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CorporatesService } from '../../../services/corporates.service';
import { Company, CorporateAuditEntry, CorporateRole } from '../../../models/corporate.models';

@Component({
  selector: 'app-corporate-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './corporate-detail.component.html',
  styleUrls: ['./corporate-detail.component.scss'],
})
export class CorporateDetailComponent implements OnInit {
  companyId!: number;
  company?: Company;
  roles: CorporateRole[] = [];
  auditTrail: CorporateAuditEntry[] = [];
  loading = false;
  errorMessage = '';
  rejectionReason = '';
  infoMessage = '';

  constructor(
    private route: ActivatedRoute,
    private corporatesService: CorporatesService
  ) {}

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.corporatesService.getCompanyById(this.companyId).subscribe({
      next: (company) => {
        this.company = company;
        this.loadSupportingData();
      },
      error: (error: unknown) => {
        this.loading = false;
        this.errorMessage = (error as Error).message || 'Failed to load corporate request';
      },
    });
  }

  approve(): void {
    this.corporatesService.approveCompany(this.companyId).subscribe({
      next: () => this.load(),
      error: (error: unknown) => (this.errorMessage = (error as Error).message || 'Failed to approve request'),
    });
  }

  reject(): void {
    if (!this.rejectionReason.trim()) {
      this.errorMessage = 'Rejection reason is required';
      return;
    }

    this.corporatesService.rejectCompany(this.companyId, this.rejectionReason).subscribe({
      next: () => this.load(),
      error: (error: unknown) => (this.errorMessage = (error as Error).message || 'Failed to reject request'),
    });
  }

  requestInfo(): void {
    if (!this.infoMessage.trim()) {
      this.errorMessage = 'Request info message is required';
      return;
    }

    this.corporatesService
      .requestCorporateInfo({ companyId: this.companyId, message: this.infoMessage, actor: 'Admin' })
      .subscribe({
        next: () => this.load(),
        error: (error: unknown) =>
          (this.errorMessage = (error as Error).message || 'Failed to request more information'),
      });
  }

  saveRole(role: CorporateRole): void {
    this.corporatesService
      .updateCorporatePermissions({
        companyId: this.companyId,
        roleName: role.roleName,
        canCreateShipments: role.canCreateShipments,
        canTrackShipments: role.canTrackShipments,
        canViewBilling: role.canViewBilling,
        canViewReports: role.canViewReports,
        actor: 'Admin',
      })
      .subscribe({
        next: () => this.loadSupportingData(),
        error: (error: unknown) => (this.errorMessage = (error as Error).message || 'Failed to update permissions'),
      });
  }

  statusLabel(status?: number): string {
    if (status === 2) return 'Approved';
    if (status === 3) return 'Rejected';
    return 'Pending';
  }

  private loadSupportingData(): void {
    this.corporatesService.getCorporateRoles(this.companyId).subscribe({
      next: (roles) => (this.roles = roles),
      error: () => (this.roles = []),
    });

    this.corporatesService.getCorporateAuditTrail(this.companyId).subscribe({
      next: (auditTrail) => {
        this.auditTrail = auditTrail;
        this.loading = false;
      },
      error: () => {
        this.auditTrail = [];
        this.loading = false;
      },
    });
  }
}
