import { inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { NotificationService } from '../notifications/notification.service';
import type { BaseEntity, ApiFilters, ApiListResponse } from '../../models';
import type { BaseApiService } from '../api/base-api.service';

export interface EntityCrudState<T> {
  entities: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Generic CRUD service for entity management pages
 * Extend this class and provide it at the component level
 */
export abstract class EntityCrudService<
  T extends BaseEntity,
  CreateT = Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  UpdateT = Partial<CreateT>
> {
  protected readonly notification = inject(NotificationService);

  protected abstract readonly apiService: BaseApiService<T, CreateT, UpdateT>;
  protected abstract readonly entityName: string;

  // Writable signals for internal state
  private readonly _entities = signal<T[]>([]);
  private readonly _totalElements = signal<number>(0);
  private readonly _totalPages = signal<number>(0);
  private readonly _pageNumber = signal<number>(0);
  private readonly _pageSize = signal<number>(10);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Dialog state
  private readonly _selectedEntity = signal<T | null>(null);
  private readonly _entityToDelete = signal<T | null>(null);
  private readonly _isFormOpen = signal<boolean>(false);
  private readonly _isDeleteDialogOpen = signal<boolean>(false);

  // Public readonly signals
  readonly entities = this._entities.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly pageNumber = this._pageNumber.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedEntity = this._selectedEntity.asReadonly();
  readonly entityToDelete = this._entityToDelete.asReadonly();
  readonly isFormOpen = this._isFormOpen.asReadonly();
  readonly isDeleteDialogOpen = this._isDeleteDialogOpen.asReadonly();

  // Computed state
  readonly state = computed<EntityCrudState<T>>(() => ({
    entities: this._entities(),
    totalElements: this._totalElements(),
    totalPages: this._totalPages(),
    pageNumber: this._pageNumber(),
    pageSize: this._pageSize(),
    isLoading: this._isLoading(),
    error: this._error(),
  }));

  /**
   * Load a page of entities
   */
  async loadPage(filters?: ApiFilters): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    const page = filters?.page ?? this._pageNumber();
    const size = filters?.size ?? this._pageSize();

    try {
      const response = await firstValueFrom(
        this.apiService.getAll({ ...filters, page, size })
      );

      if (response?.data) {
        this._entities.set(response.data.data);
        this._totalElements.set(response.data.totalElements);
        this._totalPages.set(response.data.totalPages);
        this._pageNumber.set(response.data.pageNumber);
        this._pageSize.set(response.data.pageSize);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to load ${this.entityName}s`;
      this._error.set(message);
      this.notification.showError(message);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get entity by ID - checks cache first, then API
   */
  async getEntityById(id: number | string): Promise<T | null> {
    // Check cache first
    const cached = this._entities().find((e) => String(e.id) === String(id));
    if (cached) return cached;

    // Fetch from API
    try {
      const response = await firstValueFrom(this.apiService.getById(id));
      return response?.data ?? null;
    } catch (err) {
      console.error(`Failed to get ${this.entityName} by ID:`, err);
      return null;
    }
  }

  /**
   * Open form dialog for adding new entity
   */
  openAdd(): void {
    this._selectedEntity.set(null);
    this._isFormOpen.set(true);
  }

  /**
   * Open form dialog for editing entity
   */
  openEdit(entity: T): void {
    this._selectedEntity.set(entity);
    this._isFormOpen.set(true);
  }

  /**
   * Close form dialog
   */
  closeForm(): void {
    this._isFormOpen.set(false);
    this._selectedEntity.set(null);
  }

  /**
   * Open delete confirmation dialog
   */
  openDelete(entity: T): void {
    this._entityToDelete.set(entity);
    this._isDeleteDialogOpen.set(true);
  }

  /**
   * Close delete dialog
   */
  closeDelete(): void {
    this._isDeleteDialogOpen.set(false);
    this._entityToDelete.set(null);
  }

  /**
   * Handle form submission (create or update)
   */
  async handleFormSubmit(data: CreateT | UpdateT): Promise<void> {
    this._isLoading.set(true);

    try {
      const selected = this._selectedEntity();

      if (selected) {
        // Update
        await firstValueFrom(this.apiService.update(selected.id, data as UpdateT));
        this.notification.showSuccess(`${this.entityName} updated successfully`);
      } else {
        // Create
        await firstValueFrom(this.apiService.create(data as CreateT));
        this.notification.showSuccess(`${this.entityName} created successfully`);
      }

      this.closeForm();
      await this.loadPage();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to save ${this.entityName}`;
      this.notification.showError(message);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Handle delete confirmation
   */
  async handleConfirmDelete(): Promise<void> {
    const entity = this._entityToDelete();
    if (!entity) return;

    this._isLoading.set(true);

    try {
      await firstValueFrom(this.apiService.delete(entity.id));
      this.notification.showSuccess(`${this.entityName} deleted successfully`);
      this.closeDelete();
      await this.loadPage();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to delete ${this.entityName}`;
      this.notification.showError(message);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get label for an entity (override in subclass for custom labels)
   */
  getEntityLabel(entity: T): string {
    return `${this.entityName} #${entity.id}`;
  }
}
