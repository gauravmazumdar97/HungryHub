import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AnalyticsService, DashboardAnalytics } from 'src/app/services/analytics.service';
import { UserService } from 'src/app/services/user.service';
import { FoodService } from 'src/app/services/food.service';
import { ToastrService } from 'ngx-toastr';
import { Food } from 'src/app/shared/models/food';

type SortField = 'name' | 'stock';
type SortDirection = 'asc' | 'desc';
type SummaryFilter = 'all' | 'low' | 'out';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  analytics: DashboardAnalytics | null = null;
  isLoading = true;
  isAdmin = false;
  foods: Food[] = [];

  // inventory helpers
  inventorySearch = '';
  showLowStockOnly = false;
  lowStockThreshold = 10;
  // when clicking summary chips
  showOnlyOutOfStock = false;
  activeSummaryFilter: SummaryFilter = 'all';

  // sorting
  sortField: SortField = 'name';
  sortDirection: SortDirection = 'asc';

  // track original values for dirty-check
  private originalMap = new Map<string, { price: number; stock: number }>();

  // track recently saved rows
  justSavedIds = new Set<string>();

  constructor(
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private foodService: FoodService,
    private http: HttpClient,
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
    if (this.isAdmin) {
      this.loadFoods();
    }
  }

  // ---------- stat card actions ----------

  goToOrders(): void {
    this.router.navigateByUrl('/orders');
  }

  onUsersCardClick(): void {
    if (this.isAdmin) {
      this.toastrService.info('User management page coming soon.', 'Info');
    } else {
      this.toastrService.info('This shows how many users are on HungryHub.', 'Info');
    }
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

  loadFoods(): void {
    this.foodService.getAll().subscribe({
      next: (foods) => {
        this.foods = foods;
        this.originalMap.clear();
        for (const f of foods) {
          this.originalMap.set(f.id, {
            price: f.price,
            stock: f.stock !== undefined ? f.stock : 100
          });
        }
      },
      error: (err) => {
        console.error('Failed to load foods', err);
        this.toastrService.error('Could not load inventory', 'Error');
      }
    });
  }

  // ---------- computed helpers ----------

  private getNormalizedStock(item: Food): number {
    return item.stock !== undefined ? item.stock : 100;
  }

  get lowStockCount(): number {
    return this.foods.filter(
      f => this.getNormalizedStock(f) > 0 && this.getNormalizedStock(f) < this.lowStockThreshold
    ).length;
  }

  get outOfStockCount(): number {
    return this.foods.filter(f => this.getNormalizedStock(f) === 0).length;
  }

  get tableFoods(): Food[] {
    let list = [...this.foods];

    // search
    if (this.inventorySearch.trim()) {
      const term = this.inventorySearch.trim().toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(term));
    }

    // out-of-stock filter from summary
    if (this.showOnlyOutOfStock) {
      list = list.filter(f => this.getNormalizedStock(f) === 0);
    } else if (this.showLowStockOnly) {
      // low-stock filter (checkbox or summary)
      list = list.filter(f => this.getNormalizedStock(f) < this.lowStockThreshold);
    }

    // sort
    list.sort((a, b) => {
      let cmp = 0;

      if (this.sortField === 'name') {
        const an = a.name.toLowerCase();
        const bn = b.name.toLowerCase();
        if (an < bn) cmp = -1;
        else if (an > bn) cmp = 1;
        else cmp = 0;
      } else {
        const as = this.getNormalizedStock(a);
        const bs = this.getNormalizedStock(b);
        if (as < bs) cmp = -1;
        else if (as > bs) cmp = 1;
        else cmp = 0;
      }

      return this.sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }

  // ---------- sorting / dirty helpers ----------

  changeSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = field === 'name' ? 'asc' : 'desc';
    }
  }

  isDirty(item: Food): boolean {
    const orig = this.originalMap.get(item.id);
    if (!orig) return false;
    const currentStock = this.getNormalizedStock(item);
    return orig.price !== item.price || orig.stock !== currentStock;
  }

  // ---------- inventory summary filter ----------

  setSummaryFilter(filter: SummaryFilter): void {
    this.activeSummaryFilter = filter;

    if (filter === 'all') {
      this.showLowStockOnly = false;
      this.showOnlyOutOfStock = false;
    } else if (filter === 'low') {
      this.showLowStockOnly = true;
      this.showOnlyOutOfStock = false;
    } else {
      this.showOnlyOutOfStock = true;
      this.showLowStockOnly = false;
    }
  }

  onLowStockCheckboxChange(): void {
    // make sure summary chips stay in sync with checkbox
    if (this.showLowStockOnly) {
      this.activeSummaryFilter = 'low';
      this.showOnlyOutOfStock = false;
    } else {
      this.activeSummaryFilter = 'all';
      this.showOnlyOutOfStock = false;
    }
  }

  // ---------- UI / save ----------

  changeStock(item: Food, change: number) {
    if (item.stock === undefined) item.stock = 100;
    const newStock = item.stock + change;
    if (newStock >= 0) item.stock = newStock;
  }

  saveItem(item: Food) {
    if (!this.isDirty(item)) return;

    const updateUrl = `http://localhost:9000/api/foods/${item.id}`;

    this.http
      .put(updateUrl, { price: item.price, stock: this.getNormalizedStock(item) })
      .subscribe({
        next: () => {
          this.toastrService.success(`Updated ${item.name}`, 'Success');

          // update original snapshot
          this.originalMap.set(item.id, {
            price: item.price,
            stock: this.getNormalizedStock(item)
          });

          // mark row as "just saved" for animation
          this.justSavedIds.add(item.id);
          setTimeout(() => this.justSavedIds.delete(item.id), 1200);
        },
        error: (err) => {
          this.toastrService.error('Update failed', 'Error');
          console.error(err);
        }
      });
  }

  // ---------- visual status ----------

  getStockStatusClass(item: Food): string {
    const stock = this.getNormalizedStock(item);
    if (stock === 0) return 'stock-status-out';
    if (stock < this.lowStockThreshold) return 'stock-status-low';
    return 'stock-status-ok';
  }

  getStockStatusLabel(item: Food): string {
    const stock = this.getNormalizedStock(item);
    if (stock === 0) return 'Out of stock';
    if (stock < this.lowStockThreshold) return 'Low';
    return 'OK';
  }

  getRowStatusClass(item: Food): string {
    const stock = this.getNormalizedStock(item);
    if (stock === 0) return 'row-out';
    if (stock < this.lowStockThreshold) return 'row-low';
    return 'row-ok';
  }

  goToHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToUsers(): void {
    this.router.navigateByUrl('/users');
  }
}
