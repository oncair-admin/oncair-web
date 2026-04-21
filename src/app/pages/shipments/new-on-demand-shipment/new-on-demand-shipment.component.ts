import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ShipmentsService } from 'src/app/services/shipments.service';
import {
  LookupItem,
  OnDemandFees,
  GetOnDemandFeesRequest,
  AddOnDemandShipmentRequest
} from 'src/app/models/shipment.models';
import { MatSnackBar } from '@angular/material/snack-bar';

interface PackageSize {
  id: number;
  name: string;
  description: string;
}

interface TransportType {
  id: number;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-new-on-demand-shipment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './new-on-demand-shipment.component.html',
  styleUrls: ['./new-on-demand-shipment.component.scss']
})
export class NewOnDemandShipmentComponent implements OnInit {
  shipmentForm!: FormGroup;

  shipmentTypes: LookupItem[] = [];

  packageSizes: PackageSize[] = [
    { id: 1, name: 'Small', description: 'Up to 5kg, fits in a bag' },
    { id: 2, name: 'Medium', description: '5-15kg, fits in a box' },
    { id: 3, name: 'Large', description: '15-30kg, requires handling' },
    { id: 4, name: 'Extra Large', description: '30kg+, special delivery' }
  ];

  transportTypes: TransportType[] = [
    { id: 1, name: 'Motorcycle', icon: 'ti-motorbike' },
    { id: 2, name: 'Car', icon: 'ti-car' },
    { id: 3, name: 'Van', icon: 'ti-truck' }
  ];

  calculatedFees: OnDemandFees | null = null;
  calculatingFees = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private shipmentsService: ShipmentsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLookups();
  }

  initForm(): void {
    this.shipmentForm = this.fb.group({
      consignee: ['', [Validators.required, Validators.minLength(2)]],
      consigneePhone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      fromAddress: ['', Validators.required],
      toAddress: ['', Validators.required],
      sizeId: [null, Validators.required],
      transportType: [null, Validators.required],
      kilometres: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadLookups(): void {
    this.shipmentsService.getShipmentTypes().subscribe({
      next: (types) => this.shipmentTypes = types,
      error: (e: unknown) => console.error('Error loading shipment types:', e)
    });
  }

  calculateFees(): void {
    const val = this.shipmentForm.value;
    if (!val.sizeId || !val.transportType || val.kilometres < 0) {
      this.snackBar.open('Please fill package size, transport type and distance', 'Close', { duration: 3000 });
      return;
    }

    const request: GetOnDemandFeesRequest = {
      quantity: val.quantity ?? 1,
      sizeId: val.sizeId,
      kilometre: val.kilometres ?? 0
    };

    this.calculatingFees = true;
    this.shipmentsService.getOnDemandFees(request).subscribe({
      next: (fees) => {
        this.calculatedFees = fees;
        this.calculatingFees = false;
      },
      error: (e: unknown) => {
        console.error('Error calculating fees:', e);
        this.calculatingFees = false;
        this.snackBar.open('Failed to calculate fees', 'Close', { duration: 3000 });
      }
    });
  }

  submitShipment(): void {
    if (!this.shipmentForm.valid || !this.calculatedFees) {
      this.snackBar.open('Please complete the form and calculate fees', 'Close', { duration: 3000 });
      return;
    }

    const val = this.shipmentForm.value;
    const request: AddOnDemandShipmentRequest = {
      shipmentType: 1,
      consignee: val.consignee ?? '',
      consigneePhone: val.consigneePhone ?? '',
      fromAddress: val.fromAddress ?? '',
      fromLatitude: 0,
      fromLongitude: 0,
      toAddress: val.toAddress ?? '',
      toLatitude: 0,
      toLongitude: 0,
      kilometres: val.kilometres ?? 0,
      sizeId: val.sizeId ?? 0,
      transportType: val.transportType ?? 0,
      taxPercentage: 0,
      total: this.calculatedFees.total,
      expiryMonthYear: '',
      cardHolderName: '',
      cardNuber: ''
    };

    this.submitting = true;
    this.shipmentsService.addOnDemandShipment(request).subscribe({
      next: (id) => {
        this.submitting = false;
        this.snackBar.open('On-demand shipment created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/shipments', id]);
      },
      error: (e: unknown) => {
        console.error('Error creating shipment:', e);
        this.submitting = false;
        this.snackBar.open('Failed to create shipment', 'Close', { duration: 5000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/shipments/all']);
  }

  getPackageSizeName(id: number | null): string {
    if (!id) return '-';
    const size = this.packageSizes.find(s => s.id === id);
    return size?.name || '-';
  }

  getTransportTypeName(id: number | null): string {
    if (!id) return '-';
    const type = this.transportTypes.find(t => t.id === id);
    return type?.name || '-';
  }
}
