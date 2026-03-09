import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';
import type {
  Grade,
  CreateGradeRequest,
  UpdateGradeRequest,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class GradeApiService extends BaseApiService<
  Grade,
  CreateGradeRequest,
  UpdateGradeRequest
> {
  protected readonly endpoint = '/api/grades';
}
