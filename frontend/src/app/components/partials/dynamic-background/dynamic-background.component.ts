import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dynamic-background',
  templateUrl: './dynamic-background.component.html',
  styleUrls: ['./dynamic-background.component.css']
})
export class DynamicBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('currentImg', { static: false }) currentImgElement!: ElementRef<HTMLDivElement>;
  @ViewChild('nextImg', { static: false }) nextImgElement!: ElementRef<HTMLDivElement>;

  // Default background image
  defaultImage: string = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80';
  
  // Cart page background image
  cartPageImage: string = 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1920&q=80';
  
  // Wishlist page background image
  wishlistPageImage: string = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1920&q=80';
  
  // Checkout page background image
  checkoutPageImage: string = 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=1920&q=80';

  foodImages: string[] = [
    // Background image from Unsplash
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80'
  ];

  currentImageIndex: number = 0;
  currentImage: string = '';
  nextImage: string = '';
  isTransitioning: boolean = false;
  private intervalId: any;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set initial background based on current route
    this.updateBackgroundForRoute();
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBackgroundForRoute();
      });
    
    // Disable automatic image rotation for static background
    // this.intervalId = setInterval(() => {
    //   this.changeImage();
    // }, 6000);
  }

  private updateBackgroundForRoute(): void {
    const currentUrl = this.router.url;
    
    // Check if we're on the cart page
    if (currentUrl.includes('/cart-page')) {
      this.currentImage = this.cartPageImage;
      this.nextImage = this.cartPageImage;
    } 
    // Check if we're on the wishlist page
    else if (currentUrl.includes('/wishlist')) {
      this.currentImage = this.wishlistPageImage;
      this.nextImage = this.wishlistPageImage;
    }
    // Check if we're on the checkout page
    else if (currentUrl.includes('/checkout')) {
      this.currentImage = this.checkoutPageImage;
      this.nextImage = this.checkoutPageImage;
    }
    // Check if we're on the payment page
    else if (currentUrl.includes('/payment')) {
      this.currentImage = this.checkoutPageImage;
      this.nextImage = this.checkoutPageImage;
    }
    else {
      // Use default image for other pages
      this.currentImage = this.defaultImage;
      this.nextImage = this.defaultImage;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  changeImage(): void {
    if (this.isTransitioning) return;
    
    // Get next image index
    const nextIndex = (this.currentImageIndex + 1) % this.foodImages.length;
    
    // Update next image (this will be shown during transition)
    this.nextImage = this.foodImages[nextIndex];
    
    // Start transition
    this.isTransitioning = true;
    
    // After transition completes, swap images
    setTimeout(() => {
      this.currentImageIndex = nextIndex;
      this.currentImage = this.foodImages[this.currentImageIndex];
      
      // Prepare next image for next transition
      const followingIndex = (this.currentImageIndex + 1) % this.foodImages.length;
      this.nextImage = this.foodImages[followingIndex];
      
      this.isTransitioning = false;
    }, 3000); // Match CSS transition duration
  }


  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

