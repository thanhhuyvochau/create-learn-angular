import type { ApiFilters, BaseEntity } from './base.model';

export type Gender = 'MALE' | 'FEMALE';

export interface Teacher extends BaseEntity {
  firstName: string;
  lastName: string;
  introduction: string;
  gender: Gender;
  profileImageUrl: string;
}

export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  introduction: string;
  gender: Gender;
  profileImageUrl: string;
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  id: number;
}

export interface TeacherApiFilters extends ApiFilters {
  gender?: Gender;
}
