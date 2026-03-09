import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';
import type {
  Consultation,
  CreateConsultationRequest,
  UpdateConsultationRequest,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class ConsultationApiService extends BaseApiService<
  Consultation,
  CreateConsultationRequest,
  UpdateConsultationRequest
> {
  protected readonly endpoint = '/api/consultations';
}
