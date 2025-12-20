import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from 'src/app/services/booking.service';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service'; // Ensure this matches your path
import { Booking } from 'src/app/shared/models/booking';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.css']
})
export class BookingPageComponent implements OnInit {

  bookingForm!: FormGroup;
  selectedOption: number = 1; // 1=Standard, 2=Preorder, 3=Hall
  isSubmitted = false;
  
  // Stores slots that are already booked for the selected date
  takenSlots: string[] = [];

  // Define your 2-hour slots
  availableTimeSlots = [
    { start: '20:00', label: '8:00 PM - 10:00 PM' },
    { start: '20:30', label: '8:30 PM - 10:30 PM' },
    { start: '21:00', label: '9:00 PM - 11:00 PM' },
    { start: '21:30', label: '9:30 PM - 11:30 PM' },
    { start: '22:00', label: '10:00 PM - 12:00 AM' },
    { start: '22:30', label: '10:30 PM - 12:30 AM' },
    { start: '23:00', label: '11:00 PM - 01:00 AM' },
    { start: '23:30', label: '11:30 PM - 01:30 AM' }
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private bookingService: BookingService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.userService.currentUser;

    this.bookingForm = this.fb.group({
      name: [user.name || '', Validators.required],
      phone: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      guests: [2, [Validators.required, Validators.min(1)]],
      hallPackage: ['Silver']
    });

    // Check availability whenever the date changes
    this.bookingForm.get('date')?.valueChanges.subscribe((selectedDate) => {
      if (selectedDate) {
        this.checkAvailability(selectedDate);
      }
    });
  }

  // --- THIS IS THE MISSING FUNCTION CAUSING YOUR ERROR ---
  isSlotTaken(time: string): boolean {
    return this.takenSlots.includes(time);
  }
  // -----------------------------------------------------

  checkAvailability(date: string) {
    // Reset currently selected time if date changes
    this.bookingForm.patchValue({ time: '' });
    
    // Fetch taken slots from backend
    this.bookingService.getBookedSlots(date).subscribe((slots) => {
      this.takenSlots = slots;
    });
  }

  selectTimeSlot(time: string) {
    // Prevent selecting if it's taken
    if (this.takenSlots.includes(time)) return;
    
    this.bookingForm.patchValue({ time: time });
  }

  selectOption(option: number) {
    this.selectedOption = option;
  }

  submitBooking() {
    this.isSubmitted = true;
    if (this.bookingForm.invalid) {
      alert('Please fill in all fields (pick a date and time!)');
      return;
    }

    const formVal = this.bookingForm.value;
    const user = this.userService.currentUser;

    const newBooking: Booking = {
      name: formVal.name,
      email: user.email || 'guest@temp.com', 
      phone: formVal.phone,
      date: formVal.date,
      time: formVal.time,
      guests: formVal.guests,
      type: this.selectedOption === 1 ? 'standard' : 
            this.selectedOption === 2 ? 'preorder' : 'hall',
      status: 'pending'
    };

    if (this.selectedOption === 2) {
      newBooking.cartItems = this.cartService.getCart().items;
      if (!newBooking.cartItems || newBooking.cartItems.length === 0) {
        alert("Your cart is empty! Please add food items first.");
        return;
      }
      newBooking.totalPrice = this.cartService.getCart().totalPrice;
    }

    if (this.selectedOption === 3) {
      newBooking.hallPackage = formVal.hallPackage;
    }

    this.bookingService.createBooking(newBooking).subscribe({
      next: () => {
        alert('Booking Successful!');
        if(this.selectedOption === 2) this.cartService.clearCart();
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error(err);
        alert('Booking Failed.');
      }
    });
  }
}