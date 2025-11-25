import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-dynamic-background',
  templateUrl: './dynamic-background.component.html',
  styleUrls: ['./dynamic-background.component.css']
})
export class DynamicBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('currentImg', { static: false }) currentImgElement!: ElementRef<HTMLDivElement>;
  @ViewChild('nextImg', { static: false }) nextImgElement!: ElementRef<HTMLDivElement>;

  foodImages: string[] = [
    // High-quality food images from Unsplash
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80',
    'https://images.unsplash.com/photo-1565958011703-14f0586457d5?w=1920&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&q=80',
    'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=1920&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1920&q=80',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1920&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&q=80',
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1920&q=80',
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1920&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&q=80',
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1920&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80'
  ];

  currentImageIndex: number = 0;
  currentImage: string = '';
  nextImage: string = '';
  isTransitioning: boolean = false;
  private intervalId: any;
  private imageCache: Map<string, number> = new Map();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Shuffle images for variety on each page load
    this.shuffleArray(this.foodImages);
    
    // Initialize with first image
    this.currentImage = this.foodImages[0];
    this.nextImage = this.foodImages[1];
    
    // Analyze initial image brightness
    this.analyzeImageBrightness(this.currentImage);
    
    // Change image every 6 seconds
    this.intervalId = setInterval(() => {
      this.changeImage();
    }, 6000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  changeImage(): void {
    if (this.isTransitioning) return;
    
    // Get next image index
    const nextIndex = (this.currentImageIndex + 1) % this.foodImages.length;
    
    // Update next image (this will be shown during transition)
    this.nextImage = this.foodImages[nextIndex];
    
    // Analyze brightness of next image before transition
    this.analyzeImageBrightness(this.nextImage);
    
    // Start transition
    this.isTransitioning = true;
    
    // After transition completes, swap images
    setTimeout(() => {
      this.currentImageIndex = nextIndex;
      this.currentImage = this.foodImages[this.currentImageIndex];
      
      // Prepare next image for next transition
      const followingIndex = (this.currentImageIndex + 1) % this.foodImages.length;
      this.nextImage = this.foodImages[followingIndex];
      
      this.isTransitioning = false;
    }, 3000); // Match CSS transition duration
  }

  private analyzeImageBrightness(imageUrl: string): void {
    // Check cache first
    if (this.imageCache.has(imageUrl)) {
      const brightness = this.imageCache.get(imageUrl)!;
      this.themeService.updateTheme(brightness);
      return;
    }

    // Create an image element to analyze
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create a canvas to analyze the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Set canvas size (we'll sample a smaller size for performance)
        canvas.width = 100;
        canvas.height = 100;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate average brightness
        let totalBrightness = 0;
        let pixelCount = 0;
        
        // Sample pixels (every 4th pixel for performance)
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate brightness using luminance formula
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
          totalBrightness += brightness;
          pixelCount++;
        }
        
        const averageBrightness = totalBrightness / pixelCount;
        
        // Cache the result
        this.imageCache.set(imageUrl, averageBrightness);
        
        // Update theme based on brightness
        this.themeService.updateTheme(averageBrightness);
      } catch (error) {
        console.error('Error analyzing image brightness:', error);
        // Default to light theme on error
        this.themeService.updateTheme(200);
      }
    };
    
    img.onerror = () => {
      // Default to light theme on error
      this.themeService.updateTheme(200);
    };
    
    img.src = imageUrl;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

