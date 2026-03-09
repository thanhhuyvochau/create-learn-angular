import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';
import type {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class SubjectApiService extends BaseApiService<
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest
> {
  protected readonly endpoint = '/api/subjects';
}
