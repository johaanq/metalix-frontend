import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-collection-point-dialog',
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
      <mat-icon>{{ data ? 'edit_location' : 'add_location' }}</mat-icon>
      {{ data ? 'Edit Collection Point' : 'Add Collection Point' }}
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="collection-point-form">
        <!-- Name Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">location_on</mat-icon>
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

        <!-- Capacity Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">scale</mat-icon>
          </div>
          <div class="input-content">
            <label class="floating-label">Capacity (kg)</label>
            <input 
              type="number"
              formControlName="capacity"
              placeholder=" "
              class="glass-input-field"
              [class.has-value]="form.get('capacity')?.value">
            @if (form.get('capacity')?.hasError('required') && form.get('capacity')?.touched) {
              <span class="error-message">Capacity is required</span>
            }
            @if (form.get('capacity')?.hasError('min') && form.get('capacity')?.touched) {
              <span class="error-message">Capacity must be greater than 0</span>
            }
          </div>
        </div>

        <!-- Status Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">check_circle</mat-icon>
          </div>
          <div class="input-content">
            <label class="floating-label">Status</label>
            <mat-select 
              formControlName="status"
              class="glass-select"
              [class.has-value]="form.get('status')?.value">
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="INACTIVE">Inactive</mat-option>
              <mat-option value="MAINTENANCE">Maintenance</mat-option>
            </mat-select>
          </div>
        </div>

        <!-- Zone Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">map</mat-icon>
          </div>
          <div class="input-content">
            <label class="floating-label">Zone</label>
            <mat-select 
              formControlName="zoneId"
              class="glass-select"
              [class.has-value]="form.get('zoneId')?.value">
              <mat-option value="1">Zona Centro</mat-option>
              <mat-option value="2">Zona Comercial</mat-option>
            </mat-select>
          </div>
        </div>

        <!-- Latitude Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">my_location</mat-icon>
          </div>
          <div class="input-content">
            <label class="floating-label">Latitude</label>
            <input 
              type="number"
              formControlName="latitude"
              placeholder=" "
              step="0.0001"
              class="glass-input-field"
              [class.has-value]="form.get('latitude')?.value">
            @if (form.get('latitude')?.hasError('required') && form.get('latitude')?.touched) {
              <span class="error-message">Latitude is required</span>
            }
          </div>
        </div>

        <!-- Longitude Field -->
        <div class="input-group glass-input">
          <div class="input-icon-wrapper">
            <mat-icon class="input-icon">place</mat-icon>
          </div>
          <div class="input-content">
            <label class="floating-label">Longitude</label>
            <input 
              type="number"
              formControlName="longitude"
              placeholder=" "
              step="0.0001"
              class="glass-input-field"
              [class.has-value]="form.get('longitude')?.value">
            @if (form.get('longitude')?.hasError('required') && form.get('longitude')?.touched) {
              <span class="error-message">Longitude is required</span>
            }
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
        <mat-icon>{{ data ? 'save' : 'add' }}</mat-icon>
        {{ data ? 'Update Collection Point' : 'Add Collection Point' }}
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
      width: 550px;
      max-width: 90vw;
      max-height: 70vh;
      overflow-y: auto;
      padding: 2rem !important;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.95);
    }

    .collection-point-form {
      display: flex;
      flex-direction: column;
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

    .glass-select {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 16px;
      font-weight: 500;
      color: #0f172a;
      padding: 0;
      outline: none;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      position: relative;
      z-index: 10;
    }

    :host ::ng-deep .mat-mdc-select {
      background: transparent !important;
    }

    :host ::ng-deep .mat-mdc-select-trigger {
      padding: 0 !important;
      min-height: auto !important;
      height: auto !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      font-size: 16px !important;
      font-weight: 500 !important;
      color: #0f172a !important;
      font-family: 'Inter', sans-serif !important;
    }

    :host ::ng-deep .mat-mdc-form-field,
    :host ::ng-deep .mat-mdc-text-field-wrapper,
    :host ::ng-deep .mdc-text-field {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .input-content:has(.mat-mdc-select:not([value=""])) .floating-label,
    .input-content:has(.mat-mdc-select:not([value="all"])) .floating-label {
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
export class AddCollectionPointDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCollectionPointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // If data exists, we're editing; otherwise, we're adding
    const isEdit = !!data;
    
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      address: [data?.address || '', Validators.required],
      capacity: [data?.capacity ? parseInt(data.capacity.replace(' kg', '')) : 100, [Validators.required, Validators.min(1)]],
      status: [data?.status || 'ACTIVE', Validators.required],
      zoneId: [data?.zoneId || '1', Validators.required],
      latitude: [data?.latitude || -12.1100, Validators.required],
      longitude: [data?.longitude || -77.0300, Validators.required]
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
