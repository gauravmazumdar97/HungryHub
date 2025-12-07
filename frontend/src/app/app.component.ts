import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  showFooter: boolean = true;

  constructor(
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize theme service - this will load saved preference
    this.themeService.theme$.subscribe();

    // Check current route and hide footer on login/register pages
    this.updateFooterVisibility(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateFooterVisibility(event.url);
      });
  }

  private updateFooterVisibility(url: string): void {
    // Hide footer on login and register pages
    this.showFooter = !url.includes('/login') && !url.includes('/register');
  }
}
