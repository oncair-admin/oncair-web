import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService, DeliveryQueueFilters } from 'src/app/services/operations.service';
import { CourierLocation, SignalRService } from 'src/app/services/signalr.service';
import { DeliveryQueueItem, Courier } from 'src/app/models/operations.models';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-delivery-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './delivery-queue.component.html',
  styleUrls: ['./delivery-queue.component.scss']
})
export class DeliveryQueueComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapElement') mapElement!: ElementRef;
  private operationsService = inject(OperationsService);
  private signalRService = inject(SignalRService);

  private map?: L.Map;
  private markers = L.markerClusterGroup();
  private shipmentMarkers = new Map<number, L.Marker>();
  private courierMarkers = new Map<number, L.Marker>();

  deliveries: DeliveryQueueItem[] = [];
  filteredDeliveries: DeliveryQueueItem[] = [];
  totalItems = 0;
  pageSize = 10;
  pageNumber = 1;

  couriers: Courier[] = [];
  courierLocations: CourierLocation[] = [];
  selectedDeliveries = new Set<number>();
  loading = false;
  rowLoading = new Map<number, boolean>();
  actionMessage = '';
  actionError = '';
  
  selectedBranch = 'All';
  selectedCourier = 'All';
  selectedVehicle = 'All';
  selectedStatus = 'All';
  selectedPriority = 'All';
  selectedBulkCourierId: number | null = null;
  searchTerm = '';
  
  statusOptions = ['All', 'Scheduled', 'Assigned', 'In Progress', 'Completed', 'Failed', 'Cancelled', 'Returned'];
  priorityOptions = ['All', 'Low', 'Normal', 'High', 'Urgent'];
  notificationOptions = ['eta_update', 'rescheduled', 'assigned', 'delivery_attempt'];
  statusUpdateOptions = [
    { label: 'Assigned', statusId: 2 },
    { label: 'Picked Up', statusId: 3 },
    { label: 'Out for Delivery', statusId: 4 },
    { label: 'Delivered', statusId: 7 },
    { label: 'Failed', statusId: 9 },
    { label: 'Returned', statusId: 10 },
    { label: 'Cancelled', statusId: 11 }
  ];

  get branchOptions(): Array<{ id: number; name: string }> {
    const branches = new Map<number, string>();
    this.deliveries.forEach(delivery => {
      if (delivery.branchId) {
        branches.set(delivery.branchId, delivery.branchName || `Branch #${delivery.branchId}`);
      }
    });
    this.couriers.forEach(courier => {
      if (courier.branchId) {
        branches.set(courier.branchId, courier.branchName || `Branch #${courier.branchId}`);
      }
    });
    return Array.from(branches, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }

  get vehicleOptions(): string[] {
    return Array.from(new Set([
      ...this.deliveries.map(delivery => delivery.vehicleType).filter(Boolean) as string[],
      ...this.couriers.map(courier => courier.vehicleType).filter(Boolean)
    ])).sort();
  }

  ngOnInit(): void {
    this.loadData();
    this.signalRService.courierLocations$.subscribe(locations => {
      this.courierLocations = locations;
      this.updateCourierMarkers();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapElement.nativeElement).setView([30.0444, 31.2357], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.addLayer(this.markers);
  }

  private updateMapMarkers(): void {
    if (!this.map) return;

    this.markers.clearLayers();
    this.shipmentMarkers.clear();
    
    this.filteredDeliveries.forEach(delivery => {
      if (delivery.dropoffCoordinates) {
        const marker = L.marker([delivery.dropoffCoordinates.latitude, delivery.dropoffCoordinates.longitude], {
          icon: this.createMarkerIcon('dropoff', delivery.status)
        }).bindPopup(`
          <strong>Order: ${delivery.orderNumber}</strong><br>
          Status: ${delivery.status}<br>
          Customer: ${delivery.customerName}
        `);
        this.markers.addLayer(marker);
        this.shipmentMarkers.set(delivery.id, marker);
      }

      if (delivery.pickupCoordinates) {
        const marker = L.marker([delivery.pickupCoordinates.latitude, delivery.pickupCoordinates.longitude], {
          icon: this.createMarkerIcon('pickup', delivery.status)
        }).bindPopup(`
          <strong>Pickup: ${delivery.orderNumber}</strong><br>
          Address: ${delivery.pickupAddress}
        `);
        this.markers.addLayer(marker);
      }
    });

    if (this.markers.getLayers().length > 0) {
      this.map.fitBounds(this.markers.getBounds(), { padding: [20, 20] });
    }
  }

  focusOnShipment(delivery: DeliveryQueueItem): void {
    const marker = this.shipmentMarkers.get(delivery.id);
    if (marker && this.map) {
      this.map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }
  }

  clearFocus(): void {
    if (this.map && this.markers.getLayers().length > 0) {
      this.map.fitBounds(this.markers.getBounds(), { padding: [20, 20] });
    }
  }

  private updateCourierMarkers(): void {
    if (!this.map) return;

    this.courierLocations.forEach(location => {
      let marker = this.courierMarkers.get(Number(location.id));
      const latLng: L.LatLngExpression = [location.latitude, location.longitude];

      if (marker) {
        marker.setLatLng(latLng);
      } else {
        marker = L.marker(latLng, {
          icon: this.createMarkerIcon('courier', location.status)
        }).bindPopup(`<strong>Courier: ${location.name}</strong><br>Status: ${location.status}`);
        marker.addTo(this.map!);
        this.courierMarkers.set(Number(location.id), marker);
      }
    });
  }

  private createMarkerIcon(type: 'pickup' | 'dropoff' | 'courier', status: string): L.DivIcon {
    const color = this.getMarkerColor(type, status);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  }

  private getMarkerColor(type: 'pickup' | 'dropoff' | 'courier', status: string): string {
    if (type === 'courier') {
      return status === 'delivering' ? '#FF9800' : '#4CAF50';
    }
    
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'Failed': return '#F44336';
      case 'In Progress': return '#2196F3';
      case 'Assigned': return '#9C27B0';
      default: return '#607D8B';
    }
  }

  loadData(): void {
    this.loading = true;
    
    this.operationsService.getDeliveryQueue(this.buildServerFilters()).subscribe({
      next: (result) => {
        this.deliveries = result.items;
        this.totalItems = result.totalCount;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.actionError = error?.message || 'Unable to load delivery queue';
        this.loading = false;
      }
    });

    this.operationsService.getCouriers().subscribe({
      next: (couriers) => {
        this.couriers = couriers.filter(c => c.status === 'Available' || c.status === 'Busy');
      }
    });
  }

  onPageChange(event: any): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  applyFilters(): void {
    // Note: Search and logic filtering is now handled server-side in loadData via buildServerFilters.
    // We only keep basic local filtering if needed for sub-filtering, but usually it's just:
    this.filteredDeliveries = [...this.deliveries];
    this.updateMapMarkers();
  }

  refreshWithFilters(): void {
    this.pageNumber = 1;
    this.loadData();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Scheduled': 'bg-info',
      'Assigned': 'bg-primary',
      'In Progress': 'bg-warning',
      'Completed': 'bg-success',
      'Failed': 'bg-danger',
      'Cancelled': 'bg-secondary',
      'Returned': 'bg-dark'
    };
    return classes[status] || 'bg-secondary';
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'Low': 'bg-secondary',
      'Normal': 'bg-info',
      'High': 'bg-warning',
      'Urgent': 'bg-danger'
    };
    return classes[priority] || 'bg-secondary';
  }

  toggleSelection(deliveryId: number): void {
    if (this.selectedDeliveries.has(deliveryId)) {
      this.selectedDeliveries.delete(deliveryId);
    } else {
      this.selectedDeliveries.add(deliveryId);
    }
  }

  bulkAssignCourier(): void {
    if (this.selectedDeliveries.size === 0) {
      this.actionError = 'Select deliveries before assigning a courier.';
      return;
    }

    if (!this.selectedBulkCourierId) {
      this.actionError = 'Choose a courier for the selected deliveries.';
      return;
    }

    const requests = Array.from(this.selectedDeliveries)
      .map(deliveryId => this.operationsService.assignCourierToDelivery(deliveryId, this.selectedBulkCourierId!).subscribe({
        error: error => this.actionError = error?.message || 'Assignment failed'
      }));

    this.actionMessage = `${requests.length} assignment request(s) submitted.`;
    this.selectedDeliveries.clear();
    setTimeout(() => this.loadData(), 500);
  }

  assignCourier(delivery: DeliveryQueueItem, courierIdValue: string): void {
    const courierId = Number(courierIdValue);
    if (!courierId) return;

    this.runDeliveryAction(
      this.operationsService.assignCourierToDelivery(delivery.id, courierId),
      'Courier assigned.',
      delivery.id
    );
  }

  unassignCourier(delivery: DeliveryQueueItem): void {
    this.runDeliveryAction(
      this.operationsService.unassignCourierFromDelivery(delivery.id),
      'Courier unassigned.',
      delivery.id
    );
  }

  rescheduleDelivery(delivery: DeliveryQueueItem, value: string): void {
    if (!value) return;

    this.runDeliveryAction(
      this.operationsService.rescheduleDelivery(delivery.id, new Date(value)),
      'Delivery rescheduled.',
      delivery.id
    );
  }

  updatePriority(delivery: DeliveryQueueItem, priority: DeliveryQueueItem['priority']): void {
    this.runDeliveryAction(
      this.operationsService.updateDeliveryPriority(delivery.id, priority),
      'Priority updated.',
      delivery.id
    );
  }

  updateQueueOrder(delivery: DeliveryQueueItem, value: string): void {
    const queueOrder = Number(value);
    if (!Number.isFinite(queueOrder) || queueOrder < 1) return;

    this.runDeliveryAction(
      this.operationsService.reorderDeliveries([{ deliveryId: delivery.id, queueOrder }]),
      'Queue order updated.',
      delivery.id
    );
  }

  moveInQueue(delivery: DeliveryQueueItem, delta: number): void {
    const currentOrder = delivery.queueOrder || 1;
    const newOrder = Math.max(1, currentOrder + delta);
    if (newOrder === currentOrder) return;

    this.updateQueueOrder(delivery, newOrder.toString());
  }

  updateStatus(delivery: DeliveryQueueItem, statusIdValue: string): void {
    const statusId = Number(statusIdValue);
    if (!statusId) return;

    this.runDeliveryAction(
      this.operationsService.updateDeliveryStatus(delivery.id, statusId),
      'Status updated.',
      delivery.id
    );
  }

  notifyCustomer(delivery: DeliveryQueueItem, messageType: string): void {
    this.runDeliveryAction(
      this.operationsService.sendCustomerDeliveryNotification(delivery.id, messageType),
      'Customer notification queued.',
      delivery.id
    );
  }

  selectAllVisible(checked: boolean): void {
    if (checked) {
      this.filteredDeliveries.forEach(delivery => this.selectedDeliveries.add(delivery.id));
    } else {
      this.filteredDeliveries.forEach(delivery => this.selectedDeliveries.delete(delivery.id));
    }
  }

  formatCoordinate(coordinate?: { latitude: number; longitude: number }): string {
    return coordinate ? `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}` : 'No coordinates';
  }

  getCourierLocation(delivery: DeliveryQueueItem): CourierLocation | undefined {
    if (!delivery.courierId) return undefined;
    return this.courierLocations.find(location => location.id === String(delivery.courierId));
  }

  private buildServerFilters(): DeliveryQueueFilters {
    return {
      branchId: this.selectedBranch,
      courierId: this.selectedCourier,
      vehicleType: this.selectedVehicle,
      status: this.selectedStatus,
      priority: this.selectedPriority,
      search: this.searchTerm,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };
  }

  private runDeliveryAction(action$: Observable<any>, successMessage: string, deliveryId?: number): void {
    this.actionMessage = '';
    this.actionError = '';
    if (deliveryId) this.rowLoading.set(deliveryId, true);

    action$.subscribe({
      next: () => {
        this.actionMessage = successMessage;
        if (deliveryId) this.rowLoading.delete(deliveryId);
        this.loadData();
      },
      error: (error) => {
        this.actionError = error?.message || 'Delivery queue action failed.';
        if (deliveryId) this.rowLoading.delete(deliveryId);
      }
    });
  }
}
