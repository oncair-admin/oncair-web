import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import {  FormGroup, Validators, NonNullableFormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiController } from 'services/CarRental.serviceEnd';
import { MaterialModule } from 'src/app/material.module';
import { ImageModule } from 'primeng/image';
@Component({
  selector: 'app-users-data',
  standalone: true,
  imports: [MaterialModule,CommonModule, ReactiveFormsModule,FormsModule, ImageModule ],
  templateUrl: './users-data.component.html'
})
export class UsersDataComponent  implements AfterViewInit{

userList: any[]=[];
 fuserList: any[]=[];
 jobList: any[]=[];  departmentList: any[]=[];  usersList: any[]=[]; 
 PermissionList: any[]=[];
 selectedPermissions: number[] = []; // Class-level array to hold selected IDs
  User: any = {
    id: 0,
    nameAr: '',
    nameEn: '',
    email: '',
    jobId: 0,
    deptId: 0,
    hireDate:'' ,
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
    userPhoto: null,   // 👈 file will be stored here
    userPhoto2: null,   // 👈 file will be stored here
    userPhoto3: null ,  // 👈 file will be stored here
    userPhoto4: null,   // 👈 file will be stored here
    userPhoto5: null ,  // 👈 file will be stored here
  };
  alert: string = 'd-none';
  msg: string = ' بيانات الحساب';
  loading:boolean=false;
  IsDtl:boolean=false;
  //----------------------------------
   registrationForm: FormGroup;
  photoError: string = "";
   
   constructor(private fb: NonNullableFormBuilder,private apiController: ApiController) {
    this.registrationForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]+$/)]],
      nameEn: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      email: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      jobId: [0, [Validators.min(1)]],
      deptId: [0, [Validators.min(1)]],
      hireDate: ['', Validators.required],
      salary: [null, [Validators.min(0)]],
      gender: ['Male', [Validators.pattern(/^(Male|Female)$/)]],
      birthDate: ['', Validators.required],
      matiralStatus: [0, [Validators.min(1)]],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      nationality: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      religion: ['', Validators.required, Validators.minLength(4)],
      address: ['', Validators.required, Validators.minLength(10)],
      managerId: [0, [Validators.min(1)]],
      userName: ['', [Validators.required, Validators.minLength(4)]],
      userPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)]],
      isActive: [true]
    });
  }
   get fc() {
  return this.registrationForm.controls;
}
   ngAfterViewInit(): void {
    this.GetAllUser();
    this. GetUserLookup()
 }
 GetUserLookup() {
  this.apiController.getApi('api/Lookup/UserLookup').subscribe({
    next: (res:any) => {
      if (res !== null) {
        console.log(res.data);
        this.jobList = res.data.jobList;
         this.departmentList = res.data.departmentList; 
         this.usersList = res.data.userList;
         this.PermissionList = res.data.permissionList
      } else {
        alert('NO DATA For This Emirates');
      }
    },
    error: (err) => {
      console.log(err);
    },
  });
}
//  onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       if (!file.type.startsWith('image/')) {
//         this.photoError = "Only image files are allowed!";
//         this.User.userPhoto = null;
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         this.photoError = "Image size must be less than 5MB!";
//        this.User.userPhoto  = null;
//         return;
//       }
//       this.photoError = "";
//       this.User.userPhoto  = file;
//     }
//   }
  onFileChange(event: any, field: string) {
  const file = event.target.files[0];
  if (file) {if (!file.type.startsWith('image/')) {
        this.photoError = "Only image files are allowed!";
        this.User[field] = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.photoError = "Image size must be less than 5MB!";
       this.User[field]  = null;
        return;
      }
      this.photoError = "";
    this.User[field] = file;
  }
}
   
submit() {debugger;
// if (this.registrationForm.invalid ) {
//       this.alert = "alert alert-danger";
//         this.msg ="Please enter the data correctly";
//       return;
//     }
  const formData = new FormData();

  // append all normal fields (convert to string)
  Object.keys(this.User).forEach((key) => {
    const value = this.User[key];
    if (value !== null && value !== undefined && this.User[key]!='userPhoto' && this.User[key]!='userPhoto2'
       && this.User[key]!='userPhoto3' && this.User[key]!='userPhoto4' && this.User[key]!='userPhoto5')
       {
      formData.append(key, value.toString());
    }
    // ✅ Option 1: send as repeated fields
  
  });
  this.selectedPermissions.forEach((p: number) => {
    formData.append('selectedPermissions', p.toString());
  });
debugger;
  //append photo files (saved from file inputs)
  if (this.User.userPhoto) {
    formData.append("userPhoto", this.User.userPhoto, this.User.userPhoto.name);
  }
  if (this.User.userPhoto2) {
    formData.append("userPhoto2", this.User.userPhoto2, this.User.userPhoto2.name);
  }
  if (this.User.userPhoto3) {
    formData.append("userPhoto3", this.User.userPhoto3, this.User.userPhoto3.name);
  }
  if (this.User.userPhoto4) {
    formData.append("userPhoto4", this.User.userPhoto4, this.User.userPhoto4.name);
  }
  if (this.User.userPhoto5) {
    formData.append("userPhoto5", this.User.userPhoto5, this.User.userPhoto5.name);
  }

  const apiUrl = this.User.id === 0 ? "auth/Auth/Registration" : "auth/Auth/UpdateUser";

  this.apiController.PostApi(formData, apiUrl).subscribe({
    next: (res) => {
      if (res.succeeded) {
        this.alert = "alert alert-success";
        this.msg = this.User.id === 0 ? "Saved successfully!" : "Updated successfully!";
       this.GoToAdd();
      } else {
        this.alert = "alert alert-danger";
        this.msg = res.message || "An error occurred while saving";
      }
    },
    error: (err) => {
      console.error("Error saving user:", err);
      this.alert = "alert alert-danger";
      this.msg = "Server error occurred!";
    },
    complete: () => {
      this.loading = false;
    },
  });
}


GetAllUser() {
  this.apiController.getApi('auth/Auth/GetAllUser').subscribe({
    next: (res:any) => {
      if (res !== null) {
        this.userList = res.data;
        this.fuserList = res.data;
      } else {
        alert('NO DATA For This Emirates');
      }
    },
    error: (err) => {
      console.log(err);
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

debugger;
        // Patch permissions and update the selected states
        this.selectedPermissions = res.data.respPermissionList.map((p: any) => p.id);
        this.PermissionList.forEach(permission => {
          permission.isChecked = this.selectedPermissions.includes(permission.id);
        });
      } this.setFormValues()
    },
    error: (err) => {
      console.error('Error fetching user by ID:', err);
    },
    complete: () => {
      this.loading = false;
    }
  });
}
setFormValues() {
  this.User.hireDate= this.formatDate(this.User.hireDate)
  this.User.birthDate= this.formatDate(this.User.birthDate)
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

 returnToAll() 
    {
      this.IsDtl=false;
      this.GetAllUser();
      this.PermissionList.forEach(permission => {
        permission.isChecked = false; // Uncheck all checkboxes
      });
    }
    GoToAdd()
    { this.alert = 'd-none';
      this.IsDtl=true;
      this.User.id= 0;
    this.User.nameAr= '';
    this.User.nameEn= '';
    this.User.email= '';
    this.User.jobId= 0;
    this.User.deptId= 0,
    this.User.hireDate= '';
    this.User.salary= 0;
    this.User.gender= '0';
    this.User.birthDate= '';
    this.User.matiralStatus= '';
    this.User.nationalId= '';
    this.User.nationality= '';
    this.User.mobileNo= '';
    this.User.religion= '';
    this.User.address= '',
    this.User.managerId= 0;
    this.User.userName= '';
    this.User.userPassword= '';
    this.User.isActive= true;
    this.User.userPhoto= null;
    }
    searchText($event:any)
    {
      const input=$event.target as HTMLInputElement;
      this.fuserList=this.userList.filter((users) =>
       users.nameEn.toLocaleUpperCase().includes(input.value.toLocaleUpperCase())
    
      );
    }
   

    getValue($event: any, id: number) {
      const isChecked = $event.target.checked; // Use `checked` for checkboxes
      if (isChecked) {
        if (!this.selectedPermissions.includes(id)) {
          this.selectedPermissions.push(id); // Add to array if not already there
        }
      } else {
        this.selectedPermissions = this.selectedPermissions.filter(i => i !== id); // Remove from array
      }
  
      console.log('Selected Permissions:', this.selectedPermissions);
    }
  
}

