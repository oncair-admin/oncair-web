import { Component, OnChanges, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="branding">
      <a [routerLink]="['/dashboard']">
        <img
          src="./assets/images/logos/images.png"
          class="align-middle m-2"
          alt="logo"
          width="220" height="200"
        />
      
      </a>
    </div>
  `,
})
export class BrandingComponent implements OnInit{
 
  constructor() {
    
   }
  
   ngOnInit() { 
  }
}
