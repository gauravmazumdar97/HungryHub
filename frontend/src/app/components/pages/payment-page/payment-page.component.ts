import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { CartService } from 'src/app/services/cart.service';
import { Order } from 'src/app/shared/models/order';

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
      cardNumber: ['', [Validators.required, this.cardNumberValidator]],
      cardHolder: ['', [Validators.required, Validators.minLength(3)]],
      expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expiryYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });

    // Load pending order
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

  cardNumberValidator(control: any) {
    if (!control.value) return null;

    const cardNumber = control.value.replace(/\s/g, '');
    return /^\d{16}$/.test(cardNumber) ? null : { invalidCardNumber: true };
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.substring(0, 16);

    value = value.match(/.{1,4}/g)?.join(' ') || value;
    this.paymentForm.patchValue({ cardNumber: value });
  }

  formatExpiry(event: any, field: string) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.substring(0, 2);

    this.paymentForm.patchValue({ [field]: value });
  }

  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);

    this.paymentForm.patchValue({ cvv: value });
  }

  // 🚫 Razorpay Removed
  // ✅ Dummy Payment Flow using /api/orders/pay
  submitPayment() {
    if (this.paymentForm.invalid) {
      this.toastrService.warning('Please fill all payment details correctly.', 'Invalid Details');
      return;
    }

    if (!this.order || !this.order.id) {
      this.toastrService.error('Order not found. Please return to checkout.', 'Payment Error');
      return;
    }

    this.isProcessing = true;

    // Dummy payment — backend marks order as PAYED
    this.orderService.pay('dummy-payment-id').subscribe({
      next: (orderId: string) => {
        this.isProcessing = false;
        this.toastrService.success('Payment successful!', 'Success');
        this.cartService.clearCart();

        setTimeout(() => {
          this.router.navigate(['/orders'], {
            queryParams: { success: '1', id: orderId }
          });
        }, 1500);
      },
      error: (errorResponse) => {
        this.isProcessing = false;
        this.toastrService.error(
          errorResponse.error || 'Payment failed. Please try again.',
          'Payment Error'
        );
      }
    });
  }
}
