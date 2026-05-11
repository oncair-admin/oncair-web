import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalRService, CourierLocation } from '../../services/signalr.service';
import { OperationsService } from '../../services/operations.service';
import { Hub } from '../../models/operations.models';
import { Subscription } from 'rxjs';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './live-tracking.component.html',
  styleUrls: ['./live-tracking.component.scss']
})
export class LiveTrackingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapElement: ElementRef;
  
  private googleMap: google.maps.Map | undefined;
  private courierMarkers = new Map<string, any>();
  private hubMarkers: any[] = [];
  private courierRoutes = new Map<string, google.maps.DirectionsRenderer>();
  private trafficLayer: google.maps.TrafficLayer | undefined;
  
  private courierLocationsSubscription: Subscription | undefined;
  public courierLocations: CourierLocation[] = [];
  public hubs: Hub[] = [];

  constructor(
    private signalRService: SignalRService,
    private operationsService: OperationsService
  ) {}

  ngOnInit(): void {
    this.subscribeToCourierLocations();
    this.loadHubs();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.courierLocationsSubscription) {
      this.courierLocationsSubscription.unsubscribe();
    }
    this.clearMarkers();
  }

  private loadHubs(): void {
    this.operationsService.getHubs().subscribe(hubs => {
      this.hubs = hubs;
      this.updateHubMarkers();
    });
  }

  private subscribeToCourierLocations(): void {
    this.courierLocationsSubscription = this.signalRService.courierLocations$.subscribe(
      locations => {
        this.courierLocations = locations;
        this.updateCourierMarkers();
      }
    );
  }

  private initializeMap(): void {
    const defaultCenter = { lat: 30.0444, lng: 31.2357 }; // Cairo
    
    const mapOptions: google.maps.MapOptions = {
      center: defaultCenter,
      zoom: 12,
      mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    };

    this.googleMap = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    // Initialize Traffic Layer
    this.trafficLayer = new google.maps.TrafficLayer();
    this.trafficLayer.setMap(this.googleMap);

    this.updateHubMarkers();
    this.updateCourierMarkers();
  }

  private updateHubMarkers(): void {
    if (!this.googleMap) return;

    // Clear old hub markers
    this.hubMarkers.forEach(m => m.map = null);
    this.hubMarkers = [];

    this.hubs.forEach(hub => {
      if (hub.latitude && hub.longitude) {
        const pin = new google.maps.marker.PinElement({
          background: '#FF0000',
          borderColor: '#FFFFFF',
          glyphColor: '#FFFFFF',
          scale: 1
        });

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: hub.latitude, lng: hub.longitude },
          map: this.googleMap,
          title: hub.name,
          content: pin.element
        });
        
        this.hubMarkers.push(marker);
      }
    });
  }

  private updateCourierMarkers(): void {
    if (!this.googleMap) return;

    this.courierLocations.forEach(courier => {
      let marker = this.courierMarkers.get(courier.id);
      const position = { lat: courier.latitude, lng: courier.longitude };

      if (marker) {
        marker.position = position;
      } else {
        const pin = new google.maps.marker.PinElement({
          background: this.getCourierColor(courier.status),
          borderColor: '#FFFFFF',
          glyphColor: '#FFFFFF',
        });

        marker = new google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: this.googleMap,
          title: courier.name,
          content: pin.element
        });
        
        const infoWindow = new google.maps.InfoWindow({
          content: this.createCourierPopup(courier)
        });

        marker.addListener('click', () => {
          infoWindow.open(this.googleMap, marker);
        });

        this.courierMarkers.set(courier.id, marker);
      }

      // Update Active Route if destination exists
      if (courier.activeDestinationLat && courier.activeDestinationLon) {
        this.drawCourierRoute(courier);
      } else {
        this.clearCourierRoute(courier.id);
      }
    });
  }

  private getCourierColor(status: string): string {
    if (status === 'delivering') return '#FF9800';
    if (status === 'offline') return '#F44336';
    return '#4CAF50';
  }

  private drawCourierRoute(courier: CourierLocation): void {
    if (!this.googleMap) return;

    let renderer = this.courierRoutes.get(courier.id);
    if (!renderer) {
      renderer = new google.maps.DirectionsRenderer({
        map: this.googleMap,
        preserveViewport: true,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#1976D2',
          strokeWeight: 4,
          strokeOpacity: 0.6
        }
      });
      this.courierRoutes.set(courier.id, renderer);
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: courier.latitude, lng: courier.longitude },
        destination: { lat: courier.activeDestinationLat!, lng: courier.activeDestinationLon! },
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          renderer!.setDirections(result);
          // Optional: Update ETA in courier object or popup
          const eta = result.routes[0].legs[0].duration?.text;
          console.log(`ETA for ${courier.name}: ${eta}`);
        }
      }
    );
  }

  private clearCourierRoute(courierId: string): void {
    const renderer = this.courierRoutes.get(courierId);
    if (renderer) {
      renderer.setMap(null);
      this.courierRoutes.delete(courierId);
    }
  }

  private clearMarkers(): void {
    this.courierMarkers.forEach(m => m.map = null);
    this.courierMarkers.clear();
    this.hubMarkers.forEach(m => m.map = null);
    this.hubMarkers = [];
    this.courierRoutes.forEach(r => r.setMap(null));
    this.courierRoutes.clear();
  }

  private createCourierPopup(courier: CourierLocation): string {
    return `
      <div style="min-width: 150px; padding: 5px;">
        <h4 style="margin: 0 0 5px 0;">${courier.name}</h4>
        <p style="margin: 2px 0;"><strong>Status:</strong> ${courier.status}</p>
        <p style="margin: 2px 0;"><strong>Last Sync:</strong> ${new Date(courier.timestamp).toLocaleTimeString()}</p>
      </div>
    `;
  }

  public centerOnCourier(courierId: string): void {
    const courier = this.courierLocations.find(c => c.id === courierId);
    if (courier && this.googleMap) {
      this.googleMap.setCenter({ lat: courier.latitude, lng: courier.longitude });
      this.googleMap.setZoom(16);
    }
  }

  public centerOnAllCouriers(): void {
    if (this.courierLocations.length > 0 && this.googleMap) {
      const bounds = new google.maps.LatLngBounds();
      this.courierLocations.forEach(c => bounds.extend({ lat: c.latitude, lng: c.longitude }));
      this.googleMap.fitBounds(bounds);
    }
  }

  public getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}