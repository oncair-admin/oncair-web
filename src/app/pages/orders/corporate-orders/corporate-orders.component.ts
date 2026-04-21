import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { OrdersService } from 'src/app/services/orders.service';
import { CorporateAccount } from 'src/app/models/order.models';

@Component({
  selector: 'app-corporate-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './corporate-orders.component.html',
  styleUrls: ['./corporate-orders.component.scss']
})
export class CorporateOrdersComponent implements OnInit {
  accounts: CorporateAccount[] = [];
  selectedFile: File | null = null;
  loading = false;
  uploadStatus = '';

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadCorporateAccounts();
  }

  loadCorporateAccounts(): void {
    this.loading = true;
    this.ordersService.getCorporateAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadCSV(): void {
    if (!this.selectedFile) {
      alert('Please select a file first');
      return;
    }

    this.loading = true;
    this.uploadStatus = 'Processing file...';

    // Simulate file processing
    setTimeout(() => {
      this.uploadStatus = 'File uploaded successfully! 10 orders created.';
      this.loading = false;
      this.selectedFile = null;
    }, 2000);
  }

  downloadTemplate(): void {
    const csvContent = 'Customer Name,Customer Phone,Recipient Name,Recipient Phone,Recipient Address,City,Package Description,Weight,Value,Delivery Type,Payment Method\n' +
      'Ahmed Mohamed,01012345678,Hassan Ali,01098765432,123 Street Cairo,Cairo,Electronics,0.5,5000,Express,Cash on Delivery\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_order_template.csv';
    link.click();
  }
}