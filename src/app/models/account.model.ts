import type { ApiFilters, BaseEntity } from './base.model';

export interface Account extends BaseEntity {
  email: string;
  password: string;
  username: string;
  phone: string;
  activated: boolean;
}

export type CreateAccountRequest = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  id: number;
}

export type AccountApiFilters = ApiFilters;
