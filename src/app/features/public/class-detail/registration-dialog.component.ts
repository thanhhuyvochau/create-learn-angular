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
    <h2 mat-dialog-title>Đăng ký lớp học</h2>
    <mat-dialog-content>
      <p class="class-name">{{ data.className }}</p>
      <form [formGroup]="form" class="registration-form">
        <mat-form-field appearance="outline">
          <mat-label>Họ và tên</mat-label>
          <input matInput formControlName="customerName" placeholder="Nhập họ và tên" />
          @if (form.get('customerName')?.hasError('required') && form.get('customerName')?.touched) {
            <mat-error>Họ và tên là bắt buộc</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="customerEmail" placeholder="Nhập email" />
          @if (form.get('customerEmail')?.hasError('required') && form.get('customerEmail')?.touched) {
            <mat-error>Email là bắt buộc</mat-error>
          }
          @if (form.get('customerEmail')?.hasError('email') && form.get('customerEmail')?.touched) {
            <mat-error>Email không hợp lệ</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Số điện thoại</mat-label>
          <input matInput formControlName="phoneNumber" placeholder="Nhập số điện thoại" />
          @if (form.get('phoneNumber')?.hasError('required') && form.get('phoneNumber')?.touched) {
            <mat-error>Số điện thoại là bắt buộc</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Hủy</button>
      <button mat-raised-button color="primary" (click)="onSubmit()">Đăng ký</button>
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
