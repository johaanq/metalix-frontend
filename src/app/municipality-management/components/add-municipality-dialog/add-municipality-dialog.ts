import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-municipality-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>location_city</mat-icon>
      Add Municipality
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="municipality-form">
        <div class="form-row">
          <!-- Name Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">location_city</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">Name</label>
              <input 
                type="text"
                formControlName="name"
                placeholder=" "
                class="glass-input-field"
                [class.has-value]="form.get('name')?.value && form.get('name')?.value.length > 0">
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <span class="error-message">Name is required</span>
              }
            </div>
          </div>

          <!-- Code Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">tag</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">Code</label>
              <input 
                type="text"
                formControlName="code"
                placeholder=" "
                class="glass-input-field"
                [class.has-value]="form.get('code')?.value && form.get('code')?.value.length > 0">
              @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
                <span class="error-message">Code is required</span>
              }
            </div>
          </div>
        </div>

        <div class="form-row">
          <!-- Region Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">public</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">Region</label>
              <input 
                type="text"
                formControlName="region"
                placeholder=" "
                class="glass-input-field"
                [class.has-value]="form.get('region')?.value && form.get('region')?.value.length > 0">
              @if (form.get('region')?.hasError('required') && form.get('region')?.touched) {
                <span class="error-message">Region is required</span>
              }
            </div>
          </div>

          <!-- District Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">place</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">District</label>
              <input 
                type="text"
                formControlName="district"
                placeholder=" "
                class="glass-input-field"
                [class.has-value]="form.get('district')?.value && form.get('district')?.value.length > 0">
              @if (form.get('district')?.hasError('required') && form.get('district')?.touched) {
                <span class="error-message">District is required</span>
              }
            </div>
          </div>
        </div>

        <div class="form-row">
          <!-- Population Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">people</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">Population</label>
              <input 
                type="number"
                formControlName="population"
                placeholder=" "
                class="glass-input-field"
                [class.has-value]="form.get('population')?.value">
              @if (form.get('population')?.hasError('required') && form.get('population')?.touched) {
                <span class="error-message">Population is required</span>
              }
            </div>
          </div>

          <!-- Area Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">square_foot</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">Area (km²)</label>
              <input 
                type="number"
                formControlName="area"
                placeholder=" "
                step="0.01"
                class="glass-input-field"
                [class.has-value]="form.get('area')?.value">
              @if (form.get('area')?.hasError('required') && form.get('area')?.touched) {
                <span class="error-message">Area is required</span>
              }
            </div>
          </div>
        </div>

        <!-- Address Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">home</mat-icon>
          </div>
          <div class="input-content">
            <label class="floating-label">Address</label>
            <input 
              type="text"
              formControlName="address"
              placeholder=" "
              class="glass-input-field"
              [class.has-value]="form.get('address')?.value && form.get('address')?.value.length > 0">
            @if (form.get('address')?.hasError('required') && form.get('address')?.touched) {
              <span class="error-message">Address is required</span>
            }
          </div>
        </div>

        <div class="form-row">
          <!-- Phone Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">phone</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">Phone</label>
              <input 
                type="tel"
                formControlName="phone"
                placeholder=" "
                class="glass-input-field"
                [class.has-value]="form.get('phone')?.value && form.get('phone')?.value.length > 0">
              @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
                <span class="error-message">Phone is required</span>
              }
            </div>
          </div>

          <!-- Email Field -->
          <div class="input-group glass-input">
            <div class="input-icon-wrapper">
              <mat-icon class="input-icon">email</mat-icon>
            </div>
            <div class="input-content">
              <label class="floating-label">Email</label>
              <input 
                type="email"
                formControlName="email"
                placeholder=" "
                class="glass-input-field"
                [class.has-value]="form.get('email')?.value && form.get('email')?.value.length > 0">
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <span class="error-message">Email is required</span>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <span class="error-message">Invalid email format</span>
              }
            </div>
          </div>
        </div>

        <!-- Website Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">language</mat-icon>
          </div>
          <div class="input-content">
            <label class="floating-label">Website</label>
            <input 
              type="url"
              formControlName="website"
              placeholder=" "
              class="glass-input-field"
              [class.has-value]="form.get('website')?.value && form.get('website')?.value.length > 0">
          </div>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!form.valid">
        <mat-icon>add</mat-icon>
        Add Municipality
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #1DB4C6;
      margin-bottom: 1.5rem;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.3px;
    }

    h2[mat-dialog-title] mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    mat-dialog-content {
      width: 600px;
      max-width: 90vw;
      max-height: 70vh;
      overflow-y: auto;
      padding: 2rem !important;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.95);
    }

    .municipality-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
      box-sizing: border-box;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      width: 100%;
      box-sizing: border-box;
    }

    /* Glass Input Styles */
    .input-group {
      position: relative;
      width: 100%;
    }

    .glass-input {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid rgba(255, 255, 255, 0.4);
      border-radius: 16px;
      padding: 16px 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      width: 100%;
      box-sizing: border-box;
    }

    .glass-input:hover {
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(29, 180, 198, 0.3);
      box-shadow: 
        0 6px 20px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    .glass-input:focus-within {
      background: rgba(255, 255, 255, 0.95);
      border-color: #1DB4C6;
      box-shadow: 
        0 8px 24px rgba(29, 180, 198, 0.15),
        0 0 0 4px rgba(29, 180, 198, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transform: translateY(-2px);
    }

    .input-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .input-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #64748b;
      transition: all 0.3s ease;
    }

    .glass-input:focus-within .input-icon {
      color: #1DB4C6;
      transform: scale(1.1);
    }

    .input-content {
      flex: 1;
      min-width: 0;
      width: 100%;
      min-height: 20px;
      position: relative;
    }

    .floating-label {
      position: absolute;
      left: 0;
      top: 0;
      font-size: 16px;
      font-weight: 500;
      color: #64748b;
      pointer-events: none;
      transition: opacity 0.1s ease, visibility 0.1s ease;
      opacity: 1;
      visibility: visible;
      z-index: 0;
      white-space: nowrap;
      line-height: 1.5;
    }

    .glass-input-field {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 16px;
      font-weight: 500;
      color: #0f172a;
      padding: 0;
      outline: none;
      font-family: 'Inter', sans-serif;
      line-height: 1.5;
      position: relative;
      z-index: 10;
      min-height: 20px;
    }

    .glass-input-field::placeholder {
      color: transparent;
    }

    .input-content:has(.glass-input-field:focus) .floating-label,
    .input-content:has(.glass-input-field.has-value) .floating-label,
    .input-content:has(.glass-input-field:not(:placeholder-shown)) .floating-label {
      opacity: 0 !important;
      visibility: hidden !important;
      display: none !important;
    }

    .error-message {
      display: block;
      font-size: 12px;
      color: #ef4444;
      margin-top: 8px;
      font-weight: 500;
    }

    mat-dialog-actions {
      padding: 1.5rem;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      margin-top: 1rem;
      background: rgba(248, 249, 250, 0.5);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    button mat-icon {
      margin-right: 0.5rem;
    }

    :host ::ng-deep button[mat-raised-button][color="primary"] {
      background: linear-gradient(135deg, #1DB4C6 0%, #20c997 100%) !important;
      color: white !important;
      border-radius: 14px !important;
      font-weight: 600 !important;
      padding: 12px 28px !important;
      box-shadow: 
        0 8px 24px rgba(29, 180, 198, 0.35),
        0 4px 12px rgba(29, 180, 198, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      position: relative !important;
      overflow: hidden !important;
    }

    :host ::ng-deep button[mat-raised-button][color="primary"]::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    :host ::ng-deep button[mat-raised-button][color="primary"]:hover::before {
      left: 100%;
    }

    :host ::ng-deep button[mat-raised-button][color="primary"]:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02) !important;
      box-shadow: 
        0 12px 32px rgba(29, 180, 198, 0.45),
        0 6px 16px rgba(29, 180, 198, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
      background: linear-gradient(135deg, #17a2b8 0%, #1aa179 100%) !important;
    }

    :host ::ng-deep button[mat-button] {
      color: #64748b !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      padding: 10px 20px !important;
      background: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    :host ::ng-deep button[mat-button]:hover:not(:disabled) {
      background: rgba(29, 180, 198, 0.15) !important;
      border-color: rgba(29, 180, 198, 0.3) !important;
      color: #1DB4C6 !important;
      transform: translateY(-2px) !important;
      box-shadow: 
        0 6px 20px rgba(29, 180, 198, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
    }
  `]
})
export class AddMunicipalityDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddMunicipalityDialogComponent>
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      region: ['Lima', Validators.required],
      district: ['', Validators.required],
      population: [0, [Validators.required, Validators.min(1)]],
      area: [0, [Validators.required, Validators.min(0.01)]],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      website: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
