import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { FoodService } from 'src/app/services/food.service';
import { Food } from 'src/app/shared/models/food';
import { Router } from '@angular/router';
import { WishlistService } from 'src/app/services/wishlist.service';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-food-page',
  templateUrl: './food-page.component.html',
  styleUrls: ['./food-page.component.css']
})
export class FoodPageComponent implements OnInit{
  food!:Food;
  isFavorite = false;
  isLoggedIn = false;

  constructor(
    activatedRoute:ActivatedRoute,
    foodService:FoodService,
    private cartService:CartService, 
    private router:Router,
    private wishlistService: WishlistService,
    private userService: UserService,
    private toastrService: ToastrService
  ){
    this.isLoggedIn = !!this.userService.currentUser.token;
    
    activatedRoute.params.subscribe((params)=>{
      if(params.id) {
        foodService.getFoodById(params.id).subscribe(serverFood => {
          this.food = serverFood;
          if (this.isLoggedIn) {
            this.checkFavorite();
          }
        });
      }
    })
  }
  
  ngOnInit(): void {
    
  }

  checkFavorite(): void {
    this.wishlistService.isFavorite(this.food.id).subscribe({
      next: (response) => {
        this.isFavorite = response.isFavorite;
      }
    });
  }

  toggleFavorite(): void {
    if (this.isFavorite) {
      this.wishlistService.removeFromWishlist(this.food.id).subscribe({
        next: () => {
          this.isFavorite = false;
          this.toastrService.success('Removed from wishlist', 'Success');
        },
        error: () => {
          this.toastrService.error('Failed to remove from wishlist', 'Error');
        }
      });
    } else {
      this.wishlistService.addToWishlist(this.food.id).subscribe({
        next: () => {
          this.isFavorite = true;
          this.toastrService.success('Added to wishlist', 'Success');
        },
        error: () => {
          this.toastrService.error('Failed to add to wishlist', 'Error');
        }
      });
    }
  }

  addToCart(){
    this.cartService.addToCart(this.food);
    this.router.navigateByUrl('/cart-page');

  }

}
