import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService, DeliveryQueueFilters } from 'src/app/services/operations.service';
import { CourierLocation, SignalRService } from 'src/app/services/signalr.service';
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
  private signalRService = inject(SignalRService);

  deliveries: DeliveryQueueItem[] = [];
  filteredDeliveries: DeliveryQueueItem[] = [];
  couriers: Courier[] = [];
  courierLocations: CourierLocation[] = [];
  selectedDeliveries = new Set<number>();
  loading = false;
  actionMessage = '';
  actionError = '';
  
  selectedBranch = 'All';
  selectedCourier = 'All';
  selectedVehicle = 'All';
  selectedStatus = 'All';
  selectedPriority = 'All';
  selectedBulkCourierId: number | null = null;
  searchTerm = '';
  
  statusOptions = ['All', 'Scheduled', 'Assigned', 'In Progress', 'Completed', 'Failed', 'Cancelled', 'Returned'];
  priorityOptions = ['All', 'Low', 'Normal', 'High', 'Urgent'];
  notificationOptions = ['eta_update', 'rescheduled', 'assigned', 'delivery_attempt'];
  statusUpdateOptions = [
    { label: 'Assigned', statusId: 2 },
    { label: 'Picked Up', statusId: 3 },
    { label: 'Out for Delivery', statusId: 4 },
    { label: 'Delivered', statusId: 7 },
    { label: 'Failed', statusId: 9 },
    { label: 'Returned', statusId: 10 },
    { label: 'Cancelled', statusId: 11 }
  ];

  get branchOptions(): Array<{ id: number; name: string }> {
    const branches = new Map<number, string>();
    this.deliveries.forEach(delivery => {
      if (delivery.branchId) {
        branches.set(delivery.branchId, delivery.branchName || `Branch #${delivery.branchId}`);
      }
    });
    this.couriers.forEach(courier => {
      if (courier.branchId) {
        branches.set(courier.branchId, courier.branchName || `Branch #${courier.branchId}`);
      }
    });
    return Array.from(branches, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }

  get vehicleOptions(): string[] {
    return Array.from(new Set([
      ...this.deliveries.map(delivery => delivery.vehicleType).filter(Boolean) as string[],
      ...this.couriers.map(courier => courier.vehicleType).filter(Boolean)
    ])).sort();
  }

  ngOnInit(): void {
    this.loadData();
    this.signalRService.courierLocations$.subscribe(locations => {
      this.courierLocations = locations;
    });
  }

  loadData(): void {
    this.loading = true;
    
    this.operationsService.getDeliveryQueue(this.buildServerFilters()).subscribe({
      next: (deliveries) => {
        this.deliveries = deliveries;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.actionError = error?.message || 'Unable to load delivery queue';
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
        (d.trackingNumber || '').toLowerCase().includes(search) ||
        d.customerName.toLowerCase().includes(search) ||
        d.customerPhone.includes(search) ||
        (d.consigneePhone || '').includes(search)
      );
    }

    if (this.selectedBranch !== 'All') {
      filtered = filtered.filter(d => d.branchId === Number(this.selectedBranch));
    }

    if (this.selectedCourier !== 'All') {
      const courierId = Number(this.selectedCourier);
      filtered = courierId === 0
        ? filtered.filter(d => !d.courierId)
        : filtered.filter(d => d.courierId === courierId);
    }

    if (this.selectedVehicle !== 'All') {
      filtered = filtered.filter(d => d.vehicleType === this.selectedVehicle);
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(d => d.status === this.selectedStatus);
    }

    if (this.selectedPriority !== 'All') {
      filtered = filtered.filter(d => d.priority === this.selectedPriority);
    }

    this.filteredDeliveries = filtered;
  }

  refreshWithFilters(): void {
    this.loadData();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Scheduled': 'bg-info',
      'Assigned': 'bg-primary',
      'In Progress': 'bg-warning',
      'Completed': 'bg-success',
      'Failed': 'bg-danger',
      'Cancelled': 'bg-secondary',
      'Returned': 'bg-dark'
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
      this.actionError = 'Select deliveries before assigning a courier.';
      return;
    }

    if (!this.selectedBulkCourierId) {
      this.actionError = 'Choose a courier for the selected deliveries.';
      return;
    }

    const requests = Array.from(this.selectedDeliveries)
      .map(deliveryId => this.operationsService.assignCourierToDelivery(deliveryId, this.selectedBulkCourierId!).subscribe({
        error: error => this.actionError = error?.message || 'Assignment failed'
      }));

    this.actionMessage = `${requests.length} assignment request(s) submitted.`;
    this.selectedDeliveries.clear();
    setTimeout(() => this.loadData(), 500);
  }

  assignCourier(delivery: DeliveryQueueItem, courierIdValue: string): void {
    const courierId = Number(courierIdValue);
    if (!courierId) return;

    this.runDeliveryAction(
      this.operationsService.assignCourierToDelivery(delivery.id, courierId),
      'Courier assigned.'
    );
  }

  unassignCourier(delivery: DeliveryQueueItem): void {
    this.runDeliveryAction(
      this.operationsService.unassignCourierFromDelivery(delivery.id),
      'Courier unassigned.'
    );
  }

  rescheduleDelivery(delivery: DeliveryQueueItem, value: string): void {
    if (!value) return;

    this.runDeliveryAction(
      this.operationsService.rescheduleDelivery(delivery.id, new Date(value)),
      'Delivery rescheduled.'
    );
  }

  updatePriority(delivery: DeliveryQueueItem, priority: DeliveryQueueItem['priority']): void {
    this.runDeliveryAction(
      this.operationsService.updateDeliveryPriority(delivery.id, priority),
      'Priority updated.'
    );
  }

  updateQueueOrder(delivery: DeliveryQueueItem, value: string): void {
    const queueOrder = Number(value);
    if (!Number.isFinite(queueOrder) || queueOrder < 1) return;

    this.runDeliveryAction(
      this.operationsService.reorderDeliveries([{ deliveryId: delivery.id, queueOrder }]),
      'Queue order updated.'
    );
  }

  updateStatus(delivery: DeliveryQueueItem, statusIdValue: string): void {
    const statusId = Number(statusIdValue);
    if (!statusId) return;

    this.runDeliveryAction(
      this.operationsService.updateDeliveryStatus(delivery.id, statusId),
      'Status updated.'
    );
  }

  notifyCustomer(delivery: DeliveryQueueItem, messageType: string): void {
    this.runDeliveryAction(
      this.operationsService.sendCustomerDeliveryNotification(delivery.id, messageType),
      'Customer notification queued.'
    );
  }

  selectAllVisible(checked: boolean): void {
    if (checked) {
      this.filteredDeliveries.forEach(delivery => this.selectedDeliveries.add(delivery.id));
    } else {
      this.filteredDeliveries.forEach(delivery => this.selectedDeliveries.delete(delivery.id));
    }
  }

  formatCoordinate(coordinate?: { latitude: number; longitude: number }): string {
    return coordinate ? `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}` : 'No coordinates';
  }

  getCourierLocation(delivery: DeliveryQueueItem): CourierLocation | undefined {
    if (!delivery.courierId) return undefined;
    return this.courierLocations.find(location => location.id === String(delivery.courierId));
  }

  private buildServerFilters(): DeliveryQueueFilters {
    return {
      branchId: this.selectedBranch,
      courierId: this.selectedCourier,
      vehicleType: this.selectedVehicle,
      status: this.selectedStatus,
      priority: this.selectedPriority,
      search: this.searchTerm
    };
  }

  private runDeliveryAction(action$: ReturnType<OperationsService['assignCourierToDelivery']>, successMessage: string): void {
    this.actionMessage = '';
    this.actionError = '';

    action$.subscribe({
      next: () => {
        this.actionMessage = successMessage;
        this.loadData();
      },
      error: (error) => {
        this.actionError = error?.message || 'Delivery queue action failed.';
      }
    });
  }
}
