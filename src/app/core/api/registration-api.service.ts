import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';
import type {
  Registration,
  CreateRegistrationRequest,
  UpdateRegistrationRequest,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class RegistrationApiService extends BaseApiService<
  Registration,
  CreateRegistrationRequest,
  UpdateRegistrationRequest
> {
  protected readonly endpoint = '/api/registrations';
}
