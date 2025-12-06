import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = 'http://localhost:5000/api/reservations';
  private couponUrl = 'http://localhost:5000/api/coupons/validate';

  constructor(private http: HttpClient) { }

  createReservation(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  validateCoupon(code: string) {
    return this.http.post(this.couponUrl, { code });
  }
}