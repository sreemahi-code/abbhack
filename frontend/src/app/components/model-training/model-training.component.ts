import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { Router } from '@angular/router';

Chart.register(...registerables);

export interface TrainingMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: {
    epochs: number[];
    accuracy: number[];
    loss: number[];
  };
  confusionMatrix: {
    truePositive: number;
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
  };
}

export interface TrainingRequest {
  trainStart: string;
  trainEnd: string;
  testStart: string;
  testEnd: string;
}

@Component({
  selector: 'app-model-training',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-training.component.html',
  styleUrls: ['./model-training.component.css']
})
export class ModelTrainingComponent implements OnInit {
  isTraining = false;
  isModelTrained = false;
  trainingStatus = '';
  metrics: TrainingMetrics | null = null;
  
  private trainingChart: Chart | null = null;
  private confusionChart: Chart | null = null;

 constructor(private router: Router) {}

  ngOnInit(): void {
    // Component initialization
  }

  async trainModel(): Promise<void> {
    this.isTraining = true;
    this.trainingStatus = 'Training in progress...';
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock response data matching your design
      const mockResponse: TrainingMetrics = {
        accuracy: 0.942,
        precision: 0.928,
        recall: 0.915,
        f1Score: 0.921,
        trainingData: {
          epochs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          accuracy: [0.7, 0.75, 0.8, 0.82, 0.85, 0.87, 0.89, 0.9, 0.91, 0.92, 0.923, 0.925, 0.928, 0.93, 0.932, 0.935, 0.938, 0.94, 0.941, 0.942],
          loss: [0.8, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4, 0.38, 0.35, 0.33, 0.31, 0.29, 0.27, 0.25, 0.23, 0.22, 0.21, 0.205, 0.202, 0.2]
        },
        confusionMatrix: {
          truePositive: 450,
          trueNegative: 380,
          falsePositive: 25,
          falseNegative: 35
        }
      };
      
      this.metrics = mockResponse;
      this.isModelTrained = true;
      this.trainingStatus = 'Model Trained Successfully';
      
      // Create charts after getting the data
      setTimeout(() => {
        this.createTrainingChart();
        this.createConfusionChart();
      }, 100);

    } catch (error) {
      console.error('Training failed:', error);
      this.trainingStatus = 'Training failed. Please try again.';
    } finally {
      this.isTraining = false;
    }
  }

  private createTrainingChart(): void {
    const canvas = document.getElementById('trainingChart') as HTMLCanvasElement;
    if (!canvas || !this.metrics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.trainingChart) {
      this.trainingChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: this.metrics.trainingData.epochs,
        datasets: [
          {
            label: 'Training Accuracy',
            data: this.metrics.trainingData.accuracy,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Training Loss',
            data: this.metrics.trainingData.loss,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Training Metrics'
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Epochs'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Accuracy'
            },
            min: 0,
            max: 1
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Loss'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    };

    this.trainingChart = new Chart(ctx, config);
  }

  private createConfusionChart(): void {
    const canvas = document.getElementById('confusionChart') as HTMLCanvasElement;
    if (!canvas || !this.metrics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.confusionChart) {
      this.confusionChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['True Positive', 'True Negative', 'False Positive', 'False Negative'],
        datasets: [{
          data: [
            this.metrics.confusionMatrix.truePositive,
            this.metrics.confusionMatrix.trueNegative,
            this.metrics.confusionMatrix.falsePositive,
            this.metrics.confusionMatrix.falseNegative
          ],
          backgroundColor: [
            '#4CAF50',
            '#2196F3', 
            '#FF9800',
            '#F44336'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Model Performance'
          }
        }
      }
    };

    this.confusionChart = new Chart(ctx, config);
  }

  proceedToNext(): void {
  this.router.navigate(['/simulation']);
}

  
  ngOnDestroy(): void {
    if (this.trainingChart) {
      this.trainingChart.destroy();
    }
    if (this.confusionChart) {
      this.confusionChart.destroy();
    }
  }
}