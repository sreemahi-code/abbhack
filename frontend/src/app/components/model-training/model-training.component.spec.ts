import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ModelTrainingComponent } from './model-training.component';

describe('ModelTrainingComponent', () => {
  let component: ModelTrainingComponent;
  let fixture: ComponentFixture<ModelTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelTrainingComponent ],
      imports: [ HttpClientTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.isTraining).toBeFalse();
    expect(component.isModelTrained).toBeFalse();
    expect(component.trainingStatus).toBe('');
    expect(component.metrics).toBeNull();
  });

  it('should show train button initially', () => {
    const compiled = fixture.nativeElement;
    const trainButton = compiled.querySelector('.train-btn');
    expect(trainButton).toBeTruthy();
    expect(trainButton.textContent.trim()).toBe('Train Model');
  });

  it('should disable train button when training', () => {
    component.isTraining = true;
    fixture.detectChanges();
    
    const trainButton = fixture.nativeElement.querySelector('.train-btn');
    expect(trainButton.disabled).toBeTruthy();
  });

  it('should show next button as disabled when model is not trained', () => {
    const nextButton = fixture.nativeElement.querySelector('.next-btn');
    expect(nextButton.disabled).toBeTruthy();
    expect(nextButton.classList.contains('enabled')).toBeFalsy();
  });

  it('should enable next button when model is trained', () => {
    component.isModelTrained = true;
    fixture.detectChanges();
    
    const nextButton = fixture.nativeElement.querySelector('.next-btn');
    expect(nextButton.disabled).toBeFalsy();
    expect(nextButton.classList.contains('enabled')).toBeTruthy();
  });
});