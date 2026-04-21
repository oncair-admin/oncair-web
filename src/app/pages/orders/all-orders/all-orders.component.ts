import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OrdersService } from 'src/app/services/orders.service';
import { Order, OrderStatus, OrderFilters } from 'src/app/models/order.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.scss']
})
export class AllOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrders = new Set<number>();
  loading = false;
  
  // Filters
  filters: OrderFilters = {
    status: 'All',
    searchTerm: ''
  };
  
  statusOptions: (OrderStatus | 'All')[] = [
    'All', 'Pending', 'Confirmed', 'Picked Up', 'In Transit', 
    'Out for Delivery', 'Delivered', 'Delivery Attempted', 'Failed', 'Returned', 'Cancelled'
  ];
  
  deliveryTypes = ['All', 'Standard', 'Express', 'Same Day', 'Next Day'];
  paymentMethods = ['All', 'Cash on Delivery', 'Prepaid', 'Credit Card', 'Bank Transfer'];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  Math = Math;
  
  // Selected filters for display
  selectedStatus: OrderStatus | 'All' = 'All';
  selectedDeliveryType = 'All';
  selectedPaymentMethod = 'All';
  dateFrom = '';
  dateTo = '';
  
  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.loading = true;
    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.orders];
    
    // Search filter
    if (this.filters.searchTerm) {
      const search = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerPhone.includes(search) ||
        order.recipientName.toLowerCase().includes(search) ||
        order.recipientPhone.includes(search)
      );
    }
    
    // Status filter
    if (this.selectedStatus && this.selectedStatus !== 'All') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }
    
    // Delivery type filter
    if (this.selectedDeliveryType !== 'All') {
      filtered = filtered.filter(order => order.deliveryType === this.selectedDeliveryType);
    }
    
    // Payment method filter
    if (this.selectedPaymentMethod !== 'All') {
      filtered = filtered.filter(order => order.paymentMethod === this.selectedPaymentMethod);
    }
    
    // Date filters
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(order => new Date(order.createdDate) >= fromDate);
    }
    
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter(order => new Date(order.createdDate) <= toDate);
    }
    
    this.filteredOrders = filtered;
    this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
  }
  
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filters.searchTerm = input.value;
    this.applyFilters();
  }
  
  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }
  
  clearFilters(): void {
    this.filters.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedDeliveryType = 'All';
    this.selectedPaymentMethod = 'All';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }
  
  get paginatedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredOrders.slice(start, end);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getStatusClass(status: OrderStatus): string {
    const statusClasses: Record<OrderStatus, string> = {
      'Pending': 'bg-warning',
      'Confirmed': 'bg-info',
      'Picked Up': 'bg-primary',
      'In Transit': 'bg-primary',
      'Out for Delivery': 'bg-info',
      'Delivered': 'bg-success',
      'Delivery Attempted': 'bg-warning',
      'Failed': 'bg-danger',
      'Returned': 'bg-secondary',
      'Cancelled': 'bg-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  }
  
  toggleOrderSelection(orderId: number): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }
  
  toggleSelectAll(): void {
    if (this.selectedOrders.size === this.paginatedOrders.length) {
      this.selectedOrders.clear();
    } else {
      this.paginatedOrders.forEach(order => this.selectedOrders.add(order.id));
    }
  }
  
  get isAllSelected(): boolean {
    return this.paginatedOrders.length > 0 && 
           this.selectedOrders.size === this.paginatedOrders.length;
  }
  
  viewOrder(orderId: number): void {
    // Navigate to order detail page (to be implemented)
    console.log('View order:', orderId);
  }
  
  editOrder(orderId: number): void {
    this.router.navigate(['/dashboard/orders/edit', orderId]);
  }
  
  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.ordersService.deleteOrder(orderId).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.loadOrders();
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          alert('Error deleting order');
        }
      });
    }
  }
  
  exportOrders(): void {
    // Export logic (CSV/Excel)
    console.log('Exporting orders...');
    const dataStr = this.convertToCSV(this.filteredOrders);
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  private convertToCSV(orders: Order[]): string {
    const headers = ['Order Number', 'Customer', 'Phone', 'Status', 'Delivery Type', 'Payment Method', 'Amount', 'Created Date'];
    const rows = orders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.status,
      order.deliveryType,
      order.paymentMethod,
      order.codAmount || order.packageValue,
      new Date(order.createdDate).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  bulkUpdateStatus(): void {
    if (this.selectedOrders.size === 0) {
      alert('Please select orders first');
      return;
    }
    
    const newStatus = prompt('Enter new status:');
    if (newStatus) {
      console.log('Bulk update to status:', newStatus);
      // Implement bulk update logic
    }
  }
  
  assignCourier(): void {
    if (this.selectedOrders.size === 0) {
      alert('Please select orders first');
      return;
    }
    
    console.log('Assign courier for selected orders');
    // Implement courier assignment logic
  }
  
  printOrders(): void {
    if (this.selectedOrders.size === 0) {
      alert('Please select orders first');
      return;
    }
    
    console.log('Print selected orders');
    window.print();
  }
}