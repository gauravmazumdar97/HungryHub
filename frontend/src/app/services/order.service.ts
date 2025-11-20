import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ORDER_URL } from '../shared/constants/urls';
import { Order } from '../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) { }

  create(order: Order): Observable<Order> {
    return this.http.post<Order>(ORDER_URL, order);
  }
}