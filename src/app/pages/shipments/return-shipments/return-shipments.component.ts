import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ShipmentsService } from 'src/app/services/shipments.service';
import {
  ShipmentListItem,
  GetAllReturnShipmentsRequest
} from 'src/app/models/shipment.models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-return-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule],
  templateUrl: './return-shipments.component.html',
  styleUrls: ['./return-shipments.component.scss']
})
export class ReturnShipmentsComponent implements OnInit {
  shipments: ShipmentListItem[] = [];
  loading = false;

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
    this.loadReturnShipments();
  }

  loadReturnShipments(): void {
    this.loading = true;

    const request: GetAllReturnShipmentsRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.shipmentsService.getAllReturnShipments(request).subscribe({
      next: (response) => {
        this.shipments = response.items;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading return shipments:', error);
        this.loading = false;
        this.showError('Failed to load return shipments');
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReturnShipments();
    }
  }

  viewShipment(shipmentId: number): void {
    this.router.navigate(['/dashboard/shipments', shipmentId]);
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

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }
}
