import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ShipmentsService } from 'src/app/services/shipments.service';
import {
  ShipmentListItem,
  CourierShipmentItem,
  ShipmentStatus,
  GetCourierShipmentsRequest
} from 'src/app/models/shipment.models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-all-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule],
  templateUrl: './all-shipments.component.html',
  styleUrls: ['./all-shipments.component.scss']
})
export class AllShipmentsComponent implements OnInit {
  shipments: (ShipmentListItem | CourierShipmentItem)[] = [];
  statuses: ShipmentStatus[] = [];
  loading = false;

  selectedStatusId = 0;
  barcodeSearch = '';

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(
    private shipmentsService: ShipmentsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStatuses();
    this.loadShipments();
  }

  loadStatuses(): void {
    this.shipmentsService.getShipmentStatuses().subscribe({
      next: (statuses) => {
        this.statuses = statuses;
      },
      error: (error) => {
        console.error('Error loading statuses:', error);
      }
    });
  }

  loadShipments(): void {
    this.loading = true;

    const request: GetCourierShipmentsRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      statusId: this.selectedStatusId,
      serviceType: 0,
      courierId: 0
    };

    this.shipmentsService.getAllShipmentsForCourier(request).subscribe({
      next: (response) => {
        this.shipments = response.items;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shipments:', error);
        this.loading = false;
        this.showError('Failed to load shipments');
      }
    });
  }

  searchByBarcode(): void {
    if (!this.barcodeSearch.trim()) {
      this.loadShipments();
      return;
    }

    this.loading = true;
    this.shipmentsService.getShipmentByBarcode(this.barcodeSearch.trim()).subscribe({
      next: (response) => {
        this.shipments = response.items;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching shipment:', error);
        this.loading = false;
        this.showError('Shipment not found');
      }
    });
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.barcodeSearch = '';
    this.loadShipments();
  }

  clearFilters(): void {
    this.selectedStatusId = 0;
    this.barcodeSearch = '';
    this.currentPage = 1;
    this.loadShipments();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadShipments();
    }
  }

  viewShipment(shipmentId: number): void {
    this.router.navigate(['/dashboard/shipments', shipmentId]);
  }

  cancelShipment(shipment: ShipmentListItem | CourierShipmentItem): void {
    const note = prompt('Enter cancellation reason:');
    if (note !== null) {
      this.shipmentsService.cancelShipment(shipment.shipmentId, note).subscribe({
        next: (success) => {
          if (success) {
            this.showSuccess('Shipment cancelled successfully');
            this.loadShipments();
          }
        },
        error: (error) => {
          console.error('Error cancelling shipment:', error);
          this.showError('Failed to cancel shipment');
        }
      });
    }
  }

  returnShipment(shipment: ShipmentListItem | CourierShipmentItem): void {
    if (confirm('Are you sure you want to return this shipment?')) {
      this.shipmentsService.returnShipment(shipment.shipmentId).subscribe({
        next: (success) => {
          if (success) {
            this.showSuccess('Return requested successfully');
            this.loadShipments();
          }
        },
        error: (error) => {
          console.error('Error returning shipment:', error);
          this.showError('Failed to request return');
        }
      });
    }
  }

  getShipmentAmount(shipment: ShipmentListItem | CourierShipmentItem): number {
    return 'total' in shipment ? shipment.total : shipment.totalEgp;
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

  get paginationRange(): number[] {
    const range: number[] = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }
}
