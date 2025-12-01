import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { CartService } from 'src/app/services/cart.service';
import { Order } from 'src/app/shared/models/order';

declare var Razorpay: any;

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit {
  order: Order = new Order();
  paymentForm!: FormGroup;
  isProcessing = false;

  constructor(
    private orderService: OrderService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    public router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.paymentForm = this.formBuilder.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', [Validators.required, Validators.minLength(3)]],
      expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expiryYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });

    // Get the current order
    this.orderService.getNewOrderForCurrentUser().subscribe({
      next: (order) => {
        this.order = order;
      },
      error: () => {
        this.toastrService.error('No order found. Please create an order first.', 'Order Error');
        this.router.navigateByUrl('/checkout');
      }
    });
  }

  get fc() {
    return this.paymentForm.controls;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    // Format with spaces every 4 digits
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    this.paymentForm.patchValue({ cardNumber: value });
  }

  formatExpiry(event: any, field: string) {
    let value = event.target.value.replace(/\D/g, '');
    if (field === 'expiryMonth' && value.length > 2) {
      value = value.substring(0, 2);
    } else if (field === 'expiryYear' && value.length > 2) {
      value = value.substring(0, 2);
    }
    this.paymentForm.patchValue({ [field]: value });
  }

  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    this.paymentForm.patchValue({ cvv: value });
  }

  submitPayment() {
    if (this.paymentForm.invalid) {
      this.toastrService.warning('Please fill all payment details correctly', 'Invalid Payment Details');
      return;
    }

    this.isProcessing = true;

    // Step 1: Create Razorpay order on backend
    this.orderService.createRazorpayOrder().subscribe({
      next: (razorpayOrder) => {
        this.openRazorpayCheckout(razorpayOrder);
      },
      error: (errorResponse) => {
        this.isProcessing = false;
        this.toastrService.error(
          errorResponse.error || 'Unable to initiate payment. Please try again.',
          'Payment Error'
        );
      }
    });
  }

  private openRazorpayCheckout(razorpayOrder: any) {
    const options: any = {
      key: razorpayOrder.key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'HungryHub',
      description: 'Order Payment',
      order_id: razorpayOrder.orderId,
      prefill: {
        name: this.fc.cardHolder.value || '',
      },
      theme: {
        color: '#FC8019'
      },
      handler: (response: any) => {
        this.handlePaymentSuccess(response);
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

    rzp.on('payment.failed', (response: any) => {
      this.isProcessing = false;
      this.toastrService.error('Payment failed. Please try again.', 'Payment Error');
    });
  }

  private handlePaymentSuccess(response: any) {
    const payload = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    this.orderService.verifyRazorpayPayment(payload).subscribe({
      next: (orderId) => {
        this.toastrService.success('Payment successful!', 'Success');
        this.cartService.clearCart();
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 2000);
      },
      error: (errorResponse) => {
        this.isProcessing = false;
        this.toastrService.error(
          errorResponse.error || 'Payment verification failed. Please contact support.',
          'Payment Error'
        );
      }
    });
  }
}
