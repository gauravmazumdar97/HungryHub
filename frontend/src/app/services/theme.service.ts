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
    // Set CSS variables on document root
    this.theme$.subscribe(theme => {
      document.documentElement.style.setProperty('--text-color', theme.textColor);
      document.documentElement.style.setProperty('--text-color-secondary', theme.textColorSecondary);
      document.documentElement.style.setProperty('--bg-overlay', theme.backgroundColor);
    });
  }

  updateTheme(brightness: number): void {
    // Brightness is 0-255, where 0 is darkest and 255 is lightest
    // Threshold: if brightness > 128, it's a light image, use dark text
    const isLight = brightness > 128;
    
    const theme: ThemeColors = {
      textColor: isLight ? '#1a1a1a' : '#ffffff',
      textColorSecondary: isLight ? '#4a4a4a' : '#e0e0e0',
      backgroundColor: isLight 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(0, 0, 0, 0.3)',
      isLight: isLight
    };

    this.themeSubject.next(theme);
  }

  getCurrentTheme(): ThemeColors {
    return this.themeSubject.value;
  }
}

