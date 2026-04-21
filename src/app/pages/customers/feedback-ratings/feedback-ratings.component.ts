import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FeedbackService } from 'src/app/services/feedback.service';
import { CustomerFeedback, FeedbackStatistics } from 'src/app/models/feedback.models';

@Component({
  selector: 'app-feedback-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './feedback-ratings.component.html',
  styleUrls: ['./feedback-ratings.component.scss']
})
export class FeedbackRatingsComponent implements OnInit {
  feedbacks: CustomerFeedback[] = [];
  filteredFeedbacks: CustomerFeedback[] = [];
  statistics: FeedbackStatistics | null = null;
  loading = false;
  
  selectedStatus = 'All';
  selectedRating = 'All';
  searchTerm = '';
  
  statusOptions = ['All', 'Pending', 'Reviewed', 'Addressed', 'Closed'];
  ratingOptions = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (feedbacks) => {
        this.feedbacks = feedbacks;
        this.filteredFeedbacks = feedbacks;
        this.loading = false;
      }
    });

    this.feedbackService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.feedbacks];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.orderNumber.toLowerCase().includes(search) ||
        f.customerName.toLowerCase().includes(search) ||
        f.courierName.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(f => f.status === this.selectedStatus);
    }

    if (this.selectedRating !== 'All') {
      const rating = parseInt(this.selectedRating);
      filtered = filtered.filter(f => f.overallRating === rating);
    }

    this.filteredFeedbacks = filtered;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getExperienceClass(experience: string): string {
    const classes: Record<string, string> = {
      'Excellent': 'bg-success',
      'Good': 'bg-info',
      'Average': 'bg-warning',
      'Poor': 'bg-danger',
      'Very Poor': 'bg-dark'
    };
    return classes[experience] || 'bg-secondary';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Pending': 'bg-warning',
      'Reviewed': 'bg-info',
      'Addressed': 'bg-success',
      'Closed': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  viewFeedbackDetail(feedback: CustomerFeedback): void {
    // Open modal or navigate to detail page
    console.log('View feedback:', feedback);
  }

  respondToFeedback(feedbackId: number): void {
    const response = prompt('Enter your response:');
    if (response) {
      this.feedbackService.updateFeedback(feedbackId, {
        status: 'Addressed',
        adminResponse: response,
        reviewedBy: 'Admin',
        reviewedDate: new Date()
      }).subscribe({
        next: (result) => {
          if (result.succeeded) {
            this.loadData();
          }
        }
      });
    }
  }
}