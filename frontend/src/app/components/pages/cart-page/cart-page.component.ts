import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
// ✅ Keep your specific import names here
import { Cart } from 'src/app/shared/models/carts';       
import { CartItem } from 'src/app/shared/models/cartsItems'; 

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit {
  
  cart!: Cart;
  
  // 👇 THESE ARE THE MISSING VARIABLES CAUSING YOUR ERRORS 👇
  couponCode: string = '';
  isCouponApplied: boolean = false;
  discountAmount: number = 0;
  // 👆 -------------------------------------------------- 👆

  constructor(private cartService: CartService) {
    this.cartService.getCartObservable().subscribe((cart) => {
      this.cart = cart;
    });
  }

  ngOnInit(): void {
  }

  removeFromCart(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem.food.id);
    this.resetCoupon(); // Reset coupon if items change
  }

  changeQuantity(cartItem: CartItem, quantityInString: string) {
    const quantity = parseInt(quantityInString);
    this.cartService.changeQuantity(cartItem.food.id, quantity);
    this.resetCoupon(); // Reset coupon if price changes
  }

  // 👇 THIS IS THE MISSING FUNCTION 👇
  applyCoupon() {
    if (!this.couponCode) {
      alert("Please enter a coupon code");
      return;
    }

    // This calls the service (Make sure validateCoupon exists in CartService!)
    this.cartService.validateCoupon(this.couponCode.toUpperCase()).subscribe({
      next: (coupon: any) => {
        // 1. Get discount percent (e.g., 10)
        const percent = coupon.discountPercent; 
        
        // 2. Calculate how much to subtract
        this.discountAmount = (this.cart.totalPrice * percent) / 100;
        
        // 3. Update the total price
        this.cart.totalPrice = this.cart.totalPrice - this.discountAmount;
        
        this.isCouponApplied = true;
      },
      error: (err: any) => {
        console.error(err);
        alert("Invalid or Expired Coupon Code");
        this.couponCode = ''; 
        this.isCouponApplied = false;
      }
    });
  }

  // Helper to reset coupon if user changes cart items
  resetCoupon() {
    if (this.isCouponApplied) {
      this.isCouponApplied = false;
      this.couponCode = '';
      this.discountAmount = 0;
    }
  }
}