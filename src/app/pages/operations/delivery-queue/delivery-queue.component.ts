import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService } from 'src/app/services/operations.service';
import { DeliveryQueueItem, Courier } from 'src/app/models/operations.models';

@Component({
  selector: 'app-delivery-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './delivery-queue.component.html',
  styleUrls: ['./delivery-queue.component.scss']
})
export class DeliveryQueueComponent implements OnInit {
  private operationsService = inject(OperationsService);

  deliveries: DeliveryQueueItem[] = [];
  filteredDeliveries: DeliveryQueueItem[] = [];
  couriers: Courier[] = [];
  selectedDeliveries = new Set<number>();
  loading = false;
  
  selectedStatus = 'All';
  selectedPriority = 'All';
  searchTerm = '';
  
  statusOptions = ['All', 'Scheduled', 'Assigned', 'In Progress', 'Completed', 'Failed'];
  priorityOptions = ['All', 'Low', 'Normal', 'High', 'Urgent'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.operationsService.getDeliveryQueue().subscribe({
      next: (deliveries) => {
        this.deliveries = deliveries;
        this.filteredDeliveries = deliveries;
        this.loading = false;
      }
    });

    this.operationsService.getCouriers().subscribe({
      next: (couriers) => {
        this.couriers = couriers.filter(c => c.status === 'Available' || c.status === 'Busy');
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.deliveries];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.orderNumber.toLowerCase().includes(search) ||
        d.customerName.toLowerCase().includes(search) ||
        d.customerPhone.includes(search)
      );
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(d => d.status === this.selectedStatus);
    }

    if (this.selectedPriority !== 'All') {
      filtered = filtered.filter(d => d.priority === this.selectedPriority);
    }

    this.filteredDeliveries = filtered;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Scheduled': 'bg-info',
      'Assigned': 'bg-primary',
      'In Progress': 'bg-warning',
      'Completed': 'bg-success',
      'Failed': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'Low': 'bg-secondary',
      'Normal': 'bg-info',
      'High': 'bg-warning',
      'Urgent': 'bg-danger'
    };
    return classes[priority] || 'bg-secondary';
  }

  toggleSelection(deliveryId: number): void {
    if (this.selectedDeliveries.has(deliveryId)) {
      this.selectedDeliveries.delete(deliveryId);
    } else {
      this.selectedDeliveries.add(deliveryId);
    }
  }

  bulkAssignCourier(): void {
    if (this.selectedDeliveries.size === 0) {
      alert('Please select deliveries first');
      return;
    }
    
    const courierId = prompt('Enter courier ID:');
    if (courierId) {
      this.selectedDeliveries.forEach(deliveryId => {
        this.operationsService.assignCourierToDelivery(deliveryId, parseInt(courierId)).subscribe();
      });
      setTimeout(() => this.loadData(), 500);
      this.selectedDeliveries.clear();
    }
  }
}
