import { Component, OnInit } from '@angular/core';
import { ReservationService } from 'src/app/services/reservation.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

  currentStep: string = 'prompt';

  // Menu Data
  menuItems = [
    { id: 1, name: 'Bruschetta', price: 8, description: 'Toasted bread with tomatoes.', image: 'https://images.unsplash.com/photo-1572695157369-a0eac271ad61?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { id: 2, name: 'Grilled Salmon', price: 22, description: 'Fresh salmon with asparagus.', image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4974?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { id: 3, name: 'Caesar Salad', price: 12, description: 'Crisp romaine with parmesan.', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { id: 4, name: 'Tiramisu', price: 9, description: 'Classic coffee dessert.', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { id: 5, name: 'Pasta Carbonara', price: 16, description: 'Spaghetti with pancetta.', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { id: 6, name: 'Mojito', price: 7, description: 'Refreshing mint cocktail.', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
  ];

  // Hall Data
  hallPackages = [
    { name: 'Silver Tier', price: '$500', capacity: '15-20 Guests', features: ['Standard Decoration', '3 Course Meal'], isPopular: false },
    { name: 'Gold Tier', price: '$800', capacity: '20-30 Guests', features: ['Premium Decoration', '5 Course Meal', 'Wine & Champagne'], isPopular: true },
    { name: 'Platinum Tier', price: '$1200', capacity: '30-50 Guests', features: ['Luxury Theme', '7 Course Banquet', 'Open Bar'], isPopular: false }
  ];

  cart: any[] = [];
  
  // Coupon State
  couponCode: string = '';
  discountPercent: number = 0;
  couponMessage: string = '';
  isCouponApplied: boolean = false;

  reservation = {
    name: '',
    date: '',
    guests: 2,
    hallPackage: ''
  };

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void { }

  startPreOrder() { this.currentStep = 'menu'; }
  startHallBooking() { this.currentStep = 'halls'; }
  skipPreOrder() { this.currentStep = 'form'; this.cart = []; }

  addToCart(item: any) {
    const existingItem = this.cart.find(x => x.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
  }

  getTotal() {
    return this.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  selectHall(pkgName: string) {
    this.reservation.hallPackage = pkgName;
    this.currentStep = 'form';
  }

  proceedToDetails() {
    this.currentStep = 'form';
  }

  // Coupon Logic
  applyCoupon() {
    if (!this.couponCode) return;
    this.reservationService.validateCoupon(this.couponCode).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.discountPercent = response.discountPercent;
          this.isCouponApplied = true;
          this.couponMessage = `Success! ${this.discountPercent}% discount applied.`;
        }
      },
      error: (error: any) => {
        this.discountPercent = 0;
        this.isCouponApplied = false;
        this.couponMessage = 'Invalid or Expired Coupon';
      }
    });
  }

  getDiscountAmount() {
    return (this.getTotal() * this.discountPercent) / 100;
  }

  getFinalTotal() {
    return this.getTotal() - this.getDiscountAmount();
  }

  // Final Submit
  submitReservation() {
    const finalData = {
      customerName: this.reservation.name,
      date: this.reservation.date,
      guests: this.reservation.guests,
      hallPackage: this.reservation.hallPackage || 'None',
      orderItems: this.cart,
      couponCode: this.isCouponApplied ? this.couponCode : 'None',
      totalAmount: this.getFinalTotal()
    };

    console.log('Sending to backend:', finalData);

    this.reservationService.createReservation(finalData).subscribe({
      next: (response: any) => {
        console.log('Server response:', response);
        alert(`Success! Reservation saved for ${this.reservation.name}.`);
        
        // Reset everything
        this.cart = [];
        this.reservation = { name: '', date: '', guests: 2, hallPackage: '' };
        this.couponCode = '';
        this.discountPercent = 0;
        this.isCouponApplied = false;
        this.couponMessage = '';
        this.currentStep = 'prompt';
      },
      error: (error: any) => {
        console.error('Error saving reservation:', error);
        alert('Could not connect to the Backend. Is "node server.js" running?');
      }
    });
  }
}