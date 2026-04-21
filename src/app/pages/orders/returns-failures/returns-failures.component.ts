import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OrdersService } from 'src/app/services/orders.service';
import { ReturnDelivery } from 'src/app/models/order.models';

@Component({
  selector: 'app-returns-failures',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './returns-failures.component.html',
  styleUrls: ['./returns-failures.component.scss']
})
export class ReturnsFailuresComponent implements OnInit {
  returns: ReturnDelivery[] = [];
  filteredReturns: ReturnDelivery[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = 'All';

  statusOptions = ['All', 'Pending', 'Approved', 'Rejected', 'Reattempt Scheduled', 'Refunded'];

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.loading = true;
    this.ordersService.getReturnDeliveries().subscribe({
      next: (returns) => {
        this.returns = returns;
        this.filteredReturns = returns;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading returns:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.returns];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ret =>
        ret.orderNumber.toLowerCase().includes(search) ||
        ret.customerName.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(ret => ret.returnStatus === this.selectedStatus);
    }

    this.filteredReturns = filtered;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'Pending': 'bg-warning',
      'Approved': 'bg-info',
      'Rejected': 'bg-danger',
      'Reattempt Scheduled': 'bg-primary',
      'Refunded': 'bg-success'
    };
    return statusClasses[status] || 'bg-secondary';
  }
}