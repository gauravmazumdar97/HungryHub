
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Food } from '../shared/models/food';
import { Tag } from '../shared/models/tag';

import {
  FOODS_BY_ID_URL,
  FOODS_BY_SEARCH_URL,
  FOODS_BY_TAG_URL,
  FOODS_TAGS_URL,
  FOODS_URL
} from '../shared/constants/urls';

@Injectable({
  providedIn: 'root'
})
export class FoodService {

  constructor(private http: HttpClient) {}

  /**
   * Build Authorization headers with JWT from localStorage.
   * If no token exists, returns empty headers (public endpoints still work).
   * Change the key ('token') if your app stores it under a different name.
   */
  private authHeaders(): HttpHeaders {
    const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  /** Get all foods - protected on your backend */
  getAll(): Observable<Food[]> {
    return this.http.get<Food[]>(FOODS_URL, { headers: this.authHeaders() });
  }

  /** Search foods by term - protected if your backend guards this path */
  getAllFoodBySearchItem(searchTerm: string): Observable<Food[]> {
    return this.http.get<Food[]>(FOODS_BY_SEARCH_URL + searchTerm, { headers: this.authHeaders() });
  }

  /** Get all tags */
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(FOODS_TAGS_URL, { headers: this.authHeaders() });
  }

  /** Get foods by tag */
  getAllFoodsByTag(tag: string): Observable<Food[]> {
    return tag === 'All'
      ? this.getAll()
      : this.http.get<Food[]>(FOODS_BY_TAG_URL + tag, { headers: this.authHeaders() });
  }

  /** Get a single food by id */
  getFoodById(foodId: string): Observable<Food> {
    return this.http.get<Food>(FOODS_BY_ID_URL + foodId, { headers: this.authHeaders() });
  }
}
