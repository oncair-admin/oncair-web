import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ShipmentsService } from 'src/app/services/shipments.service';
import {
  ShipmentDetail,
  TrackingEvent,
  ShipmentStatus,
  CourierItem,
  AddShipmentTrackingRequest
} from 'src/app/models/shipment.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-shipment-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule, MatDialogModule],
  templateUrl: './shipment-details.component.html',
  styleUrls: ['./shipment-details.component.scss']
})
export class ShipmentDetailsComponent implements OnInit {
  shipmentId!: number;
  shipment: ShipmentDetail | null = null;
  trackingEvents: TrackingEvent[] = [];
  statuses: ShipmentStatus[] = [];
  loading = true;
  trackingLoading = false;

  showTrackingDialog = false;
  newStatusId = 0;
  trackingNote = '';
  updatingTracking = false;

  couriers: CourierItem[] = [];
  filteredCouriers: CourierItem[] = [];
  selectedCourierId = 0;
  courierDisplayName = '';
  couriersLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shipmentsService: ShipmentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.shipmentId = +params['id'];
      this.loadShipmentDetails();
      this.loadTrackingHistory();
      this.loadStatuses();
    });
  }

  loadShipmentDetails(): void {
    this.loading = true;
    this.shipmentsService.getShipmentById(this.shipmentId).subscribe({
      next: (shipment) => {
        this.shipment = shipment;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shipment:', error);
        this.loading = false;
        this.snackBar.open('Failed to load shipment details', 'Close', { duration: 5000 });
      }
    });
  }

  loadTrackingHistory(): void {
    this.trackingLoading = true;
    this.shipmentsService.getShipmentTracking(this.shipmentId).subscribe({
      next: (events) => {
        this.trackingEvents = Array.isArray(events) ? events : [];
        this.trackingLoading = false;
      },
      error: (error) => {
        console.error('Error loading tracking:', error);
        this.trackingLoading = false;
      }
    });
  }

  loadStatuses(): void {
    this.shipmentsService.getShipmentStatuses().subscribe({
      next: (statuses) => this.statuses = statuses,
      error: (e: unknown) => console.error('Error loading statuses:', e)
    });
  }

  requiresCourier(): boolean {
    return [2, 13].includes(this.newStatusId);
  }

  openTrackingDialog(): void {
    this.showTrackingDialog = true;
    this.newStatusId = 0;
    this.trackingNote = '';
    this.selectedCourierId = 0;
    this.courierDisplayName = '';
    this.loadCouriers();
  }

  closeTrackingDialog(): void {
    this.showTrackingDialog = false;
    this.selectedCourierId = 0;
    this.courierDisplayName = '';
  }

  loadCouriers(): void {
    this.couriersLoading = true;
    this.shipmentsService.getCouriersNames().subscribe({
      next: (list) => {
        this.couriers = Array.isArray(list) ? list : [];
        this.filteredCouriers = this.couriers;
        this.couriersLoading = false;
      },
      error: (err) => {
        console.error('Error loading couriers:', err);
        this.couriersLoading = false;
        this.snackBar.open('Failed to load couriers', 'Close', { duration: 5000 });
      }
    });
  }

  filterCouriers(value: string): void {
    const v = (value || '').trim().toLowerCase();
    if (!v) {
      this.filteredCouriers = this.couriers;
      return;
    }
    this.filteredCouriers = this.couriers.filter(
      c =>
        (c.nameEn || '').toLowerCase().includes(v) ||
        (c.nameAr || '').toLowerCase().includes(v)
    );
  }

  onCourierSelected(courier: CourierItem): void {
    this.selectedCourierId = courier.id;
    this.courierDisplayName = courier.nameEn || courier.nameAr || '';
  }

  onStatusChange(newStatusId: number | string): void {
    this.newStatusId = +newStatusId;
    if (!this.requiresCourier()) {
      this.selectedCourierId = 0;
      this.courierDisplayName = '';
    }
  }

  addTrackingUpdate(): void {
    if (!this.newStatusId) {
      this.snackBar.open('Please select a status', 'Close', { duration: 3000 });
      return;
    }
    if (this.requiresCourier() && !this.selectedCourierId) {
      this.snackBar.open('Please select a courier', 'Close', { duration: 3000 });
      return;
    }

    const userId = this.requiresCourier()
      ? this.selectedCourierId
      : parseInt(localStorage.getItem('userId') || '0', 10);
    const request: AddShipmentTrackingRequest = {
      shipmentId: this.shipmentId,
      statusId: this.newStatusId,
      userId,
      note: this.trackingNote || ''
    };

    this.updatingTracking = true;
    this.shipmentsService.addShipmentTracking(request).subscribe({
      next: (success) => {
        this.updatingTracking = false;
        this.closeTrackingDialog();
        this.snackBar.open('Tracking updated successfully', 'Close', { duration: 3000 });
        this.loadShipmentDetails();
        this.loadTrackingHistory();
      },
      error: (error) => {
        console.error('Error adding tracking:', error);
        this.updatingTracking = false;
        this.snackBar.open('Failed to update tracking', 'Close', { duration: 5000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/shipments/all']);
  }

  getShipmentTotal(shipment: ShipmentDetail): number {
    const value = shipment.totalEgp ?? shipment.total;
    return value != null ? Number(value) : 0;
  }

  getStatusClass(statusName: string): string {
    const statusClasses: Record<string, string> = {
      'Order Received': 'status-pending',
      'Preparing for Pickup': 'status-confirmed',
      'Out for Pickup': 'status-out',
      'Picked Up': 'status-picked',
      'In Transit': 'status-transit',
      'Arrived at Hub': 'status-transit',
      'Out for Delivery': 'status-out',
      'Delivered': 'status-delivered',
      'Delivery Failed': 'status-failed',
      'Return request': 'status-returned',
      'Cancelled Order': 'status-cancelled',
      'Returned to Sender': 'status-returned'
    };
    return statusClasses[statusName?.trim() || ''] || 'status-default';
  }
}
