/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
export class BranchesComponent implements OnInit {
  branches: Branch[] = [];
  loading = false;
  showAddModal = false;
  showEditModal = false;
  selectedBranch: Branch | null = null;

  // Form data
  newBranchName = '';
  editBranchName = '';

  // Statistics
  totalBranches = 0;
  activeBranches = 0;
  recentBranches = 0;

  // Error handling
  errorMessage = '';
  showError = false;

  constructor(private branchService: BranchService) {}

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
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newBranchName = '';
  }

  addBranch(): void {
    if (!this.newBranchName.trim()) {
      return;
    }

    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.branchService
      .createBranch({ name: this.newBranchName.trim() })
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

  openEditModal(branch: Branch): void {
    this.selectedBranch = branch;
    this.editBranchName = branch.branchName;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedBranch = null;
    this.editBranchName = '';
  }

  updateBranch(): void {
    if (!this.selectedBranch || !this.editBranchName.trim()) {
      return;
    }

    const updatedBranch: Branch = {
      branchId: this.selectedBranch.branchId,
      branchName: this.editBranchName.trim(),
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
      confirm(`Are you sure you want to delete branch "${branch.branchName}"?`)
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
}
