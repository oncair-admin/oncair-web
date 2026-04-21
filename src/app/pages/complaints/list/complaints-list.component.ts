/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { ComplaintsService, Complaint } from '../../../services/complaints.service';

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  providers: [ComplaintsService],
  templateUrl: './complaints-list.component.html',
  styleUrls: ['./complaints-list.component.scss'],
})
export class ComplaintsListComponent implements OnInit {
  complaints: Complaint[] = [];
  filtered: Complaint[] = [];
  loading = false;
  errorMessage = '';
  showError = false;

  // Add complaint form
  newMessage = '';
  newType = 'General';
  newCustomerName = '';

  searchTerm = '';

  constructor(private complaintsService: ComplaintsService) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.complaintsService.getAllComplaints().subscribe({
      next: (res: any) => {
        if (res?.succeeded) {
          this.complaints = res.data || [];
          this.filtered = [...this.complaints];
        } else {
          this.showError = true;
          this.errorMessage = res?.message || 'Failed to load complaints';
        }
      },
      error: (err: any) => {
        this.showError = true;
        this.errorMessage = 'Error loading complaints';
        console.error(err);
      },
      complete: () => (this.loading = false),
    });
  }

  addComplaint(): void {
    if (!this.newMessage.trim()) return;
    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.complaintsService.addComplaint({
      message: this.newMessage.trim(),
      complaintType: this.newType,
      customerName: this.newCustomerName || undefined,
    }).subscribe({
      next: (res: any) => {
        if (res?.succeeded) {
          this.newMessage = '';
          this.newType = 'General';
          this.newCustomerName = '';
          this.loadComplaints();
        } else {
          this.showError = true;
          this.errorMessage = res?.message || 'Failed to add complaint';
        }
      },
      error: (err: any) => {
        this.showError = true;
        this.errorMessage = 'Error adding complaint';
        console.error(err);
      },
      complete: () => (this.loading = false),
    });
  }

  search(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filtered = [...this.complaints];
      return;
    }
    this.filtered = this.complaints.filter(c =>
      (c.customerName || '').toLowerCase().includes(term) ||
      (c.message || '').toLowerCase().includes(term) ||
      (c.complaintType || '').toLowerCase().includes(term) ||
      (c.status || '').toLowerCase().includes(term)
    );
  }
}


