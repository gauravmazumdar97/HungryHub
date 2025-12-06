import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AnalyticsService } from 'src/app/services/analytics.service';
import { UserService } from 'src/app/services/user.service';
import { FoodService } from 'src/app/services/food.service';
import { ToastrService } from 'ngx-toastr';

import { Food } from 'src/app/shared/models/food';

type SortField = 'name' | 'stock';
type SortDirection = 'asc' | 'desc';
type SummaryFilter = 'all' | 'low' | 'out';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- LOADING -->
    <ng-template #loadingTpl>
      <div class="loading-container">
        <div class="section loading-box">
          <div class="loader"></div>
          <span>Loading dashboard…</span>
        </div>
      </div>
    </ng-template>

    <div class="dashboard-container" *ngIf="!isLoading; else loadingTpl">
      <!-- HEADER -->
      <header class="dashboard-header">
        <h1 class="dashboard-title">
          {{ isAdmin ? 'Admin Dashboard' : 'My Dashboard' }}
        </h1>
        <p class="dashboard-subtitle" *ngIf="isAdmin">
          Welcome back! Manage analytics and inventory for your restaurant.
        </p>
        <p class="dashboard-subtitle" *ngIf="!isAdmin">
          Welcome back! Here’s a quick look at your activity.
        </p>
      </header>

      <!-- STATS -->
      <section *ngIf="analytics" class="stats-grid">
        <!-- Revenue / Spent -->
        <div class="stat-card revenue clickable" (click)="goToOrders()">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>$ {{ (analytics.val1 || 0) | number:'1.2-2' }}</h3>
            <p>{{ isAdmin ? 'Total Revenue' : 'Total Spent' }}</p>
          </div>
        </div>

        <!-- Orders -->
        <div class="stat-card clickable" (click)="goToOrders()">
          <div class="stat-icon">🧾</div>
          <div class="stat-info">
            <h3>{{ analytics.val2 || 0 }}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <!-- Users / Wishlist -->
        <div class="stat-card clickable" (click)="onUsersCardClick()">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ analytics.val3 || 0 }}</h3>
            <p>{{ isAdmin ? 'Total Users' : 'Wishlist Items' }}</p>
          </div>
        </div>
      </section>

      <!-- INVENTORY (ADMIN ONLY) -->
      <section *ngIf="isAdmin" class="section">
        <h2 class="section-title">Inventory Management</h2>
        <p class="section-subtitle">
          Adjust price & stock for each menu item. Click <strong>Save</strong> to persist changes.
        </p>

        <!-- Inventory summary (NOW CLICKABLE) -->
        <div class="inventory-summary" *ngIf="foods.length">
          <button
            type="button"
            class="summary-pill"
            [class.summary-pill-active]="activeSummaryFilter === 'all'"
            (click)="setSummaryFilter('all')"
          >
            Items: <strong>{{ foods.length }}</strong>
          </button>

          <button
            type="button"
            class="summary-pill"
            [class.summary-pill-active]="activeSummaryFilter === 'low'"
            (click)="setSummaryFilter('low')"
          >
            Low stock (&lt; {{ lowStockThreshold }}): <strong>{{ lowStockCount }}</strong>
          </button>

          <button
            type="button"
            class="summary-pill"
            [class.summary-pill-active]="activeSummaryFilter === 'out'"
            (click)="setSummaryFilter('out')"
          >
            Out of stock: <strong>{{ outOfStockCount }}</strong>
          </button>
        </div>

        <!-- Inventory toolbar -->
        <div class="inventory-toolbar">
          <div class="inventory-search-group">
            <input
              type="text"
              [(ngModel)]="inventorySearch"
              placeholder="Search items by name…"
              class="inventory-search-input"
            />
          </div>

          <div class="inventory-filters">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="showLowStockOnly"
                (change)="onLowStockCheckboxChange()"
              />
              <span>Show low stock only (&lt; {{ lowStockThreshold }})</span>
            </label>
          </div>
        </div>

        <!-- Table -->
        <div class="orders-table">
          <table *ngIf="tableFoods.length; else emptyInventory">
            <thead>
              <tr>
                <th class="sortable" (click)="changeSort('name')">
                  Item
                  <span class="sort-indicator" *ngIf="sortField === 'name'">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th class="center">Price ($)</th>
                <th class="center sortable" (click)="changeSort('stock')">
                  Stock
                  <span class="sort-indicator" *ngIf="sortField === 'stock'">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th class="center">Status</th>
                <th class="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let item of tableFoods"
                [ngClass]="[
                  'inventory-row',
                  getRowStatusClass(item),
                  justSavedIds.has(item.id) ? 'row-saved' : ''
                ]"
              >
                <!-- item info -->
                <td>
                  <div class="food-row">
                    <img
                      [src]="item.imageUrl"
                      [alt]="item.name"
                      class="food-image"
                    />
                    <div>
                      <div class="food-name">
                        {{ item.name }}
                      </div>
                      <div class="food-meta">
                        <span *ngIf="item.origins?.length">
                          {{ item.origins.join(', ') }}
                        </span>
                        <span *ngIf="item.cookTime">
                          • {{ item.cookTime }} mins
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- price -->
                <td class="center">
                  <div class="price-wrapper">
                    <span class="currency-symbol">$</span>
                    <input
                      type="number"
                      [(ngModel)]="item.price"
                      class="price-input"
                      step="0.5"
                    />
                  </div>
                </td>

                <!-- stock -->
                <td class="center">
                  <div class="stock-controls">
                    <button
                      type="button"
                      class="stock-btn stock-btn-minus"
                      (click)="changeStock(item, -1)"
                    >
                      -
                    </button>
                    <span class="stock-value">
                      {{ item.stock !== undefined ? item.stock : 100 }}
                    </span>
                    <button
                      type="button"
                      class="stock-btn stock-btn-plus"
                      (click)="changeStock(item, 1)"
                    >
                      +
                    </button>
                  </div>
                </td>

                <!-- status pill -->
                <td class="center">
                  <span
                    class="stock-status"
                    [ngClass]="getStockStatusClass(item)"
                  >
                    {{ getStockStatusLabel(item) }}
                  </span>
                </td>

                <!-- save -->
                <td class="center">
                  <button
                    type="button"
                    class="save-btn"
                    [class.save-btn-disabled]="!isDirty(item)"
                    [disabled]="!isDirty(item)"
                    (click)="saveItem(item)"
                  >
                    Save
                  </button>
                  <div class="dirty-indicator" *ngIf="isDirty(item)">
                    ● Unsaved changes
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #emptyInventory>
            <div class="empty-state">
              No items match your filters.
            </div>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  analytics: any = null;
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
    // assumes you have /orders route already
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
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        if (this.isAdmin && data.overview) {
          this.analytics = {
            val1: data.overview.totalRevenue,
            val2: data.overview.totalOrders,
            val3: data.overview.totalUsers
          };
        } else if (!this.isAdmin && data.userStats) {
          this.analytics = {
            val1: data.userStats.totalSpent,
            val2: data.userStats.totalOrders,
            val3: data.userStats.wishlistCount
          };
        } else {
          this.analytics = { val1: 0, val2: 0, val3: 0 };
        }
        this.isLoading = false;
      },
      error: () => {
        this.analytics = { val1: 0, val2: 0, val3: 0 };
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
}
