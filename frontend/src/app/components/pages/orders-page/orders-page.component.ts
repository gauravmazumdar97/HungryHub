import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/shared/models/order';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent implements OnInit {
  order?: Order | null;
  isLoading = true;
  isSuccess = false;

  constructor(
    private orderService: OrderService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const orderId = params.get('id');
      const success = params.get('success');

      this.isSuccess = success === '1';

      if (orderId) {
        this.loadOrderById(orderId);
      } else {
        this.loadCurrentOrder();
      }
    });
  }

  loadOrderById(id: string): void {
    this.isLoading = true;
    this.orderService.trackOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: () => {
        this.order = null;
        this.isLoading = false;
        this.toastrService.error('Order not found', 'Order');
      }
    });
  }

  loadCurrentOrder(): void {
    this.isLoading = true;

    this.orderService.getNewOrderForCurrentUser().subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: () => {
        // No active order or error – show friendly message
        this.order = null;
        this.isLoading = false;
      }
    });
  }

  goToHome(): void {
    this.router.navigateByUrl('/');
  }

  goToCheckout(): void {
    this.router.navigateByUrl('/checkout');
  }
}
