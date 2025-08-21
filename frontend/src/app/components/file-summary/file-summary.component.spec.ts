import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSummaryComponent } from './file-summary.component';

describe('FileSummaryComponent', () => {
  let component: FileSummaryComponent;
  let fixture: ComponentFixture<FileSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
