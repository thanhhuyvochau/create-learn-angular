import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';
import type {
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class TeacherApiService extends BaseApiService<
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest
> {
  protected readonly endpoint = '/api/teachers';
}
