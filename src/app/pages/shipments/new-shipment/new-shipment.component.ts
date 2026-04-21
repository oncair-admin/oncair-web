import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ShipmentsService } from 'src/app/services/shipments.service';
import {
  City,
  LookupItem,
  CollectionFees,
  GetCollectionFeesRequest,
  AddShipmentRequest,
  ShipmentPaymentDetails
} from 'src/app/models/shipment.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

@Component({
  selector: 'app-new-shipment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './new-shipment.component.html',
  styleUrls: ['./new-shipment.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class NewShipmentComponent implements OnInit {
  senderReceiverForm!: FormGroup;
  packageForm!: FormGroup;
  serviceForm!: FormGroup;

  cities: City[] = [];
  shipmentTypes: LookupItem[] = [];
  deliveryMethods: LookupItem[] = [];
  serviceTypes: LookupItem[] = [];
  paymentMethods: LookupItem[] = [];
  contentCategories: LookupItem[] = [];

  calculatedFees: CollectionFees | null = null;
  calculatingFees = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private shipmentsService: ShipmentsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadLookups();
  }

  initForms(): void {
    this.senderReceiverForm = this.fb.group({
      consignee: ['', [Validators.required, Validators.minLength(2)]],
      consigneePhone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      fromCityId: [null, Validators.required],
      fromAddress: ['', Validators.required],
      senderAddress: ['', Validators.required],
      toCityId: [null, Validators.required],
      toAddress: ['', Validators.required],
      consigneeAddress: ['', Validators.required],
      instructions: ['']
    });

    this.packageForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      weight: [0.1, [Validators.required, Validators.min(0.1)]],
      length: [1, [Validators.required, Validators.min(1)]],
      width: [1, [Validators.required, Validators.min(1)]],
      height: [1, [Validators.required, Validators.min(1)]],
      contentCategoryId: [null, Validators.required],
      contentCategoryText: [''],
      codAmount: [0, Validators.min(0)],
      insurance: [0, Validators.min(0)],
      isFragile: [false],
      openPackageAllowed: [false]
    });

    this.serviceForm = this.fb.group({
      shipmentType: [null, Validators.required],
      deliveryMethod: [null, Validators.required],
      serviceType: [null, Validators.required],
      paymentMethod: [null, Validators.required],
      isPickup: [true],
      isReturn: [false],
      isReplacement: [false]
    });
  }

  loadLookups(): void {
    this.shipmentsService.getCities().subscribe({
      next: (cities) => this.cities = cities,
      error: (e: unknown) => console.error('Error loading cities:', e)
    });
    this.shipmentsService.getShipmentTypes().subscribe({
      next: (types) => this.shipmentTypes = types,
      error: (e: unknown) => console.error('Error loading shipment types:', e)
    });
    this.shipmentsService.getDeliveryMethods().subscribe({
      next: (methods) => this.deliveryMethods = methods,
      error: (e: unknown) => console.error('Error loading delivery methods:', e)
    });
    this.shipmentsService.getServiceTypes().subscribe({
      next: (types) => this.serviceTypes = types,
      error: (e: unknown) => console.error('Error loading service types:', e)
    });
    this.shipmentsService.getPaymentMethods().subscribe({
      next: (methods) => this.paymentMethods = methods,
      error: (e: unknown) => console.error('Error loading payment methods:', e)
    });
    this.shipmentsService.getContentCategories().subscribe({
      next: (categories) => this.contentCategories = categories,
      error: (e: unknown) => console.error('Error loading content categories:', e)
    });
  }


  getCityName(cityId: number | null): string {
    if (!cityId) return '-';
    const city = this.cities.find(c => c.id === cityId);
    return city?.name || '-';
  }

  getContentCategoryName(id: number | null): string {
    if (!id) return '-';
    const cat = this.contentCategories.find(c => c.id === id);
    return cat?.name || '-';
  }

  calculateFees(): void {
    const sr = this.senderReceiverForm.value;
    const pkg = this.packageForm.value;
    const svc = this.serviceForm.value;

    const request: GetCollectionFeesRequest = {
      openPackageAllowed: pkg.openPackageAllowed ?? false,
      isPickup: svc.isPickup ?? true,
      isReturn: svc.isReturn ?? false,
      isReplacment: svc.isReplacement ?? false,
      fromCityId: sr.fromCityId ?? 0,
      toCityId: sr.toCityId ?? 0,
      codAmount: pkg.codAmount ?? 0,
      insuranance: pkg.insurance ?? 0,
      lenght: pkg.length ?? 1,
      width: pkg.width ?? 1,
      height: pkg.height ?? 1,
      weight: pkg.weight ?? 0.1,
      isFragile: pkg.isFragile ?? false
    };

    this.calculatingFees = true;
    this.shipmentsService.getCollectionFees(request).subscribe({
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
    if (!this.calculatedFees || !this.senderReceiverForm.valid || !this.packageForm.valid || !this.serviceForm.valid) {
      this.snackBar.open('Please complete all steps and calculate fees', 'Close', { duration: 3000 });
      return;
    }

    const sr = this.senderReceiverForm.value;
    const pkg = this.packageForm.value;
    const svc = this.serviceForm.value;

    const paymentDetails: ShipmentPaymentDetails = {
      openPackageAllowed: pkg.openPackageAllowed ?? false,
      isPickup: svc.isPickup ?? true,
      isReturn: svc.isReturn ?? false,
      isReplacment: svc.isReplacement ?? false,
      fromCityId: sr.fromCityId ?? 0,
      toCityId: sr.toCityId ?? 0,
      codAmount: pkg.codAmount ?? 0,
      insuranance: pkg.insurance ?? 0,
      lenght: pkg.length ?? 1,
      width: pkg.width ?? 1,
      height: pkg.height ?? 1,
      weight: pkg.weight ?? 0.1,
      isFragile: pkg.isFragile ?? false,
      pickupFees: this.calculatedFees.pickupFees,
      zonalRate: this.calculatedFees.zonalRate,
      chargeableWeight: this.calculatedFees.chargeableWeight,
      codCollectionFees: this.calculatedFees.codCollectionFees,
      goPlusService: this.calculatedFees.goPlusService,
      insurance: this.calculatedFees.insurance,
      fragile: this.calculatedFees.fragile,
      taxPercentage: this.calculatedFees.taxPercentage,
      total: this.calculatedFees.total,
      openPackageAllowedFees: this.calculatedFees.openPackageAllowed
    };

    const request: AddShipmentRequest = {
      shipmentType: svc.shipmentType ?? 0,
      openPackageAllowed: pkg.openPackageAllowed ?? false,
      consignee: sr.consignee ?? '',
      consigneePhone: sr.consigneePhone ?? '',
      fromCityId: sr.fromCityId ?? 0,
      fromAddress: sr.fromAddress ?? '',
      fromLatitude: 0,
      fromLongitude: 0,
      toAddress: sr.toAddress ?? '',
      toCityId: sr.toCityId ?? 0,
      consigneeAddress: sr.consigneeAddress ?? '',
      senderAddress: sr.senderAddress ?? '',
      instructions: sr.instructions ?? '',
      quantity: pkg.quantity ?? 1,
      toLatitude: 0,
      toLongitude: 0,
      kilometres: 0,
      deliveryMethod: svc.deliveryMethod ?? 0,
      serviceType: svc.serviceType ?? 0,
      paymentMethod: svc.paymentMethod ?? 0,
      expiryMonthYear: '',
      cardHolderName: '',
      cardNuber: '',
      contentCategoryId: pkg.contentCategoryId ?? 0,
      contentCategoryText: pkg.contentCategoryText ?? '',
      reqShipmentPaymentDetailsDto: paymentDetails
    };

    this.submitting = true;
    this.shipmentsService.addShipment(request).subscribe({
      next: (id) => {
        this.submitting = false;
        this.snackBar.open('Shipment created successfully!', 'Close', { duration: 3000 });
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
}
