import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterOutlet,
    CommonModule
  ]
})
export class AppComponent implements OnInit {
  // Track the current step (default Step 1)
  currentStep: number = 1;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Update current step based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateStepFromRoute(event.url);
    });
    
    // Set initial step
    this.updateStepFromRoute(this.router.url);
  }

  private updateStepFromRoute(url: string): void {
    if (url.includes('upload-dataset')) {
      this.currentStep = 1;
    } else if (url.includes('date-ranges')) {
      this.currentStep = 2;
    } else if (url.includes('model-training')) {
      this.currentStep = 3;
    } else if (url.includes('simulation')) {
      this.currentStep = 4;
    }
  }

  // Add navigation method:
  goToNextStep(): void {
    this.router.navigate(['/date-ranges']);
  }
  
  // Method to update current step (can be called from child components)
  updateStep(step: number): void {
    this.currentStep = step;
  }
}
