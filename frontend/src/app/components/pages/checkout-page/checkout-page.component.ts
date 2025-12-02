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
  @ViewChild('addressLine1Input', { static: true }) addressLine1Input!: ElementRef;
  order:Order = new Order();
  checkoutForm!: FormGroup;
  autocomplete: any;
  private autocompleteInitialized = false;
  showDeliveryInstructions = false;
  
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
      country:['United Kingdom', Validators.required],
      name:[name, Validators.required],
      phone:['', [Validators.required, Validators.pattern(/^[\+]?[0-9]{10,15}$/)]],
      postcode:['', [Validators.required, Validators.pattern(/^[0-9A-Za-z\s-]{4,10}$/)]],
      addressLine1:['', Validators.required],
      addressLine2:[''],
      townCity:['', Validators.required],
      county:[''],
      makeDefault:[false],
      deliveryInstructions:['']
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

    const input = this.addressLine1Input?.nativeElement;
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
            // Extract address components
            let addressLine1 = place.formatted_address;
            let townCity = '';
            let county = '';
            let postcode = '';

            // Parse address components
            if (place.address_components) {
              place.address_components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('postal_code')) {
                  postcode = component.long_name;
                }
                if (types.includes('locality') || types.includes('postal_town')) {
                  townCity = component.long_name;
                }
                if (types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) {
                  if (!county) county = component.long_name;
                }
              });
            }

            // Split formatted address into line 1 and line 2 if needed
            const addressParts = place.formatted_address.split(',');
            if (addressParts.length > 1) {
              addressLine1 = addressParts[0].trim();
              if (addressParts.length > 2) {
                this.checkoutForm.patchValue({
                  addressLine2: addressParts.slice(1, -2).join(', ').trim()
                });
              }
            }

            this.checkoutForm.patchValue({
              addressLine1: addressLine1,
              townCity: townCity || addressParts[addressParts.length - 2]?.trim() || '',
              county: county || addressParts[addressParts.length - 1]?.trim() || '',
              postcode: postcode || ''
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

  toggleDeliveryInstructions(): void {
    this.showDeliveryInstructions = !this.showDeliveryInstructions;
  }

  autofillLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Reverse geocoding would be needed here
          // For now, just show a message
          this.toastrService.info('Location detected. Please select your address from the suggestions.', 'Location');
        },
        (error) => {
          this.toastrService.warning('Unable to detect location. Please enter your address manually.', 'Location');
        }
      );
    } else {
      this.toastrService.warning('Geolocation is not supported by your browser.', 'Location');
    }
  }

  createOrder(){
    if(this.checkoutForm.invalid){
      this.toastrService.warning('Please fill all required fields', 'Invalid Inputs');
      return;
    }

    // Temporarily disabled map requirement
    // if(!this.order.addressLatLng){
    //   this.toastrService.warning('Please select your location on the map', 'Location');
    //   return;
    // }

    this.order.name = this.fc.name.value;
    
    // Build full address from all components
    const addressParts = [
      this.fc.addressLine1.value,
      this.fc.addressLine2.value,
      this.fc.townCity.value,
      this.fc.county.value,
      this.fc.postcode.value
    ].filter(part => part && part.trim() !== '');
    
    this.order.address = addressParts.join(', ');

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