import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FoodService } from 'src/app/services/food.service';
import { Food } from 'src/app/shared/models/food';
import { WishlistService } from 'src/app/services/wishlist.service';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  foods:Food[] = [];
  favorites: {[key: string]: boolean} = {};
  isLoggedIn = false;

  constructor(
    private foodService:FoodService, 
    activatedRoute:ActivatedRoute,
    private wishlistService: WishlistService,
    private userService: UserService,
    private toastrService: ToastrService,
    private router: Router
  ) { 
    this.isLoggedIn = !!this.userService.currentUser.token;
    
    let foodsObservable:Observable<Food[]>;
    activatedRoute.params.subscribe((params)=>{
      if(params.searchTerm)
        foodsObservable = this.foodService.getAllFoodBySearchItem(params.searchTerm);
      else if(params.tag)
        foodsObservable=this.foodService.getAllFoodsByTag(params.tag);
      else
        foodsObservable = foodService.getAll();

        foodsObservable.subscribe({
          next: (serverFoods) => {
          this.foods = serverFoods;
          if (this.isLoggedIn) {
            this.loadFavorites();
            }
          },
          error: (err) => {
            console.error('Error loading foods:', err);
            // If unauthorized, redirect to login
            if (err.status === 401 || err.status === 403) {
              this.toastrService.error('Please login to view food items', 'Authentication Required');
              this.router.navigateByUrl('/login?returnUrl=' + encodeURIComponent(this.router.url));
            } else {
              this.toastrService.error('Failed to load food items. Please try again later.', 'Error');
            }
            this.foods = [];
          }
        })
    })
  }
  
  get isAdmin(): boolean {
    return this.userService.currentUser.isAdmin;
  }

  ngOnInit(): void{

  }

  loadFavorites(): void {
    this.foods.forEach(food => {
      this.wishlistService.isFavorite(food.id).subscribe({
        next: (response) => {
          this.favorites[food.id] = response.isFavorite;
        }
      });
    });
  }

  toggleFavorite(event: Event, food: Food): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.favorites[food.id]) {
      this.wishlistService.removeFromWishlist(food.id).subscribe({
        next: () => {
          this.favorites[food.id] = false;
          this.toastrService.success('Removed from wishlist', 'Success');
        },
        error: () => {
          this.toastrService.error('Failed to remove from wishlist', 'Error');
        }
      });
    } else {
      this.wishlistService.addToWishlist(food.id).subscribe({
        next: () => {
          this.favorites[food.id] = true;
          this.toastrService.success('Added to wishlist', 'Success');
        },
        error: () => {
          this.toastrService.error('Failed to add to wishlist', 'Error');
        }
      });
    }
  }

}
