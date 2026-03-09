import type { ApiFilters, BaseEntity } from './base.model';

export interface Grade extends BaseEntity {
  name: string;
  description?: string;
  iconBase64?: string;
  icon?: string | File;
}

export interface CreateGradeRequest {
  name: string;
  description?: string;
  icon?: File;
}

export interface UpdateGradeRequest extends Partial<CreateGradeRequest> {
  id: number;
}

export interface GradeApiFilters extends ApiFilters {
  name?: string;
}
