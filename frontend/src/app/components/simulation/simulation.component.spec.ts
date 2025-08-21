import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationComponent } from './simulation.component';

describe('SimulationComponent', () => {
  let component: SimulationComponent;
  let fixture: ComponentFixture<SimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SimulationComponent ] // Note: using imports for standalone component
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.isSimulating).toBeFalse();
    expect(component.isCompleted).toBeFalse();
    expect(component.simulationData).toEqual([]);
    expect(component.stats.total).toBe(0);
    expect(component.stats.pass).toBe(0);
    expect(component.stats.fail).toBe(0);
    expect(component.stats.avgConfidence).toBe(0);
  });

  it('should show start simulation button initially', () => {
    const compiled = fixture.nativeElement;
    const startButton = compiled.querySelector('.start-btn');
    expect(startButton).toBeTruthy();
    expect(startButton.textContent.trim()).toBe('Start Simulation');
  });

  it('should start simulation when start button is clicked', () => {
    spyOn(component, 'startSimulation');
    const startButton = fixture.nativeElement.querySelector('.start-btn');
    
    startButton.click();
    
    expect(component.startSimulation).toHaveBeenCalled();
  });

  it('should show restart button when simulation is completed', () => {
    component.isCompleted = true;
    component.isSimulating = false;
    fixture.detectChanges();
    
    const restartButton = fixture.nativeElement.querySelector('.restart-btn');
    expect(restartButton).toBeTruthy();
    expect(restartButton.textContent.trim()).toBe('Restart Simulation');
  });

  it('should display empty state when no simulation data', () => {
    component.simulationData = [];
    fixture.detectChanges();
    
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should update stats correctly', () => {
    // Simulate adding some data
    component.stats = {
      total: 10,
      pass: 7,
      fail: 3,
      avgConfidence: 85
    };
    fixture.detectChanges();
    
    const statValues = fixture.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[0].textContent.trim()).toBe('10');
    expect(statValues[1].textContent.trim()).toBe('7');
    expect(statValues[2].textContent.trim()).toBe('3');
    expect(statValues[3].textContent.trim()).toBe('85%');
  });
});