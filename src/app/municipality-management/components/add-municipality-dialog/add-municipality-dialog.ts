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
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Municipalidad de Surco">
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. SUR001">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Code is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Region</mat-label>
            <input matInput formControlName="region" placeholder="e.g. Lima">
            @if (form.get('region')?.hasError('required') && form.get('region')?.touched) {
              <mat-error>Region is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>District</mat-label>
            <input matInput formControlName="district" placeholder="e.g. Surco">
            @if (form.get('district')?.hasError('required') && form.get('district')?.touched) {
              <mat-error>District is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Population</mat-label>
            <input matInput type="number" formControlName="population" placeholder="e.g. 150000">
            @if (form.get('population')?.hasError('required') && form.get('population')?.touched) {
              <mat-error>Population is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Area (km²)</mat-label>
            <input matInput type="number" formControlName="area" placeholder="e.g. 34.75" step="0.01">
            @if (form.get('area')?.hasError('required') && form.get('area')?.touched) {
              <mat-error>Area is required</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" placeholder="e.g. Av. Principal 123">
          @if (form.get('address')?.hasError('required') && form.get('address')?.touched) {
            <mat-error>Address is required</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="e.g. +51-1-123-4567">
            @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
              <mat-error>Phone is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="e.g. contacto@surco.gob.pe">
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Invalid email format</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Website</mat-label>
          <input matInput formControlName="website" placeholder="e.g. https://www.surco.gob.pe">
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
      gap: 0.5rem;
      color: #3f51b5;
      margin-bottom: 1rem;
    }

    mat-dialog-content {
      width: 600px;
      max-width: 90vw;
      max-height: 70vh;
      overflow-y: auto;
      padding: 2rem !important;
      box-sizing: border-box;
    }

    .municipality-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
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
