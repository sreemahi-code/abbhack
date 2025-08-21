import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

export interface PredictionData {
  time: string;
  sampleId: string;
  prediction: 'Pass' | 'Fail';
  confidence: number;
  temperature: number;
  pressure: number;
  humidity: number;
  qualityScore: number;
}

export interface SimulationStats {
  total: number;
  pass: number;
  fail: number;
  avgConfidence: number;
}

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit, OnDestroy {
  isSimulating = false;
  isCompleted = false;
  simulationData: PredictionData[] = [];
  stats: SimulationStats = {
    total: 0,
    pass: 0,
    fail: 0,
    avgConfidence: 0
  };

  private simulationInterval: any;
  private qualityChart: Chart | null = null;
  private confidenceChart: Chart | null = null;
  private simulationCounter = 0;

  // Mock data for simulation
  private mockSamples = [
    { temp: 31.6, pressure: 1028, humidity: 71.5, expectedQuality: 92 },
    { temp: 28.2, pressure: 1011, humidity: 66.7, expectedQuality: 88 },
    { temp: 26.8, pressure: 1056, humidity: 62.5, expectedQuality: 65 },
    { temp: 29.2, pressure: 1015, humidity: 52.3, expectedQuality: 78 },
    { temp: 30.8, pressure: 1024, humidity: 48.1, expectedQuality: 85 },
    { temp: 29.7, pressure: 1040, humidity: 55.7, expectedQuality: 82 },
    { temp: 29.5, pressure: 1032, humidity: 44.8, expectedQuality: 90 }
  ];

  constructor() {}

  ngOnInit(): void {
    this.initializeCharts();
  }

  startSimulation(): void {
    this.isSimulating = true;
    this.isCompleted = false;
    this.simulationCounter = 0;
    this.resetData();

    // Simulate streaming data every second
    this.simulationInterval = setInterval(() => {
      this.processNextSample();
    }, 1000);
  }

  restartSimulation(): void {
    this.resetData();
    this.startSimulation();
  }

  private resetData(): void {
    this.simulationData = [];
    this.stats = {
      total: 0,
      pass: 0,
      fail: 0,
      avgConfidence: 0
    };
    this.simulationCounter = 0;
    
    // Reset charts
    if (this.qualityChart) {
      this.qualityChart.data.labels = [];
      this.qualityChart.data.datasets[0].data = [];
      this.qualityChart.update();
    }
  }

  private processNextSample(): void {
    if (this.simulationCounter >= 20) { // Simulate 20 samples
      this.completeSimulation();
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    // Get mock sample data (cycle through available samples)
    const sampleIndex = this.simulationCounter % this.mockSamples.length;
    const sample = this.mockSamples[sampleIndex];
    
    // Add some randomness
    const qualityScore = sample.expectedQuality + (Math.random() - 0.5) * 10;
    const confidence = 70 + Math.random() * 25; // 70-95% confidence
    const prediction: 'Pass' | 'Fail' = qualityScore > 70 ? 'Pass' : 'Fail';

    const newData: PredictionData = {
      time: timeStr,
      sampleId: `SAMPLE_${String(this.simulationCounter + 1).padStart(3, '0')}`,
      prediction: prediction,
      confidence: Math.round(confidence),
      temperature: sample.temp,
      pressure: sample.pressure,
      humidity: sample.humidity,
      qualityScore: Math.round(qualityScore)
    };

    // Add to data array (keep only last 10 for table display)
    this.simulationData.unshift(newData);
    if (this.simulationData.length > 10) {
      this.simulationData.pop();
    }

    // Update statistics
    this.stats.total++;
    if (prediction === 'Pass') {
      this.stats.pass++;
    } else {
      this.stats.fail++;
    }
    this.stats.avgConfidence = Math.round(
      (this.stats.avgConfidence * (this.stats.total - 1) + confidence) / this.stats.total
    );

    // Update charts
    this.updateQualityChart(timeStr, qualityScore);
    this.updateConfidenceChart();

    this.simulationCounter++;
  }

  private completeSimulation(): void {
    this.isSimulating = false;
    this.isCompleted = true;
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  private initializeCharts(): void {
    setTimeout(() => {
      this.createQualityChart();
      this.createConfidenceChart();
    }, 100);
  }

  private createQualityChart(): void {
    const canvas = document.getElementById('qualityChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: [{
          label: 'Quality Score',
          data: [],
          borderColor: '#4A90E2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Quality Score'
            },
            min: 0,
            max: 100
          }
        },
        animation: {
          duration: 0
        }
      }
    };

    this.qualityChart = new Chart(ctx, config);
  }

  private createConfidenceChart(): void {
    const canvas = document.getElementById('confidenceChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Pass', 'Fail'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#4CAF50', '#F44336'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },

      }
    };

    this.confidenceChart = new Chart(ctx, config);
  }

  private updateQualityChart(time: string, qualityScore: number): void {
    if (!this.qualityChart) return;

    this.qualityChart.data.labels?.push(time);
    this.qualityChart.data.datasets[0].data.push(qualityScore);

    // Keep only last 10 points
    if (this.qualityChart.data.labels && this.qualityChart.data.labels.length > 10) {
      this.qualityChart.data.labels.shift();
      this.qualityChart.data.datasets[0].data.shift();
    }

    this.qualityChart.update('none');
  }

  private updateConfidenceChart(): void {
    if (!this.confidenceChart) return;

    this.confidenceChart.data.datasets[0].data = [this.stats.pass, this.stats.fail];
    this.confidenceChart.update('none');
  }

  ngOnDestroy(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.qualityChart) {
      this.qualityChart.destroy();
    }
    if (this.confidenceChart) {
      this.confidenceChart.destroy();
    }
  }
}