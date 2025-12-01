import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ORDER_CREATE_URL, ORDER_NEW_FOR_CURRENT_USER_URL, ORDER_PAY_URL, ORDER_TRACK_URL, ORDER_RAZORPAY_CREATE_URL, ORDER_RAZORPAY_VERIFY_URL } from '../shared/constants/urls';
import { Order } from '../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) { }

  create(order: Order): Observable<Order> {
    return this.http.post<Order>(ORDER_CREATE_URL, order);
  }

  getNewOrderForCurrentUser(): Observable<Order> {
    return this.http.get<Order>(ORDER_NEW_FOR_CURRENT_USER_URL);
  }

  pay(paymentId: string): Observable<string> {
    return this.http.post<string>(ORDER_PAY_URL, { paymentId });
  }

  createRazorpayOrder(): Observable<any> {
    return this.http.post<any>(ORDER_RAZORPAY_CREATE_URL, {});
  }

  verifyRazorpayPayment(payload: any): Observable<string> {
    return this.http.post<string>(ORDER_RAZORPAY_VERIFY_URL, payload);
  }

  trackOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(ORDER_TRACK_URL + id);
  }
}