import { Component, OnInit } from '@angular/core';
import { AnalyticsService, DashboardAnalytics } from 'src/app/services/analytics.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  analytics: DashboardAnalytics | null = null;
  isLoading = true;
  isAdmin = false;

  constructor(
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.userService.currentUser.token) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.isAdmin = this.userService.currentUser.isAdmin || false;
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    if (!this.userService.currentUser.token) {
      this.toastrService.error('Please login to view dashboard', 'Authentication Required');
      this.router.navigateByUrl('/login');
      return;
    }

    this.isLoading = true;
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        if (err.status === 401) {
          this.toastrService.error('Session expired. Please login again', 'Unauthorized');
          this.userService.logout();
        } else {
          this.toastrService.error('Failed to load analytics', 'Error');
        }
        this.isLoading = false;
      }
    });
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }
}

