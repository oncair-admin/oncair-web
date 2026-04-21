import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OrdersService } from 'src/app/services/orders.service';
import { Order } from 'src/app/models/order.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  order: Partial<Order> = {
    deliveryType: 'Standard',
    paymentMethod: 'Cash on Delivery',
    packageWeight: 0,
    packageValue: 0,
    shippingCost: 35,
    branchId: 1
  };
  
  loading = false;
  alert = 'd-none';
  alertMessage = '';
  
  deliveryTypes = ['Standard', 'Express', 'Same Day', 'Next Day'];
  paymentMethods = ['Cash on Delivery', 'Prepaid', 'Credit Card', 'Bank Transfer'];
  branches = [
    { id: 1, name: 'Cairo Main Branch' },
    { id: 2, name: 'Giza Branch' },
    { id: 3, name: 'Alexandria Branch' }
  ];
  
  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.calculateShipping();
  }
  
  calculateShipping(): void {
    // Simple shipping calculation based on delivery type
    const shippingRates: Record<string, number> = {
      'Standard': 35,
      'Express': 60,
      'Same Day': 100,
      'Next Day': 80
    };
    
    this.order.shippingCost = shippingRates[this.order.deliveryType || 'Standard'] || 35;
  }
  
  onDeliveryTypeChange(): void {
    this.calculateShipping();
  }
  
  submit(): void {
    // Validate required fields
    if (!this.order.customerName || !this.order.customerPhone ||
        !this.order.senderName || !this.order.senderPhone || !this.order.senderAddress ||
        !this.order.recipientName || !this.order.recipientPhone || !this.order.recipientAddress ||
        !this.order.recipientCity || !this.order.packageDescription) {
      this.alert = 'alert alert-danger';
      this.alertMessage = 'Please fill all required fields';
      return;
    }
    
    // Set COD amount if payment method is COD
    if (this.order.paymentMethod === 'Cash on Delivery') {
      this.order.codAmount = this.order.packageValue;
    }
    
    this.loading = true;
    this.ordersService.createOrder(this.order as Order).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.alert = 'alert alert-success';
          this.alertMessage = 'Order created successfully!';
          setTimeout(() => {
            this.router.navigate(['/dashboard/orders/all']);
          }, 1500);
        } else {
          this.alert = 'alert alert-danger';
          this.alertMessage = response.message;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.alert = 'alert alert-danger';
        this.alertMessage = 'Error creating order';
        this.loading = false;
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/dashboard/orders/all']);
  }
}