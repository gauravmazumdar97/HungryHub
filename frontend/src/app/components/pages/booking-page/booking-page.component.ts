import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from 'src/app/services/booking.service';
import { CartService } from 'src/app/services/cart.service';
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
  
  // NEW: Stores the list of booked times for the selected date
  takenSlots: string[] = [];

  // NEW: Your fixed 2-hour slots
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
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Initialize Form
    this.bookingForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      guests: [2, [Validators.required, Validators.min(1)]],
      hallPackage: ['Silver']
    });

    // 2. LISTEN FOR DATE CHANGES
    // When user picks a date, we fetch availability from backend
    this.bookingForm.get('date')?.valueChanges.subscribe((selectedDate) => {
      if (selectedDate) {
        this.checkAvailability(selectedDate);
      }
    });
  }

  // --- NEW SLOT LOGIC STARTS HERE ---

  checkAvailability(date: string) {
    // Clear currently selected time when date changes
    this.bookingForm.patchValue({ time: '' });
    
    // Call the service to get taken slots
    this.bookingService.getBookedSlots(date).subscribe((slots) => {
      this.takenSlots = slots;
      console.log('Booked slots:', this.takenSlots);
    });
  }

  selectTimeSlot(time: string) {
    // If slot is taken, do nothing
    if (this.takenSlots.includes(time)) return;
    
    // Set the form value
    this.bookingForm.patchValue({ time: time });
  }

  isSlotTaken(time: string): boolean {
    return this.takenSlots.includes(time);
  }

  // --- END NEW SLOT LOGIC ---

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

    const newBooking: Booking = {
      name: formVal.name,
      email: 'user@temp.com', 
      phone: formVal.phone,
      date: formVal.date,
      time: formVal.time,
      guests: formVal.guests,
      type: this.selectedOption === 1 ? 'standard' : 
            this.selectedOption === 2 ? 'preorder' : 'hall'
    };

    if (this.selectedOption === 2) {
      newBooking.cartItems = this.cartService.getCart().items;
      if (!newBooking.cartItems || newBooking.cartItems.length === 0) {
        alert("Your cart is empty! Please add food items first.");
        return;
      }
    }

    if (this.selectedOption === 3) {
      newBooking.hallPackage = formVal.hallPackage;
    }

    this.bookingService.createBooking(newBooking).subscribe({
      next: () => {
        alert('Booking Successful!');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error(err);
        alert('Booking Failed.');
      }
    });
  }
}