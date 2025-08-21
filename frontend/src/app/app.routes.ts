import { Routes } from '@angular/router';
import { UploadDatasetComponent } from './components/upload-dataset/upload-dataset.component';
import { DateRangesComponent } from './components/date-ranges/date-ranges.component';
import { ModelTrainingComponent } from './components/model-training/model-training.component';
import { SimulationComponent } from './components/simulation/simulation.component';

export const routes: Routes = [
  { path: '', redirectTo: '/upload-dataset', pathMatch: 'full' },
  { path: 'upload-dataset', component: UploadDatasetComponent },
  { path: 'date-ranges', component: DateRangesComponent },
  // Add other routes as needed
  { path: 'model-training', component: ModelTrainingComponent },
  { path: 'simulation', component: SimulationComponent },
  { path: '**', redirectTo: '/upload-dataset' } // Fallback route
];