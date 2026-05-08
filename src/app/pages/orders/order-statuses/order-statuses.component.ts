import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { OrdersService } from 'src/app/services/orders.service';
import { OrderStatistics, Order } from 'src/app/models/order.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-statuses',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './order-statuses.component.html',
  styleUrls: ['./order-statuses.component.scss']
})
export class OrderStatusesComponent implements OnInit {
  statistics: OrderStatistics | null = null;
  orders: Order[] = [];
  loading = false;

  statusCards = [
    { status: 'Pending', icon: 'clock', color: 'warning', count: 0 },
    { status: 'In Transit', icon: 'truck', color: 'primary', count: 0 },
    { status: 'Delivered', icon: 'check-circle', color: 'success', count: 0 },
    { status: 'Failed', icon: 'alert-circle', color: 'danger', count: 0 },
    { status: 'Returned', icon: 'arrow-back', color: 'secondary', count: 0 },
  ];

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadOrders();
  }

  loadStatistics(): void {
    this.loading = true;
    this.ordersService.getOrderStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.updateStatusCounts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
      }
    });
  }

  loadOrders(): void {
    this.ordersService.getAllOrders(1, 100).subscribe({
      next: (response) => {
        this.orders = response.items;
        this.updateStatusCounts();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  updateStatusCounts(): void {
    if (!this.statistics) return;
    
    this.statusCards[0].count = this.statistics.pendingOrders;
    this.statusCards[1].count = this.statistics.inTransitOrders;
    this.statusCards[2].count = this.statistics.deliveredOrders;
    this.statusCards[3].count = this.statistics.failedOrders;
    this.statusCards[4].count = this.statistics.returnedOrders;
  }

  filterByStatus(status: string): void {
    this.router.navigate(['/dashboard/orders/all'], { queryParams: { status } });
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders.filter(order => {
      if (status === 'Pending') return order.status === 'Pending' || order.status === 'Confirmed';
      if (status === 'In Transit') return order.status === 'In Transit' || order.status === 'Out for Delivery' || order.status === 'Picked Up';
      return order.status === status;
    }).slice(0, 5);
  }
}