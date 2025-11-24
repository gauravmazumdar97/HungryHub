import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 🔑 Import the new standalone component
import { AdminInventoryComponent } from './components/pages/admin/admin-inventory/admin-inventory.component';

// Assuming you have other core components (Home, FoodPage, Cart)
// import { HomeComponent } from './components/pages/home/home.component'; 
// import { FoodPageComponent } from './components/pages/food-page/food-page.component'; 
// import { CartPageComponent } from './components/pages/cart-page/cart-page.component'; 
// import { AuthGuard } from './guards/auth.guard'; // Example of a regular user guard

// NOTE: You must create this guard!
// import { AdminGuard } from './guards/admin.guard'; 

const routes: Routes = [
  // { path: '', component: HomeComponent },
  // { path: 'food/:id', component: FoodPageComponent },
  // { path: 'cart', component: CartPageComponent, canActivate: [AuthGuard] },
  
  // 🔑 NEW ADMIN INVENTORY ROUTE
  { 
    path: 'admin/inventory', 
    component: AdminInventoryComponent,
    // This is crucial: Use an AdminGuard to protect this route.
    // Replace 'true' with 'canActivate: [AdminGuard]' once implemented.
    canActivate: [() => true] // Placeholder for now
  },

  // { path: '**', redirectTo: '' } // Catch all other paths
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
