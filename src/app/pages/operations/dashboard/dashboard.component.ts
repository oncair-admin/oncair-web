import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { OperationsService } from 'src/app/services/operations.service';
import { SignalRService, DashboardUpdate } from 'src/app/services/signalr.service';
import { OperationsDashboardStats, BranchPerformance, Escalation, CustomerServiceMetrics } from 'src/app/models/operations.models';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-operations-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class OperationsDashboardComponent implements OnInit, OnDestroy {
  stats: OperationsDashboardStats | null = null;
  branchPerformance: BranchPerformance[] = [];
  customerServiceMetrics: CustomerServiceMetrics | null = null;
  escalations: Escalation[] = [];
  loading = false;
  private dashboardSubscription?: Subscription;

  constructor(
    private operationsService: OperationsService,
    private signalRService: SignalRService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.subscribeToSignalRUpdates();
  }

  ngOnDestroy(): void {
    if (this.dashboardSubscription) {
      this.dashboardSubscription.unsubscribe();
    }
  }

  private subscribeToSignalRUpdates(): void {
    // Subscribe to real-time dashboard updates from SignalR
    this.dashboardSubscription = this.signalRService.dashboardUpdates$.subscribe({
      next: (update: DashboardUpdate | null) => {
        if (update && this.stats) {
          // Update stats with real-time data
          this.stats.deliveriesCompleted = update.deliveriesCompleted;
          this.stats.inTransitShipments = update.inTransitShipments;
          this.stats.pendingPickups = update.pendingPickups;
          this.stats.failedDeliveries = update.failedDeliveries;
          this.stats.todayRevenue = update.todayRevenue;
          this.stats.activeRoutes = update.activeRoutes;
          this.stats.activeCouriers = update.activeCouriers;
        }
      },
      error: (error) => {
        console.error('Error receiving dashboard updates:', error);
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.operationsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    });

    this.operationsService.getBranchPerformance().subscribe({
      next: (performance) => {
        this.branchPerformance = performance;
      },
      error: (error) => {
        console.error('Error loading branch performance:', error);
      }
    });

    this.operationsService.getEscalations().subscribe({
      next: (escalations) => {
        this.escalations = escalations;
      },
      error: (error) => {
        console.error('Error loading escalations:', error);
      }
    });

    this.operationsService.getCustomerServiceMetrics().subscribe({
      next: (metrics) => {
        this.customerServiceMetrics = metrics;
      },
      error: (error) => {
        console.error('Error loading customer service metrics:', error);
      }
    });
  }

  getEscalationPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'Low': 'bg-info',
      'Medium': 'bg-warning',
      'High': 'bg-danger',
      'Critical': 'bg-dark'
    };
    return classes[priority] || 'bg-secondary';
  }

  getEscalationStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Open': 'bg-warning',
      'In Progress': 'bg-primary',
      'Resolved': 'bg-success',
      'Closed': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}