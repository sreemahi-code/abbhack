import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // ✅ Add this import
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface DatePeriod {
  startDate: Date | null;
  endDate: Date | null;
}

interface ChartData {
  label: string;
  height: number;
  class: string;
}

@Component({
  selector: 'app-date-ranges',
  templateUrl: './date-ranges.component.html',
  styleUrls: ['./date-ranges.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class DateRangesComponent {
  // Date periods
  trainingPeriod: DatePeriod = {
    startDate: new Date(2021, 0, 1), // January 1, 2021
    endDate: new Date(2021, 7, 31)   // August 31, 2021
  };

  testingPeriod: DatePeriod = {
    startDate: new Date(2021, 8, 1),  // September 1, 2021
    endDate: new Date(2021, 9, 31)    // October 31, 2021
  };

  simulationPeriod: DatePeriod = {
    startDate: new Date(2021, 10, 1), // November 1, 2021
    endDate: new Date(2021, 11, 31)   // December 31, 2021
  };

  // Validation state
  isValidated: boolean = true; // Set to true to show the validated state

  // Summary data
  trainingDays: number = 242;
  testingDays: number = 60;
  simulationDays: number = 60;

  trainingRangeText: string = '2021-01-01 to 2021-08-31';
  testingRangeText: string = '2021-09-01 to 2021-10-31';
  simulationRangeText: string = '2021-11-01 to 2021-12-31';

  // Chart data
  yAxisLabels: number[] = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

  chartData: ChartData[] = [
    { label: 'Jan', height: 220, class: 'training' },
    { label: 'Feb', height: 160, class: 'training' },
    { label: 'Mar', height: 190, class: 'training' },
    { label: 'Apr', height: 180, class: 'training' },
    { label: 'May', height: 155, class: 'training' },
    { label: 'Jun', height: 215, class: 'training' },
    { label: 'Jul', height: 205, class: 'training' },
    { label: 'Aug', height: 165, class: 'training' },
    { label: 'Sep', height: 185, class: 'testing' },
    { label: 'Oct', height: 190, class: 'testing' },
    { label: 'Nov', height: 155, class: 'simulation' },
    { label: 'Dec', height: 140, class: 'simulation' }
  ];

  constructor(private router: Router) {  // ✅ Add constructor with Router injection
    // Initialize with sample data to match the image
  }

  canValidate(): boolean {
    return !!(this.trainingPeriod.startDate && this.trainingPeriod.endDate &&
              this.testingPeriod.startDate && this.testingPeriod.endDate &&
              this.simulationPeriod.startDate && this.simulationPeriod.endDate);
  }

  validateRanges(): void {
    if (!this.canValidate()) {
      return;
    }

    // Validate date ranges logic
    const trainingStart = this.trainingPeriod.startDate!;
    const trainingEnd = this.trainingPeriod.endDate!;
    const testingStart = this.testingPeriod.startDate!;
    const testingEnd = this.testingPeriod.endDate!;
    const simulationStart = this.simulationPeriod.startDate!;
    const simulationEnd = this.simulationPeriod.endDate!;

    // Check if dates are sequential and non-overlapping
    const isValid = trainingStart <= trainingEnd &&
                   testingStart <= testingEnd &&
                   simulationStart <= simulationEnd &&
                   trainingEnd < testingStart &&
                   testingEnd < simulationStart;

    if (isValid) {
      this.isValidated = true;
      this.calculateSummaryData();
    } else {
      this.isValidated = false;
      // Could show error message here
    }
  }

  // ✅ Add navigation method for next button
  onNext(): void {
    if (this.isValidated) {  // Only navigate if dates are validated
      this.router.navigate(['/model-training']);
    }
  }

  private calculateSummaryData(): void {
    // Calculate days for each period
    if (this.trainingPeriod.startDate && this.trainingPeriod.endDate) {
      this.trainingDays = this.daysBetween(this.trainingPeriod.startDate, this.trainingPeriod.endDate);
      this.trainingRangeText = `${this.formatDate(this.trainingPeriod.startDate)} to ${this.formatDate(this.trainingPeriod.endDate)}`;
    }

    if (this.testingPeriod.startDate && this.testingPeriod.endDate) {
      this.testingDays = this.daysBetween(this.testingPeriod.startDate, this.testingPeriod.endDate);
      this.testingRangeText = `${this.formatDate(this.testingPeriod.startDate)} to ${this.formatDate(this.testingPeriod.endDate)}`;
    }

    if (this.simulationPeriod.startDate && this.simulationPeriod.endDate) {
      this.simulationDays = this.daysBetween(this.simulationPeriod.startDate, this.simulationPeriod.endDate);
      this.simulationRangeText = `${this.formatDate(this.simulationPeriod.startDate)} to ${this.formatDate(this.simulationPeriod.endDate)}`;
    }
  }

  private daysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}