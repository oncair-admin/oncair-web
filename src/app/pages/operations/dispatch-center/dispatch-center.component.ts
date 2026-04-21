import { Component, OnInit } from '@angular/core';
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
  couriers: Courier[] = [];
  hubPackages: HubPackage[] = [];
  hubs: Hub[] = [];
  loading = false;
  selectedView: 'courier' | 'hub' = 'courier';
  
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
  transferredBy = 'Current User';

  constructor(private operationsService: OperationsService) {}

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

    this.operationsService.getHubPackages().subscribe({
      next: (packages) => {
        this.hubPackages = packages;
      }
    });

    this.operationsService.getHubs().subscribe({
      next: (hubs) => {
        this.hubs = hubs;
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
      receivedDate: new Date(),
      receivedBy: 'Current User',
      currentHubId: 1,
      currentHubName: 'Cairo Hub'
    };
  }

  closeReceivingForm(): void {
    this.showReceivingForm = false;
  }

  submitReceiving(): void {
    this.operationsService.receivePackageAtHub(this.receivingPackage).subscribe({
      next: (response) => {
        if (response.succeeded) {
          alert('Package received successfully');
          this.closeReceivingForm();
          this.loadData();
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
  }

  submitTransfer(): void {
    if (this.transferPackageId && this.transferToHubId) {
      const toHub = this.hubs.find(h => h.id === this.transferToHubId);
      if (toHub) {
        this.operationsService.transferPackage(
          this.transferPackageId,
          this.transferToHubId,
          toHub.name,
          this.transferredBy
        ).subscribe({
          next: (response) => {
            if (response.succeeded) {
              alert('Transfer initiated successfully');
              this.closeTransferForm();
              this.loadData();
            }
          }
        });
      }
    }
  }
}