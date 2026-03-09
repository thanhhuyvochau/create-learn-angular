import type { ApiFilters, BaseEntity } from './base.model';
import type { Subject } from './subject.model';
import type { Grade } from './grade.model';
import type { Teacher } from './teacher.model';
import type { Schedule } from './schedule.model';

export interface Class extends BaseEntity {
  name: string;
  brief: string;
  description: string;
  image: string;
  requirement: string;
  guarantee: string;
  isDisplayed: boolean;
  subjects: Subject[];
  grades: Grade[];
  teacher: Teacher | null;
  price: number;
  scheduleResponses: Schedule[];
  subjectIds: number[];
  gradeIds: number[];
  teacherId?: number | null;
}

export interface CreateClassRequest {
  name: string;
  brief: string;
  description: string;
  image: string;
  requirement: string;
  guarantee: string;
  isDisplayed: boolean;
  subjectIds: number[];
  gradeIds: number[];
  teacherId?: number | null;
  price: number;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {
  id: number;
}

export interface ClassApiFilters extends ApiFilters {
  type?: string;
  gradeId?: number;
  subjectId?: number;
}
