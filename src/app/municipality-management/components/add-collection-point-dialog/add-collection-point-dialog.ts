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
      <mat-icon>add_location</mat-icon>
      Add Collection Point
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="collection-point-form">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Collection Point Centro-001">
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" placeholder="e.g. Av. Larco 200, Miraflores">
          @if (form.get('address')?.hasError('required') && form.get('address')?.touched) {
            <mat-error>Address is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Capacity (kg)</mat-label>
          <input matInput type="number" formControlName="capacity" placeholder="e.g. 100">
          @if (form.get('capacity')?.hasError('required') && form.get('capacity')?.touched) {
            <mat-error>Capacity is required</mat-error>
          }
          @if (form.get('capacity')?.hasError('min') && form.get('capacity')?.touched) {
            <mat-error>Capacity must be greater than 0</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="INACTIVE">Inactive</mat-option>
            <mat-option value="MAINTENANCE">Maintenance</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Zone</mat-label>
          <mat-select formControlName="zoneId">
            <mat-option value="1">Zona Centro</mat-option>
            <mat-option value="2">Zona Comercial</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Latitude</mat-label>
          <input matInput type="number" formControlName="latitude" placeholder="e.g. -12.1100" step="0.0001">
          @if (form.get('latitude')?.hasError('required') && form.get('latitude')?.touched) {
            <mat-error>Latitude is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Longitude</mat-label>
          <input matInput type="number" formControlName="longitude" placeholder="e.g. -77.0300" step="0.0001">
          @if (form.get('longitude')?.hasError('required') && form.get('longitude')?.touched) {
            <mat-error>Longitude is required</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!form.valid">
        <mat-icon>add</mat-icon>
        Add Collection Point
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
      gap: 0.5rem;
      color: #3f51b5;
      margin-bottom: 1rem;
    }

    mat-dialog-content {
      width: 550px;
      max-width: 90vw;
      max-height: 70vh;
      overflow-y: auto;
      padding: 2rem !important;
      box-sizing: border-box;
    }

    .collection-point-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    mat-form-field {
      width: 100%;
    }

    :host ::ng-deep .mat-mdc-form-field {
      display: block;
    }

    :host ::ng-deep .mat-mdc-text-field-wrapper {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
      margin-top: 1rem;
    }

    button mat-icon {
      margin-right: 0.25rem;
    }
  `]
})
export class AddCollectionPointDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCollectionPointDialogComponent>
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      capacity: [100, [Validators.required, Validators.min(1)]],
      status: ['ACTIVE', Validators.required],
      zoneId: ['1', Validators.required],
      latitude: [-12.1100, Validators.required],
      longitude: [-77.0300, Validators.required]
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
