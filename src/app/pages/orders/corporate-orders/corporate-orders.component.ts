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

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const shipments: any[] = [];

      // Skip header (Customer Name,Customer Phone,Recipient Name,Recipient Phone,Recipient Address,City,Package Description,Weight,Value,Delivery Type,Payment Method)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length < 11) continue;

        // Basic mapping to AddShipmentRequest structure
        const shipment = {
          shipmentType: columns[9]?.toLowerCase().includes('express') ? 2 : 1,
          openPackageAllowed: true,
          consignee: columns[2],
          consigneePhone: columns[3],
          fromCityId: 1,
          fromAddress: 'Main Corporate Hub',
          fromLatitude: 30.0444,
          fromLongitude: 31.2357,
          toAddress: columns[4],
          toCityId: 1,
          consigneeAddress: columns[4],
          senderAddress: 'Main Corporate Hub',
          instructions: '',
          quantity: 1,
          toLatitude: 30.0444,
          toLongitude: 31.2357,
          kilometres: 5,
          deliveryMethod: 1,
          serviceType: 1,
          paymentMethod: columns[10]?.toLowerCase().includes('cash') ? 1 : 2,
          expiryMonthYear: '',
          cardHolderName: '',
          cardNuber: '',
          contentCategoryId: 1,
          contentCategoryText: columns[6],
          reqShipmentPaymentDetailsDto: {
            openPackageAllowed: true,
            isPickup: true,
            isReturn: false,
            isReplacment: false,
            fromCityId: 1,
            toCityId: 1,
            codAmount: parseFloat(columns[8]) || 0,
            insuranance: 0,
            lenght: 10,
            width: 10,
            height: 10,
            weight: parseFloat(columns[7]) || 1,
            isFragile: false,
            pickupFees: 0,
            zonalRate: 35,
            chargeableWeight: parseFloat(columns[7]) || 1,
            codCollectionFees: 0,
            goPlusService: 0,
            insurance: 0,
            fragile: 0,
            taxPercentage: 14,
            total: parseFloat(columns[8]) || 100,
            openPackageAllowedFees: 0
          }
        };
        shipments.push(shipment);
      }

      if (shipments.length === 0) {
        this.uploadStatus = 'No valid data found in file';
        this.loading = false;
        return;
      }

      this.ordersService.createBulkOrders(shipments).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.uploadStatus = `File uploaded successfully! ${response.data.length} orders created.`;
            this.loadCorporateAccounts();
          } else {
            this.uploadStatus = 'Error: ' + response.message;
          }
          this.loading = false;
          this.selectedFile = null;
        },
        error: (error) => {
          console.error('Error uploading bulk orders:', error);
          this.uploadStatus = 'Error uploading file';
          this.loading = false;
        }
      });
    };
    reader.onerror = () => {
      this.uploadStatus = 'Error reading file';
      this.loading = false;
    };
    reader.readAsText(this.selectedFile);
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

  addAccount(): void {
    alert('Feature coming soon: Add Corporate Account');
  }

  viewAccount(id: number): void {
    console.log('View corporate account:', id);
    alert('Viewing account details for ID: ' + id);
  }

  editAccount(id: number): void {
    console.log('Edit corporate account:', id);
    alert('Editing account for ID: ' + id);
  }
}