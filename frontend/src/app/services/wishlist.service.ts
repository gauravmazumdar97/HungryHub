import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WishlistItem } from '../shared/models/wishlist';
import { Food } from '../shared/models/food';
import { 
  WISHLIST_MY_URL, 
  WISHLIST_ADD_URL, 
  WISHLIST_REMOVE_URL, 
  WISHLIST_CHECK_URL 
} from '../shared/constants/urls';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlist: WishlistItem[] = [];

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    this.loadWishlist();
  }

  loadWishlist(): void {
    if (!this.userService.currentUser.token) return;

    // Auth interceptor will automatically add the token
    this.http.get<WishlistItem[]>(WISHLIST_MY_URL)
      .subscribe({
        next: (wishlist) => {
          this.wishlist = wishlist;
        },
        error: (err) => {
          console.error('Error loading wishlist:', err);
        }
      });
  }

  getWishlist(): Observable<WishlistItem[]> {
    // Auth interceptor will automatically add the token
    return this.http.get<WishlistItem[]>(WISHLIST_MY_URL);
  }

  addToWishlist(foodId: string): Observable<WishlistItem> {
    // Auth interceptor will automatically add the token
    return this.http.post<WishlistItem>(
      WISHLIST_ADD_URL + foodId,
      {}
    );
  }

  removeFromWishlist(foodId: string): Observable<any> {
    // Auth interceptor will automatically add the token
    return this.http.delete(WISHLIST_REMOVE_URL + foodId);
  }

  isFavorite(foodId: string): Observable<{ isFavorite: boolean }> {
    // Auth interceptor will automatically add the token
    return this.http.get<{ isFavorite: boolean }>(WISHLIST_CHECK_URL + foodId);
  }

  getWishlistCount(): number {
    return this.wishlist.length;
  }
}

