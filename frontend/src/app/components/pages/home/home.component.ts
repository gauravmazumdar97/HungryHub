import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private toastrService: ToastrService
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

        foodsObservable.subscribe((serverFoods) => {
          this.foods = serverFoods;
          if (this.isLoggedIn) {
            this.loadFavorites();
          }
        })
    })
  
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
