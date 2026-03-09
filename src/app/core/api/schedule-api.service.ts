import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';
import type {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class ScheduleApiService extends BaseApiService<
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest
> {
  protected readonly endpoint = '/api/schedules';
}
