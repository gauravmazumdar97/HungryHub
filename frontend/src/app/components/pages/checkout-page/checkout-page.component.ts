import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { Order } from 'src/app/shared/models/order';

declare var google: any;

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit, AfterViewInit {
  @ViewChild('addressInput', { static: true }) addressInput!: ElementRef;
  order:Order = new Order();
  checkoutForm!: FormGroup;
  autocomplete: any;
  private autocompleteInitialized = false;
  
  constructor(cartService:CartService,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private toastrService: ToastrService,
              private orderService: OrderService,
              private router: Router) {
                const cart = cartService.getCart();
                this.order.items = cart.items;
                this.order.totalPrice = cart.totalPrice;
              }

  ngOnInit(): void {
    let {name, address} = this.userService.currentUser;
    this.checkoutForm = this.formBuilder.group({
      name:[name, Validators.required],
      address:[address || '', Validators.required],
      pincode:['', [Validators.required, Validators.pattern(/^[0-9]{4,10}$/)]]
    });
  }

  ngAfterViewInit(): void {
    // Wait a bit for the view to fully render
    setTimeout(() => {
      this.initGoogleAutocomplete();
    }, 100);
  }

  initGoogleAutocomplete(): void {
    if (this.autocompleteInitialized) {
      return;
    }

    const input = this.addressInput?.nativeElement;
    if (!input) {
      return;
    }

    // Check if Google Maps API is loaded and valid
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      try {
        this.autocomplete = new google.maps.places.Autocomplete(input, {
          types: ['address'],
          componentRestrictions: { country: ['us', 'in', 'gb', 'ca', 'au', 'nz', 'sg', 'my'] },
          fields: ['formatted_address', 'geometry', 'address_components']
        });

        // Listen for place selection
        this.autocomplete.addListener('place_changed', () => {
          const place = this.autocomplete.getPlace();
          if (place && place.formatted_address) {
            this.checkoutForm.patchValue({
              address: place.formatted_address
            });
            
            // Store coordinates if available
            if (place.geometry && place.geometry.location) {
              this.order.addressLatLng = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
            }
          }
        });

        this.autocompleteInitialized = true;
      } catch (error) {
        // Silently fail - address field will work as normal input
        this.autocompleteInitialized = true; // Prevent retries
      }
    }
    // If Google Maps API is not available, address field works as normal text input
    // No error handling needed - this is the expected fallback behavior
  }

  get fc(){
    return this.checkoutForm.controls;
  }

  createOrder(){
    if(this.checkoutForm.invalid){
      this.toastrService.warning('Please fill the inputs', 'Invalid Inputs');
      return;
    }

    // Temporarily disabled map requirement
    // if(!this.order.addressLatLng){
    //   this.toastrService.warning('Please select your location on the map', 'Location');
    //   return;
    // }

    this.order.name = this.fc.name.value;
    const pincode = this.fc.pincode.value ? `, ${this.fc.pincode.value}` : '';
    this.order.address = this.fc.address.value + pincode;

    this.orderService.create(this.order).subscribe({
      next:() => {
        this.router.navigateByUrl('/payment');
      },
      error:(errorResponse: any) => {
        this.toastrService.error(errorResponse.error, 'Cart');
      }
    })
  }
}