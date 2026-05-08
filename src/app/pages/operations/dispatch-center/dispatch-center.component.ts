import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService } from 'src/app/services/operations.service';
import { Courier, HubPackage, Hub } from 'src/app/models/operations.models';

@Component({
  selector: 'app-dispatch-center',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './dispatch-center.component.html',
  styleUrls: ['./dispatch-center.component.scss']
})
export class DispatchCenterComponent implements OnInit {
  private operationsService = inject(OperationsService);
  couriers: Courier[] = [];
  hubPackages: HubPackage[] = [];
  hubs: Hub[] = [];
  loading = false;
  selectedView: 'courier' | 'hub' = 'courier';
  selectedHubId: number | null = null;
  
  // Hub receiving form
  showReceivingForm = false;
  receivingPackage: Partial<HubPackage> = {
    packageCondition: 'Good',
    status: 'Received'
  };
  
  // Hub transfer form
  showTransferForm = false;
  transferPackageId: number | null = null;
  transferToHubId: number | null = null;
  transferNote = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.operationsService.getCouriers().subscribe({
      next: (couriers) => {
        this.couriers = couriers;
        this.loading = false;
      }
    });

    this.operationsService.getHubs().subscribe({
      next: (hubs) => {
        this.hubs = hubs;
        if (!this.selectedHubId && hubs.length > 0) {
          this.selectedHubId = hubs[0].id;
        }
        this.loadHubPackages();
      }
    });
  }

  loadHubPackages(): void {
    if (!this.selectedHubId) {
      this.hubPackages = [];
      return;
    }

    this.operationsService.getHubPackages(this.selectedHubId).subscribe({
      next: (packages) => {
        this.hubPackages = packages;
      }
    });
  }

  getCourierStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Available': 'bg-success',
      'Busy': 'bg-warning',
      'On Break': 'bg-info',
      'Offline': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getPackageConditionClass(condition: string): string {
    const classes: Record<string, string> = {
      'Excellent': 'bg-success',
      'Good': 'bg-info',
      'Fair': 'bg-warning',
      'Damaged': 'bg-danger'
    };
    return classes[condition] || 'bg-secondary';
  }

  updateCourierStatus(courierId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as 'Available' | 'Busy' | 'On Break' | 'Offline';
    
    this.operationsService.updateCourierStatus(courierId, status).subscribe({
      next: (response) => {
        if (response.succeeded) {
          console.log('Status updated');
        }
      }
    });
  }

  openReceivingForm(): void {
    this.showReceivingForm = true;
    this.receivingPackage = {
      packageCondition: 'Good',
      status: 'Received',
      currentHubId: this.selectedHubId || undefined
    };
  }

  closeReceivingForm(): void {
    this.showReceivingForm = false;
  }

  submitReceiving(): void {
    if (!this.receivingPackage.currentHubId || !this.receivingPackage.packageCondition) {
      alert('Hub and package condition are required');
      return;
    }

    if (!this.receivingPackage.trackingNumber && !this.receivingPackage.orderNumber) {
      alert('Tracking number or order number is required');
      return;
    }

    this.operationsService.receivePackageAtHub(this.receivingPackage).subscribe({
      next: (response) => {
        if (response.succeeded) {
          alert('Package received successfully');
          this.closeReceivingForm();
          this.selectedHubId = this.receivingPackage.currentHubId || this.selectedHubId;
          this.loadHubPackages();
        }
      }
    });
  }

  openTransferForm(packageId: number): void {
    this.showTransferForm = true;
    this.transferPackageId = packageId;
  }

  closeTransferForm(): void {
    this.showTransferForm = false;
    this.transferPackageId = null;
    this.transferToHubId = null;
    this.transferNote = '';
  }

  submitTransfer(): void {
    if (this.transferPackageId && this.transferToHubId) {
      this.operationsService.transferPackage(
        this.transferPackageId,
        this.transferToHubId,
        this.transferNote
      ).subscribe({
        next: (response) => {
          if (response.succeeded) {
            alert('Transfer initiated successfully');
            this.closeTransferForm();
            this.loadHubPackages();
          }
        }
      });
    }
  }
}
