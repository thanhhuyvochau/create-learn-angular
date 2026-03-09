import type { ApiFilters, BaseEntity } from './base.model';
import type { Gender } from './teacher.model';

export type RegistrationStatus = 'PROCESSING' | 'PROCESSED' | 'REJECTED';

export interface RegistrationClassResponse {
  id: number;
  name: string;
  brief: string;
  description: string;
  image: string;
  requirement: string;
  guarantee: string;
  isDisplayed: boolean;
  subjects: Array<{
    id: number;
    name: string;
    description: string;
    iconBase64: string;
  }>;
  grades: Array<{
    id: number;
    name: string;
    description: string;
    iconBase64: string | null;
  }>;
  teacher: {
    id: number;
    firstName: string;
    lastName: string;
    introduction: string;
    gender: Gender;
    profileImageUrl: string;
  };
  price: number;
  scheduleResponses: unknown[];
}

export interface Registration extends BaseEntity {
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  clazzId: number;
  status: RegistrationStatus;
  classResponse: RegistrationClassResponse;
}

export interface CreateRegistrationRequest {
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  status: RegistrationStatus;
  clazzId: number;
}

export interface UpdateRegistrationRequest extends Partial<CreateRegistrationRequest> {
  id: number;
}

export interface RegistrationApiFilters extends ApiFilters {
  customerName?: string;
  status?: RegistrationStatus;
  clazzId?: number;
}

export interface ClassOption {
  value: string;
  label: string;
}
