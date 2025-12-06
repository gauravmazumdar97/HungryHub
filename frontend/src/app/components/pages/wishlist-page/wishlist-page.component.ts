import { Component, OnInit } from '@angular/core';
import { WishlistService } from 'src/app/services/wishlist.service';
import { WishlistItem } from 'src/app/shared/models/wishlist';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-wishlist-page',
  templateUrl: './wishlist-page.component.html',
  styleUrls: ['./wishlist-page.component.css']
})
export class WishlistPageComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  isLoading = true;

  constructor(
    private wishlistService: WishlistService,
    private toastrService: ToastrService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (!this.userService.currentUser.token) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.wishlistItems = items;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
        this.toastrService.error('Failed to load wishlist', 'Error');
        this.isLoading = false;
      }
    });
  }

  removeFromWishlist(foodId: string): void {
    this.wishlistService.removeFromWishlist(foodId).subscribe({
      next: () => {
        this.toastrService.success('Removed from wishlist', 'Success');
        this.loadWishlist();
      },
      error: (err) => {
        this.toastrService.error('Failed to remove item', 'Error');
      }
    });
  }
}

