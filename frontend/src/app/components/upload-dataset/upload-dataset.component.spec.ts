import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar'; // ✅ import toolbar

@Component({
  selector: 'app-upload-dataset',
  templateUrl: './upload-dataset.component.html',
  styleUrls: ['./upload-dataset.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatGridListModule,
    MatToolbarModule   // ✅ add toolbar module
  ]
})
export class UploadDatasetComponent {
  fileName: string | null = null;
  fileSize: string | null = null;
  showSummary = false;

  // Mock summary data
  records = 14704;
  columns = 5;
  passRate = '70%';
  dateRange = '2021-01-01 to 2021-12-31';

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.fileSize = (file.size / 1024).toFixed(1) + ' KB';
      this.showSummary = true;
    }
  }
}
