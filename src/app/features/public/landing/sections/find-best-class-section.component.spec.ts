import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../../../../core/tokens';
import { FindBestClassSectionComponent } from './find-best-class-section.component';

describe('FindBestClassSectionComponent', () => {
  let fixture: ComponentFixture<FindBestClassSectionComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FindBestClassSectionComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: API_BASE_URL, useValue: 'http://localhost:8080' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FindBestClassSectionComponent);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a form with 3 text inputs and 1 textarea', () => {
    const inputs = compiled.querySelectorAll('input[matInput]');
    const textareas = compiled.querySelectorAll('textarea[matInput]');
    expect(inputs.length).toBe(3);
    expect(textareas.length).toBe(1);
  });

  it('should render a submit button', () => {
    const btn = compiled.querySelector('button[type="submit"]');
    expect(btn).not.toBeNull();
    expect(btn?.textContent?.trim()).toContain('Đăng Ký Tư Vấn Ngay');
  });

  it('should display validation errors when form is submitted blank', () => {
    const btn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    const errors = compiled.querySelectorAll('mat-error');
    // At least one mat-error should appear after submitting blank form
    expect(errors.length).toBeGreaterThan(0);
  });

  it('form-fields container should exist and be a child of form-layout', () => {
    const layout = compiled.querySelector('.form-layout');
    const fields = compiled.querySelector('.form-fields');
    expect(layout).not.toBeNull();
    expect(fields).not.toBeNull();
    expect(layout?.contains(fields ?? null)).toBeTrue();
  });
});
