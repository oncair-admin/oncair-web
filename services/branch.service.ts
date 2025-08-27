/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {} from 'rxjs/operators';
import { ApiController } from './CarRental.serviceEnd';

export interface Branch {
  branchId: number;
  branchName: string;
}

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  // Mock data for testing

  constructor(private apiController: ApiController) {}

  // Get all branches
  getBranches(): Observable<any> {
    // For now, return mock data. Uncomment the API call when ready
    // return of({
    //   succeeded: true,
    //   data: this.mockBranches,
    //   message: 'Branches loaded successfully',
    // }).pipe(delay(1000)); // Simulate API delay

    // Uncomment when API is ready:
    return this.apiController.getApi('api/Branch/getBranch');
  }

  // Get branch by ID
  getBranchById(id: number): Observable<any> {
    // const branch = this.mockBranches.find((b) => b.id === id);
    // return of({
    //   succeeded: !!branch,
    //   data: branch,
    //   message: branch ? 'Branch found' : 'Branch not found',
    // }).pipe(delay(500));

    // Uncomment when API is ready:
    return this.apiController.getApi(`/api/Branch/GetBranchById?id=${id}`);
  }

  // Create new branch
  createBranch(branch: { name: string }): Observable<any> {
    // const newBranch: Branch = {
    //   id: this.nextId++,
    //   name: branch.name,
    // };
    // this.mockBranches.push(newBranch);

    // return of({
    //   succeeded: true,
    //   data: newBranch,
    //   message: 'Branch created successfully',
    // }).pipe(delay(1000));

    // Uncomment when API is ready:
    // create random id between 0, and 1000000000

    const body = { branchId: 0, branchName: branch.name };
    return this.apiController.PostApi(body, 'api/Branch/AddBranch');
  }

  // Update branch
  updateBranch(branch: Branch): Observable<any> {
    // const index = this.mockBranches.findIndex((b) => b.id === branch.id);
    // if (index !== -1) {
    //   this.mockBranches[index] = branch;
    //   return of({
    //     succeeded: true,
    //     data: branch,
    //     message: 'Branch updated successfully',
    //   }).pipe(delay(1000));
    // } else {
    //   return throwError(() => new Error('Branch not found'));
    // }

    // Uncomment when API is ready:
    return this.apiController.PostApi(branch, 'api/Branch/UpdateBranch');
  }

  // Delete branch
  deleteBranch(id: number): Observable<any> {
    // const index = this.mockBranches.findIndex((b) => b.id === id);
    // if (index !== -1) {
    //   this.mockBranches.splice(index, 1);
    //   return of({
    //     succeeded: true,
    //     data: null,
    //     message: 'Branch deleted successfully',
    //   }).pipe(delay(1000));
    // } else {
    //   return throwError(() => new Error('Branch not found'));
    // }

    // Uncomment when API is ready:
    return this.apiController.PostApi({ id }, 'api/Branches/Delete');
  }
}
