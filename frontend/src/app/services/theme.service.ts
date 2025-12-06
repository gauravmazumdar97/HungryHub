import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeColors {
  textColor: string;
  textColorSecondary: string;
  backgroundColor: string;
  isLight: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeColors>({
    textColor: '#000000',
    textColorSecondary: '#333333',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    isLight: true
  });

  public theme$: Observable<ThemeColors> = this.themeSubject.asObservable();

  constructor() {
    // Set fixed CSS variables on document root (no dynamic changes)
    document.documentElement.style.setProperty('--text-color', '#282c3f');
    document.documentElement.style.setProperty('--text-color-secondary', '#686b78');
    document.documentElement.style.setProperty('--bg-overlay', 'rgba(255, 255, 255, 0.15)');
  }

  updateTheme(brightness: number): void {
    // Disabled - no longer dynamically changing theme based on image brightness
    // Keeping method for backward compatibility but it does nothing
  }

  getCurrentTheme(): ThemeColors {
    return this.themeSubject.value;
  }
}

