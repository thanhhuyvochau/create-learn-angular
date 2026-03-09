import type { ApiFilters, BaseEntity } from './base.model';

export interface Schedule extends BaseEntity {
  time: string;
  clazzId: number;
}

export interface CreateScheduleRequest {
  time: string;
  clazzId: number;
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  id: number;
}

export interface ScheduleApiFilters extends ApiFilters {
  clazzId?: number;
}
