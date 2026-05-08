import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService } from 'src/app/services/operations.service';
import { PickupRequest, Courier } from 'src/app/models/operations.models';

@Component({
  selector: 'app-pickup-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './pickup-requests.component.html',
  styleUrls: ['./pickup-requests.component.scss']
})
export class PickupRequestsComponent implements OnInit {
  private operationsService = inject(OperationsService);

  requests: PickupRequest[] = [];
  filteredRequests: PickupRequest[] = [];
  couriers: Courier[] = [];
  loading = false;
  
  selectedStatus = 'All';
  searchTerm = '';
  
  statusOptions = ['All', 'Pending', 'Approved', 'Rejected', 'Scheduled', 'Completed', 'Cancelled'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.operationsService.getPickupRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.filteredRequests = requests;
        this.loading = false;
      }
    });

    this.operationsService.getCouriers().subscribe({
      next: (couriers) => {
        this.couriers = couriers;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.requests];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.requestNumber.toLowerCase().includes(search) ||
        r.customerName.toLowerCase().includes(search) ||
        r.customerPhone.includes(search)
      );
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    this.filteredRequests = filtered;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Pending': 'bg-warning',
      'Approved': 'bg-info',
      'Rejected': 'bg-danger',
      'Scheduled': 'bg-primary',
      'Completed': 'bg-success',
      'Cancelled': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'Low': 'bg-secondary',
      'Normal': 'bg-info',
      'High': 'bg-warning'
    };
    return classes[priority] || 'bg-secondary';
  }

  approveRequest(requestId: number): void {
    this.operationsService.updatePickupRequest(requestId, { status: 'Approved' }).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.loadData();
        }
      }
    });
  }

  rejectRequest(requestId: number): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.operationsService.updatePickupRequest(requestId, {
        status: 'Rejected',
        rejectionReason: reason
      }).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.loadData();
          }
        }
      });
    }
  }

  rescheduleRequest(requestId: number): void {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    if (newDate) {
      this.operationsService.updatePickupRequest(requestId, {
        scheduledDate: new Date(newDate),
        status: 'Scheduled'
      }).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.loadData();
          }
        }
      });
    }
  }
}
