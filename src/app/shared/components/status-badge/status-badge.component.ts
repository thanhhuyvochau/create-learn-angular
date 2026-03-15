import { Component, input, computed } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

export type StatusType =
  | 'PROCESSING'
  | 'PROCESSED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'HIDDEN'
  | 'PUBLISHED'
  | 'DRAFT'
  | string;

export interface StatusConfig {
  label: string;
  color: 'primary' | 'accent' | 'warn' | 'default';
  bgColor: string;
  textColor: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  PROCESSING: {
    label: 'Processing',
    color: 'primary',
    bgColor: '#e3f2fd',
    textColor: '#1565c0',
  },
  PROCESSED: {
    label: 'Processed',
    color: 'accent',
    bgColor: '#e8f5e9',
    textColor: '#2e7d32',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'warn',
    bgColor: '#ffebee',
    textColor: '#c62828',
  },
  ACTIVE: {
    label: 'Active',
    color: 'accent',
    bgColor: '#e8f5e9',
    textColor: '#2e7d32',
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'default',
    bgColor: '#f5f5f5',
    textColor: '#616161',
  },
  HIDDEN: {
    label: 'Hidden',
    color: 'warn',
    bgColor: '#ffebee',
    textColor: '#c62828',
  },
  PUBLISHED: {
    label: 'Published',
    color: 'accent',
    bgColor: '#e8f5e9',
    textColor: '#2e7d32',
  },
  DRAFT: {
    label: 'Draft',
    color: 'default',
    bgColor: '#fff3e0',
    textColor: '#e65100',
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: 'Unknown',
  color: 'default',
  bgColor: '#f5f5f5',
  textColor: '#616161',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <span
      class="status-badge"
      [style.background-color]="config().bgColor"
      [style.color]="config().textColor"
    >
      {{ config().label }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        text-transform: capitalize;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  status = input.required<StatusType>();
  customConfig = input<StatusConfig | null>(null);

  config = computed<StatusConfig>(() => {
    if (this.customConfig()) {
      return this.customConfig()!;
    }
    const statusKey = this.status().toUpperCase();
    return STATUS_CONFIGS[statusKey] || {
      ...DEFAULT_CONFIG,
      label: this.status(),
    };
  });
}
