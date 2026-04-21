import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiController } from 'services/CarRental.serviceEnd';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-add-database',
  standalone: true,
  imports: [MaterialModule,CommonModule, FormsModule],
  templateUrl: './add-database.component.html'
})
export class AddDatabaseComponent {
  loading=false;
  alert = 'd-none';
  msg = ' بيانات العميل';
  DatabaseName = '';
  constructor(private apiController: ApiController) 
     {}
  submit() {
    this.loading = true;
  
    if (this.DatabaseName === '')
       {
      this.alert = 'alert alert-danger';
      this.msg = 'يجب ادخال اسم قاعدة البيانات';
      this.loading = false;
      return;
    }
  
    
    const apiUrl = 'api/DatabaseOperation/AddDatabase?DatabaseName=' + this.DatabaseName;
  
    this.apiController.getApi(apiUrl).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.alert = 'alert alert-success';
          this.msg =  'تم تنفيذ الاجراء بنجاح' ;
          this.DatabaseName=='';
        } else {
          this.alert = 'alert alert-danger';
          this.msg = res.message || 'حدثت خطأ اثناء الحفظ';
        }
      },
      error: (err) => {
        console.error('Error saving Database:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
