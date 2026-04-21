import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalRService, CourierLocation } from '../../services/signalr.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-tracking.component.html',
  styleUrls: ['./live-tracking.component.scss']
})
export class LiveTrackingComponent implements OnInit, OnDestroy, AfterViewInit {
  private map: L.Map | undefined;
  private courierMarkers = new Map<string, L.Marker>();
  private courierLocationsSubscription: Subscription | undefined;
  public courierLocations: CourierLocation[] = [];

  constructor(private signalRService: SignalRService) {}

  ngOnInit(): void {
    this.subscribeToCourierLocations();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.courierLocationsSubscription) {
      this.courierLocationsSubscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private subscribeToCourierLocations(): void {
    this.courierLocationsSubscription = this.signalRService.courierLocations$.subscribe(
      locations => {
        this.courierLocations = locations;
        this.updateMapMarkers();
      }
    );
  }

  private initializeMap(): void {
    // Default center (Cairo, Egypt)
    const defaultCenter: L.LatLngExpression = [30.0444, 31.2357];
    
    this.map = L.map('map').setView(defaultCenter, 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add initial markers if couriers are already loaded
    this.updateMapMarkers();
  }

  private updateMapMarkers(): void {
    if (!this.map) return;

    // Remove existing markers
    this.courierMarkers.forEach(marker => {
      this.map!.removeLayer(marker);
    });
    this.courierMarkers.clear();

    // Add new markers
    this.courierLocations.forEach(courier => {
      const marker = this.createCourierMarker(courier);
      this.courierMarkers.set(courier.id, marker);
    });
  }

  private createCourierMarker(courier: CourierLocation): L.Marker {
    const icon = this.getCourierIcon(courier.status);
    
    const marker = L.marker([courier.latitude, courier.longitude], { icon })
      .addTo(this.map!)
      .bindPopup(this.createCourierPopup(courier));

    return marker;
  }

  private getCourierIcon(status: string): L.DivIcon {
    const iconColor = this.getStatusColor(status);
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${iconColor};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">
          🚚
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'delivering': return '#FF9800';
      case 'offline': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  private createCourierPopup(courier: CourierLocation): string {
    const statusText = this.getStatusText(courier.status);
    const lastUpdate = courier.timestamp.toLocaleTimeString();
    
    return `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">${courier.name}</h4>
        <p style="margin: 4px 0; color: #666;">
          <strong>Status:</strong> <span style="color: ${this.getStatusColor(courier.status)}">${statusText}</span>
        </p>
        <p style="margin: 4px 0; color: #666;">
          <strong>Speed:</strong> ${courier.speed || 0} km/h
        </p>
        <p style="margin: 4px 0; color: #666;">
          <strong>Last Update:</strong> ${lastUpdate}
        </p>
        <p style="margin: 4px 0; color: #666;">
          <strong>Location:</strong> ${courier.latitude.toFixed(4)}, ${courier.longitude.toFixed(4)}
        </p>
      </div>
    `;
  }


  public centerOnCourier(courierId: string): void {
    const courier = this.courierLocations.find(c => c.id === courierId);
    if (courier && this.map) {
      this.map.setView([courier.latitude, courier.longitude], 15);
    }
  }

  public centerOnAllCouriers(): void {
    if (this.courierLocations.length > 0 && this.map) {
      const group = L.featureGroup();
      this.courierLocations.forEach(courier => {
        group.addLayer(L.marker([courier.latitude, courier.longitude]));
      });
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  public getStatusText(status: string): string {
    switch (status) {
      case 'online': return 'Online';
      case 'delivering': return 'Delivering';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  }
}