import type { ApiFilters, BaseEntity } from './base.model';

export interface Subject extends BaseEntity {
  name: string;
  description?: string;
  iconBase64?: string;
  icon?: string | File;
}

export interface CreateSubjectRequest {
  name: string;
  description?: string;
  icon?: File;
}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {
  id: number;
}

export interface SubjectApiFilters extends ApiFilters {
  name?: string;
}
