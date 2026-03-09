import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from './base-api.service';
import type {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
  ApiSingleResponse,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class AccountApiService extends BaseApiService<
  Account,
  CreateAccountRequest,
  UpdateAccountRequest
> {
  protected readonly endpoint = '/api/accounts';

  /**
   * Get current authenticated user's profile
   */
  getCurrentProfile(): Observable<ApiSingleResponse<Account>> {
    return this.http.get<ApiSingleResponse<Account>>(
      `${this.baseUrl}/api/accounts/profile`
    );
  }
}
