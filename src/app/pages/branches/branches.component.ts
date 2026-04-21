/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MaterialModule } from '../../material.module';
import { BranchService, Branch } from 'services/branch.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  providers: [BranchService],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss'],
})
export class BranchesComponent implements OnInit, OnDestroy {
  branches: Branch[] = [];
  loading = false;
  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  selectedBranch: Branch | null = null;
  viewBranch: Branch | null = null;
  mapSafeUrl: SafeResourceUrl | null = null;

  // Form data
  newBranchName = '';
  newBranchCode = '';
  newAddressEn = '';
  newAddressAr = '';
  newStartTime = '09:00';
  newEndTime = '17:00';
  newLat: number | null = null;
  newLon: number | null = null;
  
  editBranchName = '';
  editBranchCode = '';
  editAddressEn = '';
  editAddressAr = '';
  editStartTime = '09:00';
  editEndTime = '17:00';
  editLat: number | null = null;
  editLon: number | null = null;

  // Location search
  locationSearchQuery = '';
  locationSearchResults: any[] = [];
  isSearchingLocation = false;
  selectedLocationMapUrl: SafeResourceUrl | null = null;
  editLocationMapUrl: SafeResourceUrl | null = null;
  isGettingCurrentLocation = false;

  // Statistics
  totalBranches = 0;
  activeBranches = 0;
  recentBranches = 0;

  // Error handling
  errorMessage = '';
  showError = false;

  constructor(
    private branchService: BranchService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.branchService.getBranches().subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.branches = response.data || [];
          this.calculateStats();
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Failed to load branches';
          console.error('Failed to load branches:', response.message);
        }
      },
      error: (error: any) => {
        this.showError = true;
        this.errorMessage = 'Error loading branches. Please try again.';
        console.error('Error loading branches:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  calculateStats(): void {
    this.totalBranches = this.branches.length;
    this.activeBranches = this.branches.length; // Assuming all branches are active
    this.recentBranches = this.branches.length; // You can modify this logic based on your needs
  }

  openAddModal(): void {
    this.newBranchName = '';
    this.newBranchCode = '';
    this.newAddressEn = '';
    this.newAddressAr = '';
    this.newStartTime = '09:00';
    this.newEndTime = '17:00';
    this.newLat = null;
    this.newLon = null;
    this.selectedLocationMapUrl = null;
    this.locationSearchQuery = '';
    this.locationSearchResults = [];
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newBranchName = '';
    this.newBranchCode = '';
    this.newAddressEn = '';
    this.newAddressAr = '';
    this.newStartTime = '09:00';
    this.newEndTime = '17:00';
    this.newLat = null;
    this.newLon = null;
    this.selectedLocationMapUrl = null;
    this.locationSearchQuery = '';
    this.locationSearchResults = [];
  }

  addBranch(): void {
    if (!this.newBranchName.trim() || !this.newBranchCode.trim() || this.newBranchCode.length !== 2) {
      return;
    }
    if (!this.newAddressEn.trim() || !this.newAddressAr.trim()) {
      this.showError = true;
      this.errorMessage = 'Please fill both English and Arabic addresses';
      return;
    }

    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    const openCloseRemark = `${this.newStartTime} - ${this.newEndTime}`;

    this.branchService
      .createBranch({ 
        name: this.newBranchName.trim(),
        nameAr: '',
        code: this.newBranchCode.trim().toUpperCase(),
        addressEn: this.newAddressEn.trim(),
        addressAr: this.newAddressAr.trim(),
        openCloseRemark: openCloseRemark,
        lat: this.newLat,
        lon: this.newLon
      })
      .subscribe({
        next: (response: any) => {
          if (response.succeeded) {
            this.loadBranches();
            this.closeAddModal();
          } else {
            this.showError = true;
            this.errorMessage = response.message || 'Failed to create branch';
            console.error('Failed to create branch:', response.message);
          }
        },
        error: (error: any) => {
          this.showError = true;
          this.errorMessage = 'Error creating branch. Please try again.';
          console.error('Error creating branch:', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  parseOpenCloseRemark(remark: string): { startTime: string; endTime: string } {
    if (!remark) {
      return { startTime: '09:00', endTime: '17:00' };
    }
    const parts = remark.split(' - ');
    if (parts.length === 2) {
      return { startTime: parts[0].trim(), endTime: parts[1].trim() };
    }
    return { startTime: '09:00', endTime: '17:00' };
  }

  openEditModal(branch: Branch): void {
    this.selectedBranch = branch;
    this.editBranchName = branch.brancheNameEn;
    this.editBranchCode = branch.code || '';
    this.editAddressEn = branch.addresseEn || '';
    this.editAddressAr = branch.addresseAr || '';
    const times = this.parseOpenCloseRemark(branch.openCloseRemark || '');
    this.editStartTime = times.startTime;
    this.editEndTime = times.endTime;
    this.editLat = branch.lat || null;
    this.editLon = branch.lon || null;
    this.locationSearchQuery = '';
    this.locationSearchResults = [];
    this.updateEditLocationMap();
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedBranch = null;
    this.editBranchName = '';
    this.editBranchCode = '';
    this.editAddressEn = '';
    this.editAddressAr = '';
    this.editStartTime = '09:00';
    this.editEndTime = '17:00';
    this.editLat = null;
    this.editLon = null;
    this.editLocationMapUrl = null;
    this.locationSearchQuery = '';
    this.locationSearchResults = [];
  }

  updateBranch(): void {
    if (!this.selectedBranch || !this.editBranchName.trim() || !this.editBranchCode.trim() || this.editBranchCode.length !== 2) {
      return;
    }
    if (!this.editAddressEn.trim() || !this.editAddressAr.trim()) {
      this.showError = true;
      this.errorMessage = 'Please fill both English and Arabic addresses';
      return;
    }

    const openCloseRemark = `${this.editStartTime} - ${this.editEndTime}`;

    const updatedBranch: Branch = {
      ...this.selectedBranch,
      brancheNameEn: this.editBranchName.trim(),
      code: this.editBranchCode.trim().toUpperCase(),
      addresseEn: this.editAddressEn.trim(),
      addresseAr: this.editAddressAr.trim(),
      openCloseRemark: openCloseRemark,
      lat: this.editLat,
      lon: this.editLon,
    };

    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.branchService.updateBranch(updatedBranch).subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.loadBranches();
          this.closeEditModal();
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Failed to update branch';
          console.error('Failed to update branch:', response.message);
        }
      },
      error: (error: any) => {
        this.showError = true;
        this.errorMessage = 'Error updating branch. Please try again.';
        console.error('Error updating branch:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  deleteBranch(branch: Branch): void {
    if (
      confirm(`Are you sure you want to delete branch "${branch.brancheNameEn}"?`)
    ) {
      this.loading = true;
      this.showError = false;
      this.errorMessage = '';

      this.branchService.deleteBranch(branch.branchId).subscribe({
        next: (response: any) => {
          if (response.succeeded) {
            this.loadBranches();
          } else {
            this.showError = true;
            this.errorMessage = response.message || 'Failed to delete branch';
            console.error('Failed to delete branch:', response.message);
          }
        },
        error: (error: any) => {
          this.showError = true;
          this.errorMessage = 'Error deleting branch. Please try again.';
          console.error('Error deleting branch:', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
    }
  }

  clearError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  // Location search using OpenStreetMap Nominatim API
  searchLocation(query: string, isEdit = false): void {
    if (!query || query.length < 3) {
      this.locationSearchResults = [];
      return;
    }

    this.isSearchingLocation = true;
    
    // Using Nominatim API for geocoding (free, no API key needed)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=eg&limit=5`)
      .then(response => response.json())
      .then(results => {
        this.locationSearchResults = results.map((r: any) => ({
          displayName: r.display_name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          type: r.type
        }));
        this.isSearchingLocation = false;
      })
      .catch(error => {
        console.error('Location search error:', error);
        this.locationSearchResults = [];
        this.isSearchingLocation = false;
      });
  }

  // Select a location from search results
  selectLocation(location: any, isEdit = false): void {
    if (isEdit) {
      this.editLat = location.lat;
      this.editLon = location.lon;
      this.editAddressEn = location.displayName;
      this.updateEditLocationMap();
    } else {
      this.newLat = location.lat;
      this.newLon = location.lon;
      this.newAddressEn = location.displayName;
      this.updateNewLocationMap();
    }
    this.locationSearchResults = [];
    this.locationSearchQuery = '';
  }

  // Get current location using browser Geolocation API
  getCurrentLocation(isEdit = false): void {
    if (!navigator.geolocation) {
      this.showError = true;
      this.errorMessage = 'Geolocation is not supported by your browser';
      return;
    }

    this.isGettingCurrentLocation = true;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        if (isEdit) {
          this.editLat = lat;
          this.editLon = lon;
          this.updateEditLocationMap();
        } else {
          this.newLat = lat;
          this.newLon = lon;
          this.updateNewLocationMap();
        }
        
        // Reverse geocode to get address
        this.reverseGeocode(lat, lon, isEdit);
        this.isGettingCurrentLocation = false;
      },
      (error) => {
        this.isGettingCurrentLocation = false;
        this.showError = true;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            this.errorMessage = 'Location request timed out.';
            break;
          default:
            this.errorMessage = 'An unknown error occurred getting location.';
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Reverse geocode coordinates to get address
  private reverseGeocode(lat: number, lon: number, isEdit = false): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then(response => response.json())
      .then(result => {
        if (result && result.display_name) {
          if (isEdit) {
            this.editAddressEn = result.display_name;
          } else {
            this.newAddressEn = result.display_name;
          }
        }
      })
      .catch(error => console.error('Reverse geocode error:', error));
  }

  // Update map preview for new branch
  updateNewLocationMap(): void {
    if (this.newLat && this.newLon) {
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${this.newLon - 0.01}%2C${this.newLat - 0.01}%2C${this.newLon + 0.01}%2C${this.newLat + 0.01}&layer=mapnik&marker=${this.newLat}%2C${this.newLon}`;
      this.selectedLocationMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
    } else {
      this.selectedLocationMapUrl = null;
    }
  }

  // Update map preview for edit branch
  updateEditLocationMap(): void {
    if (this.editLat && this.editLon) {
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${this.editLon - 0.01}%2C${this.editLat - 0.01}%2C${this.editLon + 0.01}%2C${this.editLat + 0.01}&layer=mapnik&marker=${this.editLat}%2C${this.editLon}`;
      this.editLocationMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
    } else {
      this.editLocationMapUrl = null;
    }
  }

  // Clear location for new branch
  clearNewLocation(): void {
    this.newLat = null;
    this.newLon = null;
    this.selectedLocationMapUrl = null;
  }

  // Clear location for edit branch
  clearEditLocation(): void {
    this.editLat = null;
    this.editLon = null;
    this.editLocationMapUrl = null;
  }

  openViewModal(branch: Branch): void {
    this.viewBranch = branch;
    this.showViewModal = true;
    // Generate safe URL for the map iframe
    if (branch.lat && branch.lon) {
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${branch.lon - 0.01}%2C${branch.lat - 0.01}%2C${branch.lon + 0.01}%2C${branch.lat + 0.01}&layer=mapnik&marker=${branch.lat}%2C${branch.lon}`;
      this.mapSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
    } else {
      this.mapSafeUrl = null;
    }
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewBranch = null;
    this.mapSafeUrl = null;
  }
  
  // Generate Google Maps URL for directions
  getGoogleMapsUrl(branch: Branch | null): string {
    if (!branch || !branch.lat || !branch.lon) {
      return '';
    }
    return `https://www.google.com/maps?q=${branch.lat},${branch.lon}`;
  }

  ngOnDestroy(): void {
    // Cleanup
  }
}
