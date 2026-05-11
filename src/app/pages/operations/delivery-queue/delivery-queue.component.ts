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
    if (this.map) return;

    this.map = L.map(this.mapElement.nativeElement).setView([30.0444, 31.2357], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.addLayer(this.markers);

    // Ensure map is correctly sized
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);

    // If data is already loaded before map was ready, update markers now
    if (this.filteredDeliveries.length > 0) {
      this.updateMapMarkers();
    }
    if (this.courierLocations.length > 0) {
      this.updateCourierMarkers();
    }
  }

  private updateMapMarkers(): void {
    if (!this.map) return;

    this.markers.clearLayers();
    this.shipmentMarkers.clear();
    
    const newMarkers: L.Marker[] = [];
    // Track seen coordinates to add jitter for overlapping points
    const coordinateCounts = new Map<string, number>();
    
    this.filteredDeliveries.forEach(delivery => {
      // Handle Dropoff
      if (delivery.dropoffCoordinates && 
          typeof delivery.dropoffCoordinates.latitude === 'number' && 
          typeof delivery.dropoffCoordinates.longitude === 'number') {
        
        let lat = delivery.dropoffCoordinates.latitude;
        let lng = delivery.dropoffCoordinates.longitude;
        const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        const count = coordinateCounts.get(coordKey) || 0;
        coordinateCounts.set(coordKey, count + 1);

        // Add a tiny jitter if this spot is occupied (approx 2-3 meters offset)
        if (count > 0) {
          lat += (Math.random() - 0.5) * 0.0001;
          lng += (Math.random() - 0.5) * 0.0001;
        }

        const marker = L.marker([lat, lng], {
          icon: this.createMarkerIcon('dropoff', delivery.status)
        }).bindPopup(`
          <div class="p-2" style="min-width: 150px;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong class="text-primary">${delivery.orderNumber}</strong>
              <span class="badge ${this.getStatusClass(delivery.status)}">${delivery.status}</span>
            </div>
            <div class="small mb-1"><strong>To:</strong> ${delivery.customerName}</div>
            <div class="small text-muted">${delivery.deliveryAddress}</div>
          </div>
        `);
        newMarkers.push(marker);
        this.shipmentMarkers.set(delivery.id, marker);
      }

      // Handle Pickup
      if (delivery.pickupCoordinates && 
          typeof delivery.pickupCoordinates.latitude === 'number' && 
          typeof delivery.pickupCoordinates.longitude === 'number') {
        
        let lat = delivery.pickupCoordinates.latitude;
        let lng = delivery.pickupCoordinates.longitude;
        const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        const count = coordinateCounts.get(coordKey) || 0;
        coordinateCounts.set(coordKey, count + 1);

        if (count > 0) {
          lat += (Math.random() - 0.5) * 0.0001;
          lng += (Math.random() - 0.5) * 0.0001;
        }

        const marker = L.marker([lat, lng], {
          icon: this.createMarkerIcon('pickup', delivery.status)
        }).bindPopup(`
          <div class="p-2" style="min-width: 150px;">
            <div class="mb-2"><strong class="text-success">Pickup: ${delivery.orderNumber}</strong></div>
            <div class="small text-muted">${delivery.pickupAddress}</div>
          </div>
        `);
        newMarkers.push(marker);
      }
    });

    if (newMarkers.length > 0) {
      this.markers.addLayers(newMarkers);
      try {
        const bounds = this.markers.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } catch (e) {
        console.warn('Could not fit map bounds', e);
      }
    }
  }

  focusOnShipment(delivery: DeliveryQueueItem): void {
    if (!this.map) return;
    
    const marker = this.shipmentMarkers.get(delivery.id);
    if (marker) {
      try {
        const latLng = marker.getLatLng();
        if (latLng && (latLng.lat !== 0 || latLng.lng !== 0)) {
          this.map.setView(latLng, 17); // Zoom in closer for focused view
          
          if (this.markers && (this.markers as any).zoomToShowLayer) {
            (this.markers as any).zoomToShowLayer(marker, () => {
              marker.openPopup();
            });
          } else {
            marker.openPopup();
          }
        }
      } catch (e) {
        console.warn('Failed to focus on shipment marker', e);
      }
    }
  }

  clearFocus(): void {
    if (!this.map || !this.markers) return;
    
    try {
      if (this.markers.getLayers().length > 0) {
        const bounds = this.markers.getBounds();
        if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    } catch (e) {
      console.warn('Failed to clear focus/reset map bounds', e);
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
    const size = type === 'courier' ? 28 : 22;
    const label = type === 'pickup' ? 'P' : type === 'dropoff' ? 'D' : 'C';
    const borderColor = type === 'courier' ? '#2d3436' : 'white';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color}; 
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid ${borderColor}; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
          color: white;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: ${size > 24 ? '12px' : '10px'};
          font-weight: 700;
          line-height: 1;
          transition: transform 0.2s ease;
        ">
          ${label}
        </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
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

  onFilterChange(): void {
    this.pageNumber = 1;
    this.loadData();
  }

  applyFilters(): void {
    // This is called locally after loadData. 
    // If we wanted local sub-filtering we would do it here.
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
