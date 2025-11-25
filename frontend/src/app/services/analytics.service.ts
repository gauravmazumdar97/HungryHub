import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ANALYTICS_DASHBOARD_URL } from '../shared/constants/urls';

export interface DashboardAnalytics {
  overview?: {
    totalOrders: number;
    totalUsers: number;
    totalFoods: number;
    totalWishlists: number;
    totalRevenue: number;
  };
  userStats?: {
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
    pendingOrders: number;
  };
  ordersByStatus?: Array<{ _id: string; count: number }>;
  popularFoods?: Array<{
    food: any;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentOrders?: any[];
  monthlyRevenue?: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orderCount: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    // Auth interceptor will automatically add the token
    return this.http.get<DashboardAnalytics>(ANALYTICS_DASHBOARD_URL);
  }
}

