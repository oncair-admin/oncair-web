import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService } from 'src/app/services/operations.service';
import { Hub, HubMonitoringStats, HubTransfer, HubException } from 'src/app/models/operations.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hub-monitoring',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './hub-monitoring.component.html',
  styleUrls: ['./hub-monitoring.component.scss']
})
export class HubMonitoringComponent implements OnInit {
  hubs: Hub[] = [];
  selectedHubId?: number;
  stats: HubMonitoringStats | null = null;
  transfers: HubTransfer[] = [];
  exceptions: HubException[] = [];
  loading = false;

  constructor(private operationsService: OperationsService) {}

  ngOnInit(): void {
    this.loadHubs();
  }

  loadHubs(): void {
    this.operationsService.getHubs().subscribe({
      next: (hubs) => {
        this.hubs = hubs;
        if (hubs.length > 0) {
          this.selectedHubId = hubs[0].id;
          this.onHubChange();
        }
      },
      error: (error) => console.error('Error loading hubs:', error)
    });
  }

  onHubChange(): void {
    if (!this.selectedHubId) return;

    this.loading = true;
    this.operationsService.getHubMonitoringStats(this.selectedHubId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });

    this.operationsService.getPendingTransfers(this.selectedHubId).subscribe({
      next: (transfers) => this.transfers = transfers,
      error: (err) => console.error(err)
    });

    this.operationsService.getHubExceptions(this.selectedHubId).subscribe({
      next: (exceptions) => this.exceptions = exceptions,
      error: (err) => console.error(err)
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'In Transit': return 'status-transit';
      case 'Received': return 'status-received';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  updateTransferStatus(transferId: number, status: number): void {
    this.operationsService.updateTransferStatus(transferId, status).subscribe({
      next: () => this.onHubChange(),
      error: (err) => console.error(err)
    });
  }
}
