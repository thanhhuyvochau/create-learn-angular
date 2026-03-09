# Phase 2 — Structural Mapping

This document maps every structural concern of the Next.js source to its Angular equivalent.  
It covers: Auth system, generic services, state pattern, component breakdown, forms, signals vs RxJS, and shared infrastructure.

---

## 1. Auth System

### 1.1 Overview

| React (Next.js)                                | Angular                                                    |
| ---------------------------------------------- | ---------------------------------------------------------- |
| `AuthContext` + `AuthProvider` (React Context) | `AuthService` (Injectable, `providedIn: 'root'`)           |
| `useState<AuthState>`                          | `signal<AuthState>`                                        |
| `useDisclosure` for loading gate               | computed `isLoading` signal                                |
| `sessionStorage` anti-flicker snapshot         | identical — `sessionStorage` snapshot in `APP_INITIALIZER` |
| `useRouter` for redirect                       | `inject(Router)`                                           |
| `ProtectedRoute` component wrapper             | `authGuard` (functional `CanActivateFn`)                   |
| Login page `redirectIfLoggedIn`                | `guestGuard` (functional `CanActivateFn`)                  |
| `baseApiClient.request()` 401 inline retry     | `authInterceptor` (functional `HttpInterceptorFn`)         |

### 1.2 `AuthService`

```typescript
// src/app/core/auth/auth.service.ts
import { Injectable, inject, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { AuthApiService } from "./auth-api.service";
import { decodeAccessTokenUser, isExpired } from "../utils/auth.utils";
import type { AuthState, LoginRequest } from "../models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);

  // ── State ──────────────────────────────────────────────────────────────────
  private readonly _state = signal<AuthState>({
    isLoggedIn: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // ── Public selectors ───────────────────────────────────────────────────────
  readonly isLoggedIn = computed(() => this._state().isLoggedIn);
  readonly user = computed(() => this._state().user);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // ── Snapshot helpers (anti-flicker) ───────────────────────────────────────
  private readonly SNAPSHOT_KEY = "auth:snapshot";

  private writeSnapshot(isLoggedIn: boolean, user: AuthState["user"]): void {
    try {
      sessionStorage.setItem(
        this.SNAPSHOT_KEY,
        JSON.stringify({ isLoggedIn, user }),
      );
    } catch {
      /* ignore */
    }
  }

  private readSnapshot(): Pick<AuthState, "isLoggedIn" | "user"> | null {
    try {
      const raw = sessionStorage.getItem(this.SNAPSHOT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ── Initialization (called from APP_INITIALIZER) ───────────────────────────
  async initialize(): Promise<void> {
    const snap = this.readSnapshot();
    if (snap) {
      this._state.update((s) => ({
        ...s,
        isLoggedIn: snap.isLoggedIn,
        user: snap.user,
      }));
    }
    await this.checkAuthStatus();
  }

  async checkAuthStatus(): Promise<void> {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      this._state.set({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        error: null,
      });
      this.writeSnapshot(false, null);
      return;
    }

    const decoded = decodeAccessTokenUser(token);
    if (decoded && !isExpired(decoded.exp)) {
      this._state.set({
        isLoggedIn: true,
        user: decoded,
        isLoading: false,
        error: null,
      });
      this.writeSnapshot(true, decoded);
      return;
    }

    // Expired — attempt refresh
    try {
      const refreshed = await this.authApi.refresh();
      localStorage.setItem("auth_token", refreshed.accessToken);
      const freshUser = decodeAccessTokenUser(refreshed.accessToken);
      this._state.set({
        isLoggedIn: !!freshUser,
        user: freshUser ?? null,
        isLoading: false,
        error: null,
      });
      this.writeSnapshot(!!freshUser, freshUser ?? null);
    } catch {
      this.clearTokens();
      this._state.set({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        error: null,
      });
      this.writeSnapshot(false, null);
    }
  }

  async login(credentials: LoginRequest): Promise<void> {
    this._state.update((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await this.authApi.login(credentials);
      localStorage.setItem("auth_token", res.accessToken);
      localStorage.setItem("refresh_token", res.refreshToken);
      const user =
        res.userLogin ?? decodeAccessTokenUser(res.accessToken) ?? null;
      this._state.set({
        isLoggedIn: !!user,
        user,
        isLoading: false,
        error: null,
      });
      this.writeSnapshot(!!user, user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      this._state.update((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authApi.logout();
    } catch {
      /* ignore */
    }
    this.clearTokens();
    this._state.set({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      error: null,
    });
    this.writeSnapshot(false, null);
    this.router.navigate(["/"]);
  }

  clearError(): void {
    this._state.update((s) => ({ ...s, error: null }));
  }

  private clearTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
  }
}
```

### 1.3 `APP_INITIALIZER` — Anti-flicker init

```typescript
// src/app/app.config.ts  (relevant excerpt)
import { APP_INITIALIZER } from '@angular/core';
import { AuthService } from './core/auth/auth.service';

export function initAuth(auth: AuthService) {
  return () => auth.initialize();
}

// inside provideApp():
{
  provide: APP_INITIALIZER,
  useFactory: initAuth,
  deps: [AuthService],
  multi: true,
}
```

### 1.4 `authGuard` and `guestGuard`

```typescript
// src/app/core/auth/auth.guard.ts
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(["/login"]);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? router.createUrlTree(["/management/subject"])
    : true;
};
```

### 1.5 `authInterceptor` — 401 retry with token refresh

The inline 401-retry logic in `baseApiClient.request()` moves entirely to the interceptor.  
All `HttpClient` calls pass through it automatically.

```typescript
// src/app/core/auth/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, switchMap, throwError } from "rxjs";
import { AuthApiService } from "./auth-api.service";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const token = localStorage.getItem("auth_token");
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        const authApi = inject(AuthApiService);
        return authApi.refresh$().pipe(
          switchMap((refreshed) => {
            localStorage.setItem("auth_token", refreshed.accessToken);
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${refreshed.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError(() => throwError(() => err)),
        );
      }
      return throwError(() => err);
    }),
  );
};
```

---

## 2. Generic `EntityCrudService<T>`

The React `useEntityCrud` hook held all CRUD orchestration logic.  
In Angular it becomes an abstract injectable service, provided **per-component** (not root), to give each management page its own isolated state.

### 2.1 Design contract

| `useEntityCrud` option                                         | `EntityCrudService<T>` equivalent                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| `entities: T[]`                                                | `entities$: BehaviorSubject<T[]>`                                   |
| `createMutation` / `updateMutation` / `deleteMutation`         | injected `BaseApiService<T>`                                        |
| `onEdit` / `onDelete` / `onAdd` / `onClose`                    | `selectedEntity signal`, `isFormOpen signal`, `isDeleteOpen signal` |
| `showSuccess` / `showError`                                    | injected `NotificationService`                                      |
| `entityName`, `getEntityId`, `getEntityLabel`, `createPayload` | abstract methods / properties                                       |

```typescript
// src/app/core/crud/entity-crud.service.ts
import { Injectable, inject, signal } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { NotificationService } from "../notifications/notification.service";
import type { BaseApiService } from "./base-api.service";

@Injectable() // NOT providedIn: 'root' — provided per-component
export abstract class EntityCrudService<T> {
  protected abstract readonly apiService: BaseApiService<T>;
  protected abstract readonly entityName: string;
  protected abstract getEntityId(entity: T): string | number;
  protected abstract getEntityLabel(entity: T): string;

  private readonly notification = inject(NotificationService);

  // ── State signals ──────────────────────────────────────────────────────────
  readonly entities$ = new BehaviorSubject<T[]>([]);
  readonly isLoading = signal(false);
  readonly selectedEntity = signal<T | null>(null);
  readonly isFormOpen = signal(false);
  readonly isDeleteOpen = signal(false);
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  // ── CRUD Actions ───────────────────────────────────────────────────────────
  openAdd(): void {
    this.selectedEntity.set(null);
    this.isFormOpen.set(true);
  }

  openEdit(entity: T): void {
    this.selectedEntity.set(entity);
    this.isFormOpen.set(true);
  }

  openDelete(entity: T): void {
    this.selectedEntity.set(entity);
    this.isDeleteOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
  }
  closeDelete(): void {
    this.isDeleteOpen.set(false);
  }

  async loadPage(
    page: number,
    size = 10,
    extra?: Record<string, unknown>,
  ): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await this.apiService.getAll({ page, size, ...extra });
      this.entities$.next(res?.data?.data ?? []);
      this.totalPages.set(res?.data?.totalPages ?? 0);
      this.totalElements.set(res?.data?.totalElements ?? 0);
      this.currentPage.set(page);
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleFormSubmit(data: Partial<T>): Promise<void> {
    const existing = this.selectedEntity();
    try {
      if (existing) {
        await this.apiService.update(
          String(this.getEntityId(existing)),
          data as never,
        );
        this.notification.showSuccess(
          `${this.entityName} updated successfully`,
        );
      } else {
        await this.apiService.create(data as never);
        this.notification.showSuccess(
          `${this.entityName} created successfully`,
        );
      }
      this.closeForm();
      await this.loadPage(this.currentPage());
    } catch {
      this.notification.showError(
        `Failed to save ${this.entityName}. Please try again.`,
      );
    }
  }

  async handleConfirmDelete(): Promise<void> {
    const entity = this.selectedEntity();
    if (!entity) return;
    try {
      await this.apiService.delete(String(this.getEntityId(entity)));
      this.notification.showSuccess(
        `${this.entityName} "${this.getEntityLabel(entity)}" deleted successfully`,
      );
      this.closeDelete();
      await this.loadPage(this.currentPage());
    } catch {
      this.notification.showError(
        `Failed to delete ${this.entityName}. Please try again.`,
      );
    }
  }
}
```

### 2.2 Concrete example — `SubjectCrudService`

```typescript
// src/app/features/management/subject/subject-crud.service.ts
import { Injectable, inject } from "@angular/core";
import { EntityCrudService } from "../../../core/crud/entity-crud.service";
import { SubjectApiService } from "../../../core/api/subject-api.service";
import type { Subject } from "../../../models";

@Injectable()
export class SubjectCrudService extends EntityCrudService<Subject> {
  protected readonly apiService = inject(SubjectApiService);
  protected readonly entityName = "Subject";
  protected getEntityId(s: Subject) {
    return s.id;
  }
  protected getEntityLabel(s: Subject) {
    return s.name;
  }
}
```

Provided in the component itself:

```typescript
@Component({
  providers: [SubjectCrudService],
})
export class SubjectManagementComponent { ... }
```

---

## 3. State Service Pattern — `ClassStateService` as Template

The `useClassQuery` hook (React Query) maps to a dedicated state service per feature.

```typescript
// src/app/features/management/class/class-state.service.ts
import { Injectable, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject } from "rxjs";
import { ClassApiService } from "../../../core/api/class-api.service";
import type { Class, ApiFilters } from "../../../models";

@Injectable() // provided per-component
export class ClassStateService {
  private readonly api = inject(ClassApiService);

  private readonly _classes$ = new BehaviorSubject<Class[]>([]);
  readonly classes = toSignal(this._classes$, { initialValue: [] });
  readonly isLoading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);

  async load(filters: ApiFilters = {}): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await this.api.getAllForAdmin(filters);
      this._classes$.next(res?.data?.data ?? []);
      this.totalPages.set(res?.data?.totalPages ?? 0);
      this.totalElements.set(res?.data?.totalElements ?? 0);
      this.currentPage.set(filters.page ?? 0);
    } finally {
      this.isLoading.set(false);
    }
  }

  async create(data: unknown): Promise<void> {
    await this.api.create(data as never);
  }
  async update(id: string, data: unknown): Promise<void> {
    await this.api.update(id, data as never);
  }
  async delete(id: string): Promise<void> {
    await this.api.delete(id);
  }
}
```

**Key pattern:** React Query `invalidateQueries` → `await this.load(currentPage)` after every mutation.

---

## 4. `BaseApiService<T>`

Replaces `BaseApiClient<T>`. No inline 401 retry (moved to interceptor). `serializeData()` logic is preserved.

```typescript
// src/app/core/api/base-api.service.ts
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { API_BASE_URL } from "../tokens";
import type {
  ApiListResponse,
  ApiSingleResponse,
  BaseEntity,
  ApiFilters,
} from "../../models";

export abstract class BaseApiService<
  T extends BaseEntity,
  CreateT = Omit<T, "id" | "createdAt" | "updatedAt">,
  UpdateT = Partial<CreateT>,
> {
  protected abstract readonly endpoint: string;
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(API_BASE_URL);

  protected get url(): string {
    return `${this.baseUrl}${this.endpoint}`;
  }

  async getAll(filters?: ApiFilters): Promise<ApiListResponse<T> | undefined> {
    const params = this.buildParams(filters);
    return firstValueFrom(
      this.http.get<ApiListResponse<T>>(this.url, { params }),
    );
  }

  async getById(id: string): Promise<ApiSingleResponse<T> | undefined> {
    return firstValueFrom(
      this.http.get<ApiSingleResponse<T>>(`${this.url}/${id}`),
    );
  }

  async create(data: CreateT): Promise<ApiSingleResponse<T> | undefined> {
    const body = this.serializeData(data);
    return firstValueFrom(this.http.post<ApiSingleResponse<T>>(this.url, body));
  }

  async update(
    id: string,
    data: UpdateT,
  ): Promise<ApiSingleResponse<T> | undefined> {
    const body = this.serializeData(data);
    return firstValueFrom(
      this.http.put<ApiSingleResponse<T>>(`${this.url}/${id}`, body),
    );
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  protected serializeData(data: unknown): FormData | unknown {
    if (data instanceof FormData) return data;
    if (!data || typeof data !== "object") return data;
    const hasBinary = Object.values(data as object).some(
      (v) =>
        v instanceof File ||
        v instanceof Blob ||
        (Array.isArray(v) &&
          v.some((i) => i instanceof File || i instanceof Blob)),
    );
    if (!hasBinary) return data;

    const form = new FormData();
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      this.appendToFormData(form, key, value);
    }
    return form;
  }

  private appendToFormData(form: FormData, key: string, value: unknown): void {
    if (value == null) return;
    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => this.appendToFormData(form, key, item));
      return;
    }
    if (typeof value === "object") {
      form.append(key, JSON.stringify(value));
      return;
    }
    form.append(key, String(value));
  }

  private buildParams(filters?: ApiFilters): Record<string, string> {
    if (!filters) return {};
    return Object.fromEntries(
      Object.entries(filters)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    );
  }
}
```

---

## 5. `NotificationService`

Replaces `NotificationProvider` + `useNotification` hook. Thin wrapper over `MatSnackBar`.

```typescript
// src/app/core/notifications/notification.service.ts
import { Injectable, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({ providedIn: "root" })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private show(message: string, panelClass: string, duration = 4000): void {
    this.snackBar.open(message, "Close", {
      duration,
      panelClass: [panelClass],
    });
  }

  showSuccess(message: string): void {
    this.show(message, "snack-success");
  }
  showError(message: string): void {
    this.show(message, "snack-error", 6000);
  }
  showWarning(message: string): void {
    this.show(message, "snack-warning");
  }
  showInfo(message: string): void {
    this.show(message, "snack-info");
  }
}
```

---

## 6. Component Breakdown Table

All 30+ components mapped React → Angular. Mantine equivalents replaced by Angular Material.

| React Component                | Angular Component / Directive             | Angular Material equivalent                                      |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| `ProtectedRoute`               | `authGuard` (eliminated as component)     | —                                                                |
| `management/layout.tsx`        | `ManagementShellComponent`                | `MatSidenav` layout                                              |
| `SideBar.tsx`                  | `SidebarComponent`                        | `MatNavList` + `routerLinkActive`                                |
| `Header.tsx`                   | `HeaderComponent`                         | `MatToolbar` + `MatMenu`                                         |
| `EntityTable<T>`               | `EntityTableComponent<T>`                 | `MatTable` + `MatSort`                                           |
| `FormModal`                    | `MatDialog` (no wrapper component needed) | `MatDialog`                                                      |
| `DeleteConfirmModal`           | `ConfirmDialogComponent`                  | `MatDialog`                                                      |
| `PaginationBar`                | —                                         | `MatPaginator`                                                   |
| `AddNewButton`                 | `AddButtonComponent`                      | `MatButton`                                                      |
| `RichTextEditor`               | `RichTextEditorComponent`                 | `ngx-editor`                                                     |
| `AutoNotification`             | eliminated                                | `MatSnackBar`                                                    |
| `NotificationProvider`         | `NotificationService`                     | `MatSnackBar`                                                    |
| `PopularSubjectCard`           | `SubjectCardComponent`                    | `MatCard`                                                        |
| `SubjectHoverCard` (in Header) | inline in `HeaderComponent`               | `MatMenu` (hover via `cdkOverlay` or `matMenuTriggerOn="hover"`) |
| `ClassCard`                    | `ClassCardComponent`                      | `MatCard`                                                        |
| `MobileDrawer` (in Header)     | `MatDrawer` inside `HeaderComponent`      | `MatSidenav`                                                     |
| `AccountForm`                  | `AccountFormComponent`                    | Reactive Forms + `MatFormField`                                  |
| `ClassForm`                    | `ClassFormComponent`                      | Reactive Forms + `MatFormField`                                  |
| `RegistrationForm`             | `RegistrationFormComponent`               | Reactive Forms                                                   |
| `ScheduleForm`                 | `ScheduleFormComponent`                   | Reactive Forms                                                   |
| `SubjectForm`                  | `SubjectFormComponent`                    | Reactive Forms + file input                                      |
| `TeacherForm`                  | `TeacherFormComponent`                    | Reactive Forms                                                   |
| `NewsForm`                     | `NewsFormComponent`                       | Reactive Forms + `ngx-editor`                                    |
| `ConsultationForm`             | `ConsultationFormComponent`               | Reactive Forms                                                   |
| `GradeForm`                    | `GradeFormComponent`                      | Reactive Forms                                                   |
| `LandingPage` sections (8)     | 8 `@defer` standalone components          | `MatCard`, `MatButton`                                           |
| `ClassList`                    | `ClassListComponent`                      | `MatCard` grid                                                   |
| `ClassDetail`                  | `ClassDetailComponent`                    | `MatCard` + `SafeHtmlPipe`                                       |
| `LoginPage`                    | `LoginComponent`                          | Reactive Forms + `MatFormField`                                  |
| `HtmlSanitizer`                | `SafeHtmlPipe`                            | `DomSanitizer`                                                   |

---

## 7. `ManagementShellComponent`

Replaces `management/layout.tsx` + `ProtectedRoute`.

```typescript
// src/app/features/management/shell/management-shell.component.ts
import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: "app-management-shell",
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
  ],
  template: `
    <mat-sidenav-container class="management-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        fixedInViewport
      >
        <app-sidebar (navClick)="isMobile() && sidenav.close()" />
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Management</span>
        </mat-toolbar>
        <div class="content-wrapper">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class ManagementShellComponent {
  readonly isMobile = signal(false);

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }
}
```

---

## 8. `SidebarComponent`

Replaces `SideBar.tsx`. Uses `MatNavList` and `routerLinkActive`. Note the corrected `/management/subject` route.

```typescript
// src/app/features/management/sidebar/sidebar.component.ts
import { Component, output } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";

interface NavItem {
  id: string;
  label: string;
  icon: string; // Material icon name
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "subject",
    label: "Subject",
    icon: "calculate",
    route: "/management/subject",
  },
  { id: "grade", label: "Grades", icon: "group", route: "/management/grade" },
  {
    id: "teacher",
    label: "Teachers",
    icon: "school",
    route: "/management/teacher",
  },
  { id: "class", label: "Classes", icon: "class", route: "/management/class" },
  {
    id: "schedule",
    label: "Schedule",
    icon: "event",
    route: "/management/schedule",
  },
  {
    id: "consultation",
    label: "Consultation",
    icon: "event_available",
    route: "/management/consultation",
  },
  { id: "news", label: "News", icon: "newspaper", route: "/management/news" },
  {
    id: "account",
    label: "Account",
    icon: "person_add",
    route: "/management/account",
  },
  {
    id: "registration",
    label: "Registration",
    icon: "how_to_reg",
    route: "/management/registration",
  },
];

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <mat-nav-list>
      @for (item of navItems; track item.id) {
        <a
          mat-list-item
          [routerLink]="item.route"
          routerLinkActive="active-link"
          (click)="navClick.emit()"
        >
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      }
    </mat-nav-list>
  `,
})
export class SidebarComponent {
  readonly navClick = output<void>();
  readonly navItems = NAV_ITEMS;
}
```

---

## 9. `HeaderComponent`

Replaces `Header.tsx`. Key changes: `useDisclosure` → `signal<boolean>`, `HoverCard` → `MatMenu`, `useSubjectQuery` → `SubjectStateService`.

```typescript
// src/app/features/public/header/header.component.ts (outline)
@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSidenavModule,
    AsyncPipe,
  ],
  template: `
    <mat-toolbar>
      <a routerLink="/"><img src="/images/algocore-logo.jpg" alt="Logo" /></a>

      <!-- Desktop nav -->
      <nav class="desktop-nav">
        @for (link of navLinks; track link.href) {
          <a mat-button [routerLink]="link.href">{{ link.name }}</a>
        }
        <!-- Subjects hover menu -->
        <button mat-button [matMenuTriggerFor]="subjectMenu">Subjects</button>
        <mat-menu #subjectMenu="matMenu">
          @for (s of subjects(); track s.id) {
            <a mat-menu-item [routerLink]="['/class/subject', s.id]">{{
              s.name
            }}</a>
          }
        </mat-menu>
      </nav>

      <!-- User section -->
      @if (auth.isLoggedIn()) {
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/management">Management</button>
          <button mat-menu-item routerLink="/current-profile">Profile</button>
          <mat-divider />
          <button mat-menu-item (click)="auth.logout()">Logout</button>
        </mat-menu>
      } @else {
        <a mat-flat-button routerLink="/login">Login</a>
      }

      <!-- Mobile burger -->
      <button
        class="mobile-only"
        mat-icon-button
        (click)="mobileOpen.set(!mobileOpen())"
      >
        <mat-icon>menu</mat-icon>
      </button>
    </mat-toolbar>

    <!-- Mobile sidenav/drawer handled by AppComponent MatSidenav -->
  `,
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly mobileOpen = signal(false);
  private readonly subjectState = inject(SubjectStateService);
  protected readonly subjects = this.subjectState.subjects;

  protected readonly navLinks = [
    { name: "About", href: "/about" },
    { name: "Classes", href: "/class" },
    { name: "Teachers", href: "/teachers" },
    { name: "News", href: "/news" },
  ];

  constructor() {
    this.subjectState.load();
  }
}
```

---

## 10. `EntityTableComponent<T>`

Replaces `EntityTable<T>`. Uses `MatTable` with `MatSort`. Angular's generic component pattern uses `ng-template` inputs for cell rendering instead of render functions.

```typescript
// src/app/shared/entity-table/entity-table.component.ts
import {
  Component,
  input,
  output,
  ContentChildren,
  QueryList,
  TemplateRef,
  Directive,
} from "@angular/core";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  cellTemplate?: TemplateRef<{ $implicit: T; row: T }>;
}

@Directive({ selector: "[appColumnDef]", standalone: true })
export class ColumnDefDirective<T> {
  readonly key = input.required<string>();
  constructor(public templateRef: TemplateRef<{ $implicit: T; row: T }>) {}
}

@Component({
  selector: "app-entity-table",
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatButtonModule, MatIconModule],
  template: `
    <table mat-table [dataSource]="data()" matSort>
      @for (col of columns(); track col.key) {
        <ng-container [matColumnDef]="col.key">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            {{ col.header }}
          </th>
          <td mat-cell *matCellDef="let row">
            @if (col.cellTemplate) {
              <ng-container
                *ngTemplateOutlet="
                  col.cellTemplate;
                  context: { $implicit: row, row }
                "
              />
            } @else {
              {{ row[col.key] ?? "—" }}
            }
          </td>
        </ng-container>
      }

      <!-- Actions column -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let row">
          <button mat-icon-button color="primary" (click)="edit.emit(row)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="delete.emit(row)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
    </table>
  `,
})
export class EntityTableComponent<T> {
  readonly data = input.required<T[]>();
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly edit = output<T>();
  readonly delete = output<T>();

  protected displayedColumns = () => [
    ...this.columns().map((c) => c.key),
    "actions",
  ];
}
```

---

## 11. `ConfirmDialogComponent`

Replaces `DeleteConfirmModal`. Used via `MatDialog.open()`.

```typescript
// src/app/shared/confirm-dialog/confirm-dialog.component.ts
import { Component, inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
}

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        {{ data.confirmLabel ?? "Delete" }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
```

Usage pattern in any management component:

```typescript
const ref = this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: "Confirm Delete",
    message: `Are you sure you want to delete "${label}"? This cannot be undone.`,
  },
});
ref.afterClosed().subscribe((confirmed) => {
  if (confirmed) this.crud.handleConfirmDelete();
});
```

---

## 12. Forms Pattern

### 12.1 Mantine Form → Angular Reactive Forms

| Mantine `useForm` feature                     | Angular Reactive Forms equivalent                               |
| --------------------------------------------- | --------------------------------------------------------------- |
| `initialValues`                               | `fb.group({ ... })` with initial values in constructor          |
| `validate` object                             | `Validators.required`, `Validators.email`, custom `ValidatorFn` |
| `form.getInputProps('field')`                 | `[formControlName]="'field'"` binding                           |
| `form.setFieldValue`                          | `form.get('field')?.setValue(value)`                            |
| `form.insertListItem` / `form.removeListItem` | `FormArray` + `push()` / `removeAt()`                           |
| `form.onSubmit(handler)`                      | `(ngSubmit)="onSubmit()"` + `form.valid` guard                  |
| `isSubmitting` state                          | `isSubmitting = signal(false)`                                  |

### 12.2 `AccountFormComponent`

```typescript
// src/app/features/management/account/account-form.component.ts
import {
  Component,
  inject,
  input,
  output,
  OnInit,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import type { Account } from "../../../models";

@Component({
  selector: "app-account-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input
          matInput
          type="email"
          formControlName="email"
          autocomplete="off"
        />
        @if (form.get("email")?.errors?.["required"]) {
          <mat-error>Email is required</mat-error>
        }
        @if (form.get("email")?.errors?.["email"]) {
          <mat-error>Invalid email format</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Username</mat-label>
        <input matInput formControlName="username" autocomplete="off" />
        @if (form.get("username")?.errors?.["required"]) {
          <mat-error>Username is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input
          matInput
          type="password"
          formControlName="password"
          [placeholder]="
            initialValues() ? 'Leave empty to keep current' : 'Enter password'
          "
          autocomplete="new-password"
        />
        @if (form.get("password")?.errors?.["required"]) {
          <mat-error>Password is required</mat-error>
        }
        @if (form.get("password")?.errors?.["minlength"]) {
          <mat-error>Minimum 6 characters</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Phone</mat-label>
        <input matInput type="tel" formControlName="phone" autocomplete="off" />
        @if (form.get("phone")?.errors?.["required"]) {
          <mat-error>Phone is required</mat-error>
        }
      </mat-form-field>

      <mat-slide-toggle formControlName="activated"
        >Activate this account</mat-slide-toggle
      >

      <div class="form-actions">
        <button
          mat-button
          type="button"
          (click)="cancel.emit()"
          [disabled]="isSubmitting()"
        >
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="isSubmitting()"
        >
          {{ initialValues() ? "Update" : "Create" }} Account
        </button>
      </div>
    </form>
  `,
})
export class AccountFormComponent implements OnInit {
  readonly initialValues = input<Account | null>(null);
  readonly submitted = output<Partial<Account>>();
  readonly cancel = output<void>();

  private readonly fb = inject(FormBuilder);
  protected readonly isSubmitting = signal(false);

  protected form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    username: ["", Validators.required],
    password: [""],
    phone: ["", Validators.required],
    activated: [false],
  });

  ngOnInit(): void {
    const v = this.initialValues();
    if (v) {
      this.form.patchValue({
        email: v.email ?? "",
        username: v.username ?? "",
        phone: v.phone ?? "",
        activated: v.activated ?? false,
      });
      // Password optional on edit — remove required validator
      this.form.get("password")?.clearValidators();
    } else {
      this.form
        .get("password")
        ?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.form.get("password")?.updateValueAndValidity();
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    try {
      const val = this.form.getRawValue();
      const data: Partial<Account> = {
        email: val.email ?? "",
        username: val.username ?? "",
        phone: val.phone ?? "",
        activated: val.activated ?? false,
      };
      if (val.password) data.password = val.password;
      this.submitted.emit(data);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

### 12.3 `ClassFormComponent` — Schedule `FormArray`

The `form.insertListItem` / `form.removeListItem` pattern becomes a `FormArray`. The inline schedule CRUD (create/update/delete via `scheduleApiClient`) stays in the form submit handler.

```typescript
// schedules FormArray setup
private buildScheduleGroup(entry?: { id?: number; time?: string }): FormGroup {
  return this.fb.group({
    id:    [entry?.id ?? null],
    time:  [entry?.time ?? '', Validators.required],
    isNew: [!entry?.id],
  });
}

get schedulesArray(): FormArray {
  return this.form.get('schedules') as FormArray;
}

addSchedule(): void {
  this.schedulesArray.push(this.buildScheduleGroup());
}

removeSchedule(index: number): void {
  if (this.schedulesArray.length <= 1) return;
  const ctrl = this.schedulesArray.at(index);
  const id = ctrl.get('id')?.value as number | null;
  if (id) this.deletedScheduleIds.push(id);
  this.schedulesArray.removeAt(index);
}
```

The schedule save logic (delete removed IDs, create/update survivors) runs in the component's submit method after the main class create/update call — identical to the React version.

---

## 13. `RichTextEditorComponent`

Replaces `RichTextEditor.tsx` (Tiptap). Uses `ngx-editor`.

```typescript
// src/app/shared/rich-text-editor/rich-text-editor.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgxEditorModule, Editor, Toolbar } from "ngx-editor";

@Component({
  selector: "app-rich-text-editor",
  standalone: true,
  imports: [NgxEditorModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="editor-wrapper">
      <ngx-editor-menu [editor]="editor" [toolbar]="toolbar" />
      <ngx-editor
        [editor]="editor"
        [placeholder]="placeholder()"
        (valueChange)="onEditorChange($event)"
      />
    </div>
  `,
})
export class RichTextEditorComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  readonly placeholder = input("Write here…");

  protected editor!: Editor;
  protected readonly toolbar: Toolbar = [
    ["bold", "italic", "underline", "strike"],
    ["ordered_list", "bullet_list"],
    [{ heading: ["h1", "h2", "h3"] }],
    ["link", "image"],
    ["undo", "redo"],
  ];

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.editor = new Editor();
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  writeValue(val: string): void {
    this.editor.setContent(val ?? "");
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected onEditorChange(value: string): void {
    this.onChange(value);
    this.onTouched();
  }
}
```

Usage in `ClassFormComponent`:

```html
<app-rich-text-editor
  formControlName="description"
  placeholder="Write description…"
/>
```

---

## 14. `SafeHtmlPipe`

Replaces `HtmlSanitizer` / Mantine `SafeHtml`. Used in `ClassDetailComponent` to render rich-text HTML.

```typescript
// src/app/shared/pipes/safe-html.pipe.ts
import { Pipe, PipeTransform, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({ name: "safeHtml", standalone: true, pure: true })
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
```

Usage:

```html
<div [innerHTML]="classDetail.description | safeHtml"></div>
```

---

## 15. Signals vs RxJS Decision Table

| Scenario                                                  | Use                                         | Rationale                                         |
| --------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| Local UI boolean (modal open, sidebar collapsed, loading) | `signal<boolean>`                           | Simple toggle, no async                           |
| Derived state (computed from other signals)               | `computed(() => ...)`                       | Reactive, lazy, no subscriptions                  |
| HTTP-based data list (`entities$`)                        | `BehaviorSubject<T[]>` + `toSignal()`       | Needs multicasting, async plumbing                |
| Auth state (isLoggedIn, user)                             | `signal<AuthState>`                         | Owned entirely by service, no external stream     |
| HTTP request itself                                       | `HttpClient` (`firstValueFrom`)             | One-shot, no multicasting needed                  |
| Paginated reload on filter change                         | `BehaviorSubject<ApiFilters>` + `switchMap` | Cancellable, debounce-friendly                    |
| 401 retry                                                 | RxJS `catchError` + `switchMap`             | Interceptor pipeline requires Observables         |
| `useDisclosure` equivalents                               | `signal<boolean>`                           | No Angular equivalent needed; signals are simpler |

---

## 16. `ClassApiService` — Dual-Endpoint Override

The public-vs-admin distinction from the React source is preserved:

```typescript
// src/app/core/api/class-api.service.ts
@Injectable({ providedIn: "root" })
export class ClassApiService extends BaseApiService<
  Class,
  CreateClassRequest,
  UpdateClassRequest
> {
  protected readonly endpoint = "/api/classes";

  // Public listing (no auth required)
  async getAllPublic(
    filters?: ClassApiFilters,
  ): Promise<ApiListResponse<Class> | undefined> {
    const params = this.buildParams(filters);
    return firstValueFrom(
      this.http.get<ApiListResponse<Class>>(
        `${this.baseUrl}/api/classes/public`,
        { params },
      ),
    );
  }

  async getByIdPublic(
    id: string,
  ): Promise<ApiSingleResponse<Class> | undefined> {
    return firstValueFrom(
      this.http.get<ApiSingleResponse<Class>>(
        `${this.baseUrl}/api/classes/public/${id}`,
      ),
    );
  }

  // Admin listing (auth required — handled by interceptor)
  async getAllForAdmin(
    filters?: ClassApiFilters,
  ): Promise<ApiListResponse<Class> | undefined> {
    const params = this.buildParams(filters);
    return firstValueFrom(
      this.http.get<ApiListResponse<Class>>(
        `${this.baseUrl}/api/classes/admin`,
        { params },
      ),
    );
  }
}
```

---

## 17. `SubjectApiService` — FormData Upload

`serializeData()` in `BaseApiService` automatically converts the request to `FormData` when it detects a `File` or `Blob` field. No override needed — `SubjectApiService` only sets the endpoint:

```typescript
@Injectable({ providedIn: "root" })
export class SubjectApiService extends BaseApiService<
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest
> {
  protected readonly endpoint = "/api/subjects";
}
```

When `CreateSubjectRequest.icon` is a `File`, `serializeData()` wraps it in `FormData` transparently.

---

## 18. Summary: What Disappears vs What Is Added

### Eliminated (no Angular equivalent needed)

| Removed                                     | Reason                                            |
| ------------------------------------------- | ------------------------------------------------- |
| `QueryProvider` / `React Query`             | Replaced by RxJS + `BehaviorSubject`              |
| `ProtectedRoute` component                  | Replaced by `authGuard`                           |
| `NotificationProvider` + `AutoNotification` | Replaced by `MatSnackBar` + `NotificationService` |
| `useDisclosure`                             | Replaced by `signal<boolean>`                     |
| `FormModal` wrapper                         | `MatDialog.open()` inline — no wrapper needed     |
| `useNotification` hook                      | Replaced by `inject(NotificationService)`         |
| Mantine (all)                               | Replaced by Angular Material                      |
| Tabler Icons                                | Replaced by Material Icons (ligature font)        |

### New (Angular-only infrastructure)

| Added                             | Purpose                                            |
| --------------------------------- | -------------------------------------------------- |
| `authInterceptor`                 | Adds JWT header + 401 refresh retry                |
| `APP_INITIALIZER`                 | Runs `AuthService.initialize()` before app renders |
| `authGuard` / `guestGuard`        | Functional route guards                            |
| `API_BASE_URL` InjectionToken     | Environment-aware base URL                         |
| `EntityCrudService<T>` (abstract) | Replaces `useEntityCrud` hook                      |
| `SafeHtmlPipe`                    | Secure HTML rendering                              |
| `ConfirmDialogComponent`          | Reusable delete confirm dialog                     |
| `EntityTableComponent<T>`         | Generic table with sort                            |
