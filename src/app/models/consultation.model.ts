import type { ApiFilters, BaseEntity } from './base.model';

export type ConsultationStatus = 'PROCESSING' | 'PROCESSED' | 'REJECTED';

export interface Consultation extends BaseEntity {
  customerName: string;
  phoneNumber: string;
  email: string;
  content: string;
  status: ConsultationStatus;
}

export interface CreateConsultationRequest {
  customerName: string;
  phoneNumber: string;
  email: string;
  content: string;
}

export interface UpdateConsultationRequest extends Partial<CreateConsultationRequest> {
  id: number;
  status?: ConsultationStatus;
}

export interface ConsultationApiFilters extends ApiFilters {
  customerName?: string;
  status?: ConsultationStatus;
}
