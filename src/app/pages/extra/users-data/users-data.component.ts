 
 
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ChangeDetectorRef } from '@angular/core';
import {
  FormGroup,
  Validators,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ApiController } from 'services/CarRental.serviceEnd';
import { MaterialModule } from 'src/app/material.module';
import { ImageModule } from 'primeng/image';
import { VEHICLE_TYPES } from 'src/app/lookups/vehicle-types';

@Component({
  selector: 'app-users-data',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ImageModule,
  ],
  templateUrl: './users-data.component.html',
})
export class UsersDataComponent implements AfterViewInit {
  userList: any[] = [];
  fuserList: any[] = [];
  jobList: any[] = [];
  departmentList: any[] = [];
  usersList: any[] = [];
  PermissionList: any[] = [];
  selectedPermissionId: number = 1; // Default to permission ID 1
  branches: any[] = [];
  managers: any[] = [];
  filteredBranches: any[] = [];
  filteredManagers: any[] = [];
  vehicleTypes = VEHICLE_TYPES;
  User: any = {
    id: 0,
    nameAr: '',
    nameEn: '',
    email: '',
    jobId: null,
    deptId: 0,
    hireDate: '',
    salary: 0,
    gender: '',
    birthDate: '',
    matiralStatus: '',
    nationalId: '',
    nationality: '',
    mobileNo: '',
    religion: '',
    address: '',
    managerId: 0,
    userName: '',
    userPassword: '',
    isActive: true,
    userPhoto: null,
    userPhoto2: null,
    userPhoto3: null,
    userPhoto4: null,
    userPhoto5: null,
    vehicleLicenseNumber: '',
    vehicleType: '',
    licenseExpirationDate: '',
    branchId: 0,
  };
  alert: string = 'd-none';
  msg: string = ' بيانات الحساب';
  loading: boolean = false;
  IsDtl: boolean = false;
  //----------------------------------
  registrationForm: FormGroup;
  photoError: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  paginationLoading: boolean = false;

  // Make Math available in template
  Math = Math;

  get isCourier() {
    return Number(this.User.jobId) === 1; // 1 = Courier
  }

  get isManager() {
    return Number(this.User.jobId) === 2; // 2 = Manager
  }

  constructor(
    private fb: NonNullableFormBuilder,
    private apiController: ApiController,
    private cdr: ChangeDetectorRef
  ) {
    this.registrationForm = this.fb.group({
      nameAr: [
        '',
        [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]+$/)],
      ],
      nameEn: ['', [Validators.pattern(/^[A-Za-z\s]+$/)]], // Not required
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      jobId: [0, [Validators.min(1)]],
      deptId: [0, [Validators.min(1)]],
      branchId: [0, [Validators.min(1)]],
      hireDate: ['', [Validators.required, this.futureDateValidator()]],
      salary: [
        null,
        [Validators.required, Validators.min(0), this.numericValidator()],
      ],
      gender: [
        'Male',
        [Validators.required, Validators.pattern(/^(Male|Female)$/)],
      ],
      birthDate: ['', [Validators.required, this.futureDateValidator()]],
      matiralStatus: [0, [Validators.required, Validators.min(1)]],
      nationalId: ['', [Validators.required, this.nationalIdValidator()]],
      nationality: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      religion: ['', [Validators.required, Validators.minLength(4)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      managerId: [0, [Validators.min(1)]],
      userName: ['', [Validators.required, Validators.minLength(4)]],
      userPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/),
        ],
      ],
      isActive: [true],
    });
  }

  // Custom validators
  private nationalIdValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Check if it's exactly 14 digits
      if (!/^\d{14}$/.test(value)) {
        return {
          invalidNationalId: {
            message: 'National ID must be exactly 14 digits',
          },
        };
      }

      // Validate Egyptian National ID format
      const centuryDigit = Number(value[0]);
      const year = Number(value.substring(1, 3));
      const month = Number(value.substring(3, 5));
      const day = Number(value.substring(5, 7));

      // Century validation
      if (centuryDigit !== 2 && centuryDigit !== 3) {
        return {
          invalidNationalId: {
            message: 'Invalid century digit in National ID',
          },
        };
      }

      // Year validation
      if (year < 0 || year > 99) {
        return {
          invalidNationalId: { message: 'Invalid year in National ID' },
        };
      }

      // Month validation
      if (month < 1 || month > 12) {
        return {
          invalidNationalId: { message: 'Invalid month in National ID' },
        };
      }

      // Day validation
      if (day < 1 || day > 31) {
        return { invalidNationalId: { message: 'Invalid day in National ID' } };
      }

      // Additional day validation for specific months
      const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (day > monthDays[month - 1]) {
        return {
          invalidNationalId: { message: 'Invalid day for the specified month' },
        };
      }

      return null;
    };
  }

  private futureDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      if (inputDate > today) {
        return { futureDate: { message: 'Date cannot be in the future' } };
      }

      return null;
    };
  }

  private numericValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Check if it's a valid number
      if (isNaN(value) || !isFinite(value)) {
        return { invalidNumber: { message: 'Please enter a valid number' } };
      }

      // Check if it's negative
      if (Number(value) < 0) {
        return { negativeNumber: { message: 'Salary cannot be negative' } };
      }

      return null;
    };
  }

  get fc() {
    return this.registrationForm.controls;
  }

  ngAfterViewInit(): void {
    this.GetAllUser();
    this.GetUserLookup();
    // this.jobList = [
    //   { jobId: 1, jobTitle: 'Courier' },
    //   { jobId: 2, jobTitle: 'Manager' },
    // ];

    // this.GetAllUser();
    // this.GetUserLookup();

    // NEW: load branches & managers for autocomplete
    this.loadBranches();
    this.loadManagers();
  }

  loadBranches() {
    this.apiController.getApi('api/Branch/GetBranch').subscribe({
      next: (res: any) => {
        this.branches = Array.isArray(res?.data) ? res.data : [];
        this.filteredBranches = this.branches;
      },
      error: (err) => console.error(err),
    });
  }

  // NEW: load managers (filter on userId === 2 as requested)
  loadManagers() {
    this.apiController.getApi('auth/Auth/getAllUsersNames').subscribe({
      next: (res: any) => {
        const users = Array.isArray(res?.data) ? res.data : [];
        console.log('All users:', users);
        // The requirement says "filter on userId 2"
        // If that means "only include the user with id = 2":
        this.managers = users.filter((u: any) => Number(u?.jobId) === 1);
        this.filteredManagers = this.managers;
      },
      error: (err) => console.error(err),
    });
  }

  onNationalIdChange() {
    const id = (this.User.nationalId || '').trim();
    if (!/^\d{14}$/.test(id)) return;

    const centuryDigit = Number(id[0]);
    const year = Number(id.substring(1, 3));
    const month = Number(id.substring(3, 5));
    const day = Number(id.substring(5, 7));
    const genderDigit = Number(id[12]); // 13th digit (0-based index 12)

    const centuryBase =
      centuryDigit === 2 ? 1900 : centuryDigit === 3 ? 2000 : null;
    if (!centuryBase) return;

    const fullYear = centuryBase + year;
    
    // Extract gender from 13th digit
    // Even numbers (0, 2, 4, 6, 8) = Male
    // Odd numbers (1, 3, 5, 7, 9) = Female
    this.User.gender = genderDigit % 2 !== 0 ? 'Male' : 'Female';
    
    // Validate month/day quickly
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      // Save as yyyy-MM-dd for the date input
      const mm = month.toString().padStart(2, '0');
      const dd = day.toString().padStart(2, '0');
      this.User.birthDate = `${fullYear}-${mm}-${dd}`;
    }
  }

  // Helper to turn <input type="month" value=YYYY-MM> into MM/YYYY for backend
  private monthToMmYyyy(value: string): string {
    // value like "2026-03" -> "03/2026"
    if (!value || !/^\d{4}-\d{2}$/.test(value)) return '';
    const [yyyy, mm] = value.split('-');
    return `${mm}/${yyyy}`;
  }

  // License number formatting - remove dashes when typing
  onLicenseNumberInput(event: any) {
    const input = event.target;
    const value = input.value;
    // Remove all dashes and non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
    if (value !== cleaned) {
      input.value = cleaned;
      this.User.vehicleLicenseNumber = cleaned;
    }
  }

  // Autocomplete filters
  filterBranches(q: string) {
    const s = (q || '').toLowerCase();
    this.filteredBranches = this.branches.filter((b) =>
      JSON.stringify(b).toLowerCase().includes(s)
    );
  }

  filterManagers(q: string) {
    const s = (q || '').toLowerCase();
    this.filteredManagers = this.managers.filter((m) =>
      JSON.stringify(m).toLowerCase().includes(s)
    );
  }

  GetUserLookup() {
    this.apiController.getApi('api/Lookup/UserLookup').subscribe({
      next: (res: any) => {
        if (res && res.data) {
          console.log('UserLookup Full Response:', res);
          // Handle both camelCase and PascalCase from backend
          const data = res.data;
          this.jobList = data.jobList || data.JobList || [];
          this.departmentList = data.departmentList || data.DepartmentList || [];
          this.usersList = data.userList || data.UserList || [];
          this.PermissionList = data.permissionList || data.PermissionList || [];
          
          console.log('Processed jobList:', this.jobList);
        } else {
          console.warn('UserLookup returned null or empty data');
          this.jobList = [];
          this.departmentList = [];
          this.PermissionList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching UserLookup:', err);
      },
    });
  }
  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.photoError = 'Only image files are allowed!';
        this.User[field] = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.photoError = 'Image size must be less than 5MB!';
        this.User[field] = null;
        return;
      }
      this.photoError = '';
      this.User[field] = file;
    }
  }

  submit() {
    // Enhanced validation with specific error messages
    if (this.isCourier) {
      const validationErrors: string[] = [];

      // Required field validation
      const requiredFields = [
        { field: 'nameAr', label: 'Arabic Name' },
        { field: 'email', label: 'Email' },
        { field: 'jobId', label: 'Job' },
        { field: 'deptId', label: 'Department' },
        { field: 'hireDate', label: 'Hire Date' },
        { field: 'salary', label: 'Salary' },
        { field: 'gender', label: 'Gender' },
        { field: 'birthDate', label: 'Birth Date' },
        { field: 'matiralStatus', label: 'Marital Status' },
        { field: 'nationalId', label: 'National ID' },
        { field: 'nationality', label: 'Nationality' },
        { field: 'mobileNo', label: 'Mobile Number' },
        { field: 'religion', label: 'Religion' },
        { field: 'address', label: 'Address' },
        { field: 'managerId', label: 'Manager' },
        { field: 'userName', label: 'Username' },
        { field: 'userPassword', label: 'Password' },
        { field: 'vehicleLicenseNumber', label: 'Vehicle License Number' },
        { field: 'vehicleType', label: 'Vehicle Type' },
        { field: 'licenseExpirationDate', label: 'License Expiration Date' },
      ];

      requiredFields.forEach(({ field, label }) => {
        console.log(`Validating field: ${field}, value: ${this.User[field]}`);
        if (
          !this.User[field] ||
          this.User[field] === '-' ||
          this.User[field] === 0 ||
          this.User[field] === ''
        ) {
          validationErrors.push(label);
        }
      });

      // Specific validations
      if (this.User.nationalId && this.User.nationalId !== '-') {
        const nationalIdError = this.validateNationalId(this.User.nationalId);
        if (nationalIdError) {
          validationErrors.push(`National ID: ${nationalIdError}`);
        }
      }

      if (this.User.birthDate && this.User.birthDate !== '-') {
        const birthDateError = this.validateFutureDate(this.User.birthDate);
        if (birthDateError) {
          validationErrors.push(`Birth Date: ${birthDateError}`);
        }
      }

      if (this.User.hireDate && this.User.hireDate !== '-') {
        const hireDateError = this.validateFutureDate(this.User.hireDate);
        if (hireDateError) {
          validationErrors.push(`Hire Date: ${hireDateError}`);
        }
      }

      if (this.User.salary !== undefined && this.User.salary !== null) {
        const salaryError = this.validateSalary(this.User.salary);
        if (salaryError) {
          validationErrors.push(`Salary: ${salaryError}`);
        }
      }

      if (validationErrors.length > 0) {
        this.alert = 'alert alert-danger';
        this.msg = `Validation errors: ${validationErrors.join(', ')}`;
        return;
      }
    } else {
      // Manager or other jobs: only username & password
      if (!this.User.userName || !this.User.userPassword) {
        this.alert = 'alert alert-danger';
        this.msg = `Username and password are required`;
        return;
      }
    }

    const formData = new FormData();

    console.log('Selected Permission ID:', this.selectedPermissionId);
    if (!this.selectedPermissionId) {
      console.log('No permission selected, assigning default permission id 1');
      this.selectedPermissionId = 1;
    }

    // Ensure job id is exactly 1 (Courier) or 2 (Manager)
    if (this.isCourier) this.User.jobId = 1;
    else if (this.isManager) this.User.jobId = 2;

    // append normal fields, excluding file fields
    Object.keys(this.User).forEach((key) => {
      const skipFiles = [
        'userPhoto',
        'userPhoto2',
        'userPhoto3',
        'userPhoto4',
        'userPhoto5',
      ];
      if (skipFiles.includes(key)) return;

      let value = this.User[key];

      // convert licenseExpirationDate to MM/YYYY (backend requirement)
      if (key === 'licenseExpirationDate') {
        value = this.monthToMmYyyy(value);
      }

      if (value !== null && value !== undefined) {
        // capitalize first letter of key first
        key = key.charAt(0).toUpperCase() + key.slice(1);
        formData.append(key, String(value));
      }
    });

    // permissions
    formData.append('PermissionId', this.selectedPermissionId.toString());


    // photos
    [
      'userPhoto',
      'userPhoto2',
      'userPhoto3',
      'userPhoto4',
      'userPhoto5',
    ].forEach((f) => {
      const file = this.User[f];
      if (file) formData.append(f, file, file.name);
    });

    const apiUrl =
      this.User.id === 0 ? 'auth/Auth/Registration' : 'auth/Auth/UpdateUser';

    this.apiController.PostApi(formData, apiUrl).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.alert = 'alert alert-success';
          this.msg =
            this.User.id === 0
              ? 'Saved successfully!'
              : 'Updated successfully!';
          this.GoToAdd();
        } else {
          this.alert = 'alert alert-danger';
          this.msg = res.message || 'An error occurred while saving';
        }
      },
      error: (err) => {
        console.error('Error saving user:', err);
        this.alert = 'alert alert-danger';
        this.msg = 'Server error occurred!';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // Validation helper methods
  private validateNationalId(nationalId: string): string | null {
    if (!/^\d{14}$/.test(nationalId)) {
      return 'Must be exactly 14 digits';
    }

    const centuryDigit = Number(nationalId[0]);
    const year = Number(nationalId.substring(1, 3));
    const month = Number(nationalId.substring(3, 5));
    const day = Number(nationalId.substring(5, 7));

    if (centuryDigit !== 2 && centuryDigit !== 3) {
      return 'Invalid century digit';
    }

    if (year < 0 || year > 99) {
      return 'Invalid year';
    }

    if (month < 1 || month > 12) {
      return 'Invalid month';
    }

    if (day < 1 || day > 31) {
      return 'Invalid day';
    }

    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > monthDays[month - 1]) {
      return 'Invalid day for the specified month';
    }

    return null;
  }

  private validateFutureDate(date: string): string | null {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      return 'Cannot be in the future';
    }

    return null;
  }

  private validateSalary(salary: any): string | null {
    if (isNaN(salary) || !isFinite(salary)) {
      return 'Must be a valid number';
    }

    if (Number(salary) < 0) {
      return 'Cannot be negative';
    }

    return null;
  }

  GetAllUser(pageNumber: number = 1, pageSize: number = 5) {
    this.paginationLoading = true;
    const apiUrl = `auth/Auth/GetAllUser?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    this.apiController.getApi(apiUrl).subscribe({
      next: (res: any) => {
        if (res !== null) {
          console.log(res);

          this.currentPage = pageNumber;
          this.pageSize = res.data.pageSize || pageSize;
          this.totalRecords = res.data.totalCount || 0;
          this.totalPages = res.data.totalPages || 0;

          console.log('Total Pages:', this.totalPages);
          console.log('Current Page:', this.currentPage);
          console.log('Page Size:', this.pageSize);

          // Process user data
          if (res.data && Array.isArray(res.data.items)) {
            res.data.items.forEach((user: any) => {
              if (!user.mobileNo || user.mobileNo.trim() === '') {
                user.mobileNo = 'N/A';
              }
              if (!user.nameEn || user.nameEn.trim() === '') {
                user.nameEn = 'N/A';
              }
              if (!user.jobId) {
                user.jobTitle = 'N/A';
              }
              if (user.isActive === null) {
                user.isActive = false;
              }
            });
            console.log(res.data.items);

            this.userList = res.data.items;
            this.fuserList = res.data.items;
          } else {
            this.userList = [];
            this.fuserList = [];
          }
        } else {
          alert('NO DATA For This Emirates');
          this.userList = [];
          this.fuserList = [];
        }
      },
      error: (err) => {
        console.log(err);
        this.userList = [];
        this.fuserList = [];
      },
      complete: () => {
        this.paginationLoading = false;
      },
    });
  }

  userByID(id: number) {
    this.apiController.getApi('auth/Auth/GetUserById?UserId=' + id).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.User = res.data;
          this.IsDtl = true;
          this.alert = 'd-none';

          // Set the selected permission ID from the response
          if (res.data.respPermissionList && res.data.respPermissionList.length > 0) {
            this.selectedPermissionId = res.data.respPermissionList[0].id;
          }

          // If backend returned licenseExpirationDate as "MM/YYYY", convert to "YYYY-MM" to show in <input type="month">
          if (
            this.User.licenseExpirationDate &&
            /^\d{2}\/\d{4}$/.test(this.User.licenseExpirationDate)
          ) {
            const [mm, yyyy] = this.User.licenseExpirationDate.split('/');
            this.User.licenseExpirationDate = `${yyyy}-${mm}`;
          }
        }
        this.setFormValues();
      },
      error: (err) => console.error('Error fetching user by ID:', err),
      complete: () => (this.loading = false),
    });
  }

  onNationalIdInput() {
    this.onNationalIdChange();
  }

  setFormValues() {
    this.User.hireDate = this.formatDate(this.User.hireDate);
    this.User.birthDate = this.formatDate(this.User.birthDate);
    this.registrationForm.patchValue({
      nameAr: this.User.nameAr,
      nameEn: this.User.nameEn,
      email: this.User.email,
      jobId: this.User.jobId,
      deptId: this.User.deptId,
      managerId: this.User.managerId,
      hireDate: this.User.hireDate,
      salary: this.User.salary,
      gender: this.User.gender,
      birthDate: this.User.birthDate,
      matiralStatus: this.User.matiralStatus,
      religion: this.User.religion,
      nationalId: this.User.nationalId,
      nationality: this.User.nationality,
      mobileNo: this.User.mobileNo,
      address: this.User.address,
      userName: this.User.userName,
      userPassword: this.User.userPassword,
      isActive: this.User.isActive,
    });
  }

  // helper method to strip time part
  private formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0]; // yyyy-MM-dd
  }

  returnToAll() {
    this.IsDtl = false;
    this.GetAllUser();
    this.selectedPermissionId = 1; // Reset to default permission
    this.cdr.detectChanges();
  }

  GoToAdd() {
    this.User = {
      id: 0,
      nameAr: '',
      nameEn: '',
      email: '',
      jobId: 0,
      deptId: 0,
      hireDate: '',
      salary: 0,
      gender: '',
      birthDate: '',
      matiralStatus: '',
      nationalId: '',
      nationality: '',
      mobileNo: '',
      religion: '',
      address: '',
      managerId: 0,
      userName: '',
      userPassword: '',
      isActive: true,
      userPhoto: null,
      userPhoto2: null,
      userPhoto3: null,
      userPhoto4: null,
      userPhoto5: null,
      vehicleLicenseNumber: '',
      vehicleType: '',
      licenseExpirationDate: '',
      branchId: 0,
    };
    this.IsDtl = true;
    this.alert = 'd-none';
    this.selectedPermissionId = 1; // Default to permission ID 1
    this.cdr.detectChanges();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.apiController.PostApi({ id }, 'auth/Auth/DeleteUser').subscribe({
        next: (res) => {
          if (res.succeeded) {
            this.alert = 'alert alert-success';
            this.msg = 'User deleted successfully!';
            this.GetAllUser();
          } else {
            this.alert = 'alert alert-danger';
            this.msg = res.message || 'An error occurred while deleting';
          }
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.alert = 'alert alert-danger';
          this.msg = 'Server error occurred!';
        },
      });
    }
  }


  searchText($event: any) {
    const input = $event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    if (searchTerm.trim() === '') {
      this.fuserList = this.userList;
    } else {
      // Filter within current page data
      this.fuserList = this.userList.filter(
        (user) =>
          (user.nameEn && user.nameEn.toLowerCase().includes(searchTerm)) ||
          (user.nameAr && user.nameAr.toLowerCase().includes(searchTerm)) ||
          (user.email && user.email.toLowerCase().includes(searchTerm)) ||
          (user.mobileNo && user.mobileNo.includes(searchTerm))
      );
    }
  }


  // Pagination methods
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.GetAllUser(this.currentPage, this.pageSize);
    }
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset to first page
    this.GetAllUser(this.currentPage, this.pageSize);
  }

  onPageSizeSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);
    this.onPageSizeChange(newPageSize);
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7; // Show more pages for better navigation

    if (this.totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Google-style pagination with ellipsis
      const currentPage = this.currentPage;
      const totalPages = this.totalPages;

      // Always show first page
      pages.push(1);
      console.log('Current Pague:', currentPage);
      if (currentPage <= 4) {
        // Show pages 1, 2, 3, 4, 5, ..., last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first, ..., last-4, last-3, last-2, last-1, last
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first, ..., current-1, current, current+1, ..., last
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }

  goToFirstPage() {
    this.onPageChange(1);
  }

  goToLastPage() {
    this.onPageChange(this.totalPages);
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  // Method to handle direct page input
  onPageInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const pageNumber = parseInt(target.value, 10);

    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.onPageChange(pageNumber);
    } else {
      // Reset to current page if invalid input
      target.value = this.currentPage.toString();
    }
  }

  // Method to handle Enter key on page input
  onPageInputKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const target = event.target as HTMLInputElement;
      this.onPageInput(event);
    }
  }

  // Helper method to handle page number clicks
  onPageNumberClick(page: number | string) {
    if (typeof page === 'number') {
      this.onPageChange(page);
    }
  }
}
