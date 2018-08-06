import { async, TestBed, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { RatingComponent } from './rating';

describe('RatingComponent', () => {
  let component: RatingComponent;
  let fixture: ComponentFixture<RatingComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RatingComponent],
      imports: [
        IonicModule.forRoot(RatingComponent)
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingComponent);
    component = fixture.componentInstance;

    de = fixture.debugElement.query(By.css('ul'));
    el = de.nativeElement;
  });

  it('should be created', () => {
    expect(component instanceof RatingComponent).toBe(true);
  });

  it('should show 5 stars by default', () => {
    expect(el.childElementCount).toBe(5);
  });

  it('should reflect max value', () => {
    component.max = 10;
    fixture.detectChanges();
    expect(el.childElementCount).toBe(10);
  });

});
