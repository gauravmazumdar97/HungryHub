import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../shared/models/booking';
import { BOOKING_URL } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) { }

  // 1. Create a new booking
  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(BOOKING_URL, booking);
  }

  // 2. Check which slots are already taken for a specific date
  getBookedSlots(date: string): Observable<string[]> {
    return this.http.get<string[]>(`${BOOKING_URL}/${date}`);
  }
}