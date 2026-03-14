import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

interface DialogData {
  classId: number;
  className: string;
}

@Component({
  selector: 'app-registration-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Dang ky lop hoc</h2>
    <mat-dialog-content>
      <p class="class-name">{{ data.className }}</p>
      <form [formGroup]="form" class="registration-form">
        <mat-form-field appearance="outline">
          <mat-label>Ho va ten</mat-label>
          <input matInput formControlName="customerName" placeholder="Nhap ho va ten" />
          @if (form.get('customerName')?.hasError('required') && form.get('customerName')?.touched) {
            <mat-error>Ho va ten la bat buoc</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="customerEmail" placeholder="Nhap email" />
          @if (form.get('customerEmail')?.hasError('required') && form.get('customerEmail')?.touched) {
            <mat-error>Email la bat buoc</mat-error>
          }
          @if (form.get('customerEmail')?.hasError('email') && form.get('customerEmail')?.touched) {
            <mat-error>Email khong hop le</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>So dien thoai</mat-label>
          <input matInput formControlName="phoneNumber" placeholder="Nhap so dien thoai" />
          @if (form.get('phoneNumber')?.hasError('required') && form.get('phoneNumber')?.touched) {
            <mat-error>So dien thoai la bat buoc</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Huy</button>
      <button mat-raised-button color="primary" (click)="onSubmit()">Dang ky</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .class-name {
      font-size: 1.125rem;
      font-weight: 500;
      color: #2563eb;
      margin: 0 0 20px 0;
    }

    .registration-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 300px;
    }

    mat-form-field {
      width: 100%;
    }
  `],
})
export class RegistrationDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RegistrationDialogComponent>);
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    customerName: ['', Validators.required],
    customerEmail: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
