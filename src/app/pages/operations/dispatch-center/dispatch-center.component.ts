import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService } from 'src/app/services/operations.service';
import {
  Courier,
  CourierAssignmentOtp,
  DeliveryQueueItem,
  DispatchAlert,
  Hub,
  HubMonitoringStats,
  HubPackage
} from 'src/app/models/operations.models';

type DispatchView = 'overview' | 'requests' | 'fleet' | 'hub';

@Component({
  selector: 'app-dispatch-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './dispatch-center.component.html',
  styleUrls: ['./dispatch-center.component.scss']
})
export class DispatchCenterComponent implements OnInit {
  private operationsService = inject(OperationsService);

  selectedView: DispatchView = 'overview';
  loading = false;
  actionMessage = '';
  actionError = '';

  couriers: Courier[] = [];
  requests: DeliveryQueueItem[] = [];
  hubPackages: HubPackage[] = [];
  hubs: Hub[] = [];
  selectedHubId: number | null = null;
  selectedHubStats?: HubMonitoringStats;
  alerts: DispatchAlert[] = [];
  searchTerm = '';

  showAssignmentModal = false;
  selectedRequest?: DeliveryQueueItem;
  selectedCourierId: number | null = null;
  preparedAssignment?: CourierAssignmentOtp;
  otpCode = '';
  assignmentLoading = false;

  showReceivingForm = false;
  receivingPackage: Partial<HubPackage> = {
    packageCondition: 'Good',
    status: 'Received'
  };

  showTransferForm = false;
  transferPackageId: number | null = null;
  transferToHubId: number | null = null;
  transferNote = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.actionError = '';

    this.operationsService.getCouriers().subscribe({
      next: (couriers) => {
        this.couriers = couriers;
        this.rebuildAlerts();
      },
      error: (error) => this.setError(error)
    });

    this.operationsService.getDeliveryQueue({ pageNumber: 1, pageSize: 25, search: this.searchTerm }).subscribe({
      next: (result) => {
        this.requests = result.items;
        this.rebuildAlerts();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.setError(error);
      }
    });

    this.operationsService.getHubs().subscribe({
      next: (hubs) => {
        this.hubs = hubs;
        if (!this.selectedHubId && hubs.length > 0) {
          this.selectedHubId = hubs[0].id;
        }
        this.loadHubPackages();
      },
      error: (error) => this.setError(error)
    });
  }

  searchRequests(): void {
    this.operationsService.getDeliveryQueue({ pageNumber: 1, pageSize: 25, search: this.searchTerm }).subscribe({
      next: (result) => {
        this.requests = result.items;
        this.rebuildAlerts();
      },
      error: (error) => this.setError(error)
    });
  }

  loadHubPackages(): void {
    if (!this.selectedHubId) {
      this.hubPackages = [];
      this.selectedHubStats = undefined;
      return;
    }

    this.operationsService.getHubPackages(this.selectedHubId).subscribe({
      next: (packages) => {
        this.hubPackages = packages;
      },
      error: (error) => this.setError(error)
    });

    this.operationsService.getHubMonitoringStats(this.selectedHubId).subscribe({
      next: (stats) => {
        this.selectedHubStats = stats;
        this.rebuildAlerts();
      },
      error: () => {
        this.selectedHubStats = undefined;
      }
    });
  }

  get availableCouriers(): Courier[] {
    return this.couriers.filter(courier => courier.status === 'Available' && courier.currentOrders < courier.maxCapacity);
  }

  get busyCouriers(): Courier[] {
    return this.couriers.filter(courier => courier.status === 'Busy');
  }

  get offlineCouriers(): Courier[] {
    return this.couriers.filter(courier => courier.status === 'Offline');
  }

  get overdueRequests(): DeliveryQueueItem[] {
    return this.requests.filter(request => request.isDelayed);
  }

  get activeRoutes(): number {
    return this.requests.filter(request => request.courierId && request.status !== 'Completed').length;
  }

  get courierLoadPercentage(): number {
    if (!this.couriers.length) {
      return 0;
    }

    const current = this.couriers.reduce((sum, courier) => sum + courier.currentOrders, 0);
    const max = this.couriers.reduce((sum, courier) => sum + courier.maxCapacity, 0);
    return max ? Math.round((current / max) * 100) : 0;
  }

  getCourierStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Available: 'bg-success',
      Busy: 'bg-warning text-dark',
      'On Break': 'bg-info text-dark',
      Offline: 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getAlertClass(severity: DispatchAlert['severity']): string {
    return {
      info: 'border-info',
      warning: 'border-warning',
      danger: 'border-danger'
    }[severity];
  }

  getPackageConditionClass(condition: string): string {
    const classes: Record<string, string> = {
      Excellent: 'bg-success',
      Good: 'bg-info text-dark',
      Fair: 'bg-warning text-dark',
      Damaged: 'bg-danger'
    };
    return classes[condition] || 'bg-secondary';
  }

  openAssignment(request: DeliveryQueueItem): void {
    this.selectedRequest = request;
    this.selectedCourierId = request.courierId || this.availableCouriers[0]?.id || null;
    this.preparedAssignment = undefined;
    this.otpCode = '';
    this.actionError = '';
    this.showAssignmentModal = true;
  }

  closeAssignment(): void {
    this.showAssignmentModal = false;
    this.selectedRequest = undefined;
    this.selectedCourierId = null;
    this.preparedAssignment = undefined;
    this.otpCode = '';
    this.assignmentLoading = false;
  }

  prepareAssignment(): void {
    if (!this.selectedRequest || !this.selectedCourierId) {
      this.actionError = 'Select a request and available courier.';
      return;
    }

    this.assignmentLoading = true;
    this.operationsService.prepareCourierAssignment(this.selectedRequest.id, this.selectedCourierId).subscribe({
      next: (assignment) => {
        this.preparedAssignment = assignment;
        this.assignmentLoading = false;
        this.actionMessage = 'Assignment OTP prepared.';
      },
      error: (error) => {
        this.assignmentLoading = false;
        this.setError(error);
      }
    });
  }

  confirmAssignment(): void {
    if (!this.selectedRequest || !this.selectedCourierId || !this.otpCode.trim()) {
      this.actionError = 'OTP is required to confirm assignment.';
      return;
    }

    this.assignmentLoading = true;
    this.operationsService.confirmCourierAssignment(this.selectedRequest.id, this.selectedCourierId, this.otpCode.trim()).subscribe({
      next: () => {
        this.assignmentLoading = false;
        this.actionMessage = 'Courier assignment confirmed.';
        this.closeAssignment();
        this.searchRequests();
        this.operationsService.getCouriers().subscribe(couriers => {
          this.couriers = couriers;
          this.rebuildAlerts();
        });
      },
      error: (error) => {
        this.assignmentLoading = false;
        this.setError(error);
      }
    });
  }

  unassign(request: DeliveryQueueItem): void {
    this.operationsService.unassignCourierFromDelivery(request.id).subscribe({
      next: () => {
        this.actionMessage = 'Courier unassigned.';
        this.searchRequests();
      },
      error: (error) => this.setError(error)
    });
  }

  updateStatus(request: DeliveryQueueItem, statusId: number): void {
    this.operationsService.updateDeliveryStatus(request.id, statusId, 'Updated by dispatch center').subscribe({
      next: () => {
        this.actionMessage = 'Shipment status updated.';
        this.searchRequests();
      },
      error: (error) => this.setError(error)
    });
  }

  notifyCustomer(request: DeliveryQueueItem, messageType = 'eta_update'): void {
    this.operationsService.sendCustomerDeliveryNotification(request.id, messageType).subscribe({
      next: () => this.actionMessage = 'Customer notification queued.',
      error: (error) => this.setError(error)
    });
  }

  suggestRoute(request: DeliveryQueueItem): void {
    this.operationsService.optimizeRoute([request.id]).subscribe({
      next: () => this.actionMessage = 'Route suggestion requested.',
      error: (error) => this.setError(error)
    });
  }

  callCourier(courier: Courier): void {
    if (courier.phone) {
      window.location.href = `tel:${courier.phone}`;
    }
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
      this.actionError = 'Hub and package condition are required.';
      return;
    }

    if (!this.receivingPackage.trackingNumber && !this.receivingPackage.orderNumber) {
      this.actionError = 'Tracking number or order number is required.';
      return;
    }

    this.operationsService.receivePackageAtHub(this.receivingPackage).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.actionMessage = 'Package received successfully.';
          this.closeReceivingForm();
          this.selectedHubId = this.receivingPackage.currentHubId || this.selectedHubId;
          this.loadHubPackages();
        }
      },
      error: (error) => this.setError(error)
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
    if (!this.transferPackageId || !this.transferToHubId) {
      return;
    }

    this.operationsService.transferPackage(
      this.transferPackageId,
      this.transferToHubId,
      this.transferNote
    ).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.actionMessage = 'Transfer initiated successfully.';
          this.closeTransferForm();
          this.loadHubPackages();
        }
      },
      error: (error) => this.setError(error)
    });
  }

  private rebuildAlerts(): void {
    const alerts: DispatchAlert[] = [];

    if (this.overdueRequests.length > 0) {
      alerts.push({
        id: 'overdue',
        severity: 'danger',
        title: 'Overdue shipments',
        detail: `${this.overdueRequests.length} shipment(s) are past ETA or marked delayed.`
      });
    }

    if (this.offlineCouriers.length > 0) {
      alerts.push({
        id: 'offline-couriers',
        severity: 'warning',
        title: 'Courier offline',
        detail: `${this.offlineCouriers.length} courier(s) are offline or missing an active shift.`
      });
    }

    if (this.selectedHubStats && this.selectedHubStats.capacityPercentage >= 85) {
      alerts.push({
        id: 'hub-capacity',
        severity: this.selectedHubStats.capacityPercentage >= 100 ? 'danger' : 'warning',
        title: 'Hub capacity',
        detail: `${this.selectedHubStats.hubName} is at ${this.selectedHubStats.capacityPercentage}% capacity.`
      });
    }

    this.alerts = alerts;
  }

  private setError(error: unknown): void {
    this.actionError = error instanceof Error ? error.message : 'Operation failed.';
  }
}
