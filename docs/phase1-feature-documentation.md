# Phase 1: Feature & Logic Documentation

**Source:** `create-learn-ui` (Next.js 15, App Router)  
**Target:** `create-learn-angular` (Angular 18+, Standalone, Signals, CSR)  
**Generated from:** Full codebase analysis of `src/` tree

---

## 1. Route Mapping

### 1.1 Complete Next.js → Angular Route Table

Every file-based route in `src/app/` is mapped to an Angular `Routes` entry below.
The management default (`/management`) is **corrected** to redirect to `/management/subject`.

| Next.js File                           | URL Pattern                | Angular Component                 | Guard        | Resolver              |
| -------------------------------------- | -------------------------- | --------------------------------- | ------------ | --------------------- |
| `app/page.tsx`                         | `/`                        | — (redirect)                      | —            | —                     |
| `app/landing/page.tsx`                 | `/landing`                 | `LandingComponent`                | —            | —                     |
| `app/login/page.tsx`                   | `/login`                   | `LoginComponent`                  | `guestGuard` | —                     |
| `app/class/page.tsx`                   | `/class`                   | `ClassListComponent`              | —            | —                     |
| `app/class/[id]/page.tsx`              | `/class/:id`               | `ClassDetailComponent`            | —            | `classDetailResolver` |
| `app/class/subject/[id]/page.tsx`      | `/class/subject/:id`       | `ClassBySubjectComponent`         | —            | —                     |
| `app/news/page.tsx`                    | `/news`                    | `NewsListComponent`               | —            | —                     |
| `app/news/[id]/page.tsx`               | `/news/:id`                | `NewsDetailComponent`             | —            | —                     |
| `app/current-profile/page.tsx`         | `/current-profile`         | `ProfileComponent`                | `authGuard`  | —                     |
| `app/not-authorized/page.tsx`          | `/not-authorized`          | `NotAuthorizedComponent`          | —            | —                     |
| `app/not-found.tsx`                    | `**`                       | `NotFoundComponent`               | —            | —                     |
| `app/management/layout.tsx`            | `/management` (shell)      | `ManagementShellComponent`        | `authGuard`  | —                     |
| `app/management/page.tsx`              | `/management/subject`      | `SubjectManagementComponent`      | (inherited)  | —                     |
| `app/management/class/page.tsx`        | `/management/class`        | `ClassManagementComponent`        | (inherited)  | —                     |
| `app/management/account/page.tsx`      | `/management/account`      | `AccountManagementComponent`      | (inherited)  | —                     |
| `app/management/teacher/page.tsx`      | `/management/teacher`      | `TeacherManagementComponent`      | (inherited)  | —                     |
| `app/management/news/page.tsx`         | `/management/news`         | `NewsManagementComponent`         | (inherited)  | —                     |
| `app/management/grade/page.tsx`        | `/management/grade`        | `GradeManagementComponent`        | (inherited)  | —                     |
| `app/management/schedule/page.tsx`     | `/management/schedule`     | `ScheduleManagementComponent`     | (inherited)  | —                     |
| `app/management/registration/page.tsx` | `/management/registration` | `RegistrationManagementComponent` | (inherited)  | —                     |
| `app/management/consultation/page.tsx` | `/management/consultation` | `ConsultationManagementComponent` | (inherited)  | —                     |

### 1.2 Angular `app.routes.ts` — Full Definition

```typescript
// src/app/app.routes.ts
import { Routes } from "@angular/router";
import { authGuard } from "./core/auth/auth.guard";
import { guestGuard } from "./core/auth/guest.guard";
import { classDetailResolver } from "./features/public/resolvers/class-detail.resolver";

export const routes: Routes = [
  // Root redirect
  {
    path: "",
    redirectTo: "landing",
    pathMatch: "full",
  },

  // ── Public routes ────────────────────────────────────────────────────────
  {
    path: "landing",
    loadComponent: () =>
      import("./features/public/landing/landing.component").then(
        (m) => m.LandingComponent,
      ),
  },
  {
    path: "class",
    loadComponent: () =>
      import("./features/public/class-list/class-list.component").then(
        (m) => m.ClassListComponent,
      ),
  },
  {
    path: "class/subject/:id",
    loadComponent: () =>
      import(
        "./features/public/class-by-subject/class-by-subject.component"
      ).then((m) => m.ClassBySubjectComponent),
  },
  {
    path: "class/:id",
    loadComponent: () =>
      import("./features/public/class-detail/class-detail.component").then(
        (m) => m.ClassDetailComponent,
      ),
    resolve: { classData: classDetailResolver },
  },
  {
    path: "news",
    loadComponent: () =>
      import("./features/public/news-list/news-list.component").then(
        (m) => m.NewsListComponent,
      ),
  },
  {
    path: "news/:id",
    loadComponent: () =>
      import("./features/public/news-detail/news-detail.component").then(
        (m) => m.NewsDetailComponent,
      ),
  },
  {
    path: "not-authorized",
    loadComponent: () =>
      import("./features/public/not-authorized/not-authorized.component").then(
        (m) => m.NotAuthorizedComponent,
      ),
  },

  // ── Auth routes ──────────────────────────────────────────────────────────
  {
    path: "login",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "current-profile",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/public/profile/profile.component").then(
        (m) => m.ProfileComponent,
      ),
  },

  // ── Management (protected layout with child routes) ──────────────────────
  {
    path: "management",
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        "./features/management/management-shell/management-shell.component"
      ).then((m) => m.ManagementShellComponent),
    children: [
      // Default redirect: /management → /management/subject
      {
        path: "",
        redirectTo: "subject",
        pathMatch: "full",
      },
      {
        path: "subject",
        loadComponent: () =>
          import(
            "./features/management/subject/subject-management.component"
          ).then((m) => m.SubjectManagementComponent),
      },
      {
        path: "class",
        loadComponent: () =>
          import("./features/management/class/class-management.component").then(
            (m) => m.ClassManagementComponent,
          ),
      },
      {
        path: "account",
        loadComponent: () =>
          import(
            "./features/management/account/account-management.component"
          ).then((m) => m.AccountManagementComponent),
      },
      {
        path: "teacher",
        loadComponent: () =>
          import(
            "./features/management/teacher/teacher-management.component"
          ).then((m) => m.TeacherManagementComponent),
      },
      {
        path: "news",
        loadComponent: () =>
          import("./features/management/news/news-management.component").then(
            (m) => m.NewsManagementComponent,
          ),
      },
      {
        path: "grade",
        loadComponent: () =>
          import("./features/management/grade/grade-management.component").then(
            (m) => m.GradeManagementComponent,
          ),
      },
      {
        path: "schedule",
        loadComponent: () =>
          import(
            "./features/management/schedule/schedule-management.component"
          ).then((m) => m.ScheduleManagementComponent),
      },
      {
        path: "registration",
        loadComponent: () =>
          import(
            "./features/management/registration/registration-management.component"
          ).then((m) => m.RegistrationManagementComponent),
      },
      {
        path: "consultation",
        loadComponent: () =>
          import(
            "./features/management/consultation/consultation-management.component"
          ).then((m) => m.ConsultationManagementComponent),
      },
    ],
  },

  // ── Wildcard (404) ───────────────────────────────────────────────────────
  {
    path: "**",
    loadComponent: () =>
      import("./features/public/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
  },
];
```

### 1.3 Route Resolver Example

The class detail page uses `useQuery` in React — Angular uses a `ResolveFn` to pre-fetch before activation:

```typescript
// src/app/features/public/resolvers/class-detail.resolver.ts
import { inject } from "@angular/core";
import { ResolveFn, Router } from "@angular/router";
import { catchError, EMPTY } from "rxjs";
import { ClassApiService } from "../../../core/api/class-api.service";
import type { Class } from "../../../models/class.models";

export const classDetailResolver: ResolveFn<Class> = (route) => {
  const classApi = inject(ClassApiService);
  const router = inject(Router);
  const id = route.paramMap.get("id")!;

  return classApi.getById(id).pipe(
    // Unwrap the ApiSingleResponse<Class> wrapper
    map((res) => res.data),
    catchError(() => {
      router.navigate(["/not-found"]);
      return EMPTY;
    }),
  );
};
```

```typescript
// Consuming the resolved data in the component
// src/app/features/public/class-detail/class-detail.component.ts
@Component({ standalone: true, ... })
export class ClassDetailComponent {
  // withComponentInputBinding() in provideRouter() maps resolve → @Input()
  @Input() classData!: Class;

  readonly registrationModalOpen = signal(false);
  // ...
}
```

---

## 2. Data Flow Analysis

### 2.1 React State Constructs → Angular Services

The Next.js app has three layers of state:

1. **`AuthContext`** — global auth state
2. **`useXxxQuery` hooks** — per-entity server state (React Query)
3. **`useState` / local signals** — component-level UI state

All three map to distinct Angular patterns.

#### Layer 1: Global Auth State

| React                               | Angular                                                    | File                        |
| ----------------------------------- | ---------------------------------------------------------- | --------------------------- |
| `AuthContext` (createContext)       | `AuthService` (`providedIn: 'root'`)                       | `core/auth/auth.service.ts` |
| `AuthProvider` component            | Bootstrap-time initialization in `AuthService` constructor | —                           |
| `useAuth()` hook                    | `inject(AuthService)` in any component                     | —                           |
| `authState.isLoggedIn`              | `authService.isLoggedIn()` — `Signal<boolean>`             | —                           |
| `authState.user`                    | `authService.user()` — `Signal<UserLogin \| null>`         | —                           |
| `authState.isLoading`               | `authService.isLoading()` — `Signal<boolean>`              | —                           |
| `authState.error`                   | `authService.error()` — `Signal<string \| null>`           | —                           |
| `login(credentials)`                | `authService.login(credentials): Observable<void>`         | —                           |
| `logout()`                          | `authService.logout(): Observable<void>`                   | —                           |
| `checkAuthStatus()`                 | Called in constructor; also exposed as `checkAuthStatus()` | —                           |
| `redirectIfLoggedIn()`              | Replaced by `guestGuard` — no method needed                | —                           |
| `clearError()`                      | `authService.clearError()`                                 | —                           |
| Session snapshot (`sessionStorage`) | Ported 1:1 — `isPlatformBrowser` guard since CSR           | —                           |

#### Layer 2: Server State (React Query → RxJS Services)

Each `useXxxQuery` hook wraps React Query's `useQuery` + `useMutation`. In Angular these become injectable `*StateService` classes using `BehaviorSubject` for reactivity and `toSignal()` to expose read-only signals to templates.

| React Hook             | Angular State Service      | Mutations exposed                  |
| ---------------------- | -------------------------- | ---------------------------------- |
| `useClassQuery`        | `ClassStateService`        | `create()`, `update()`, `delete()` |
| `useClassPublicQuery`  | `ClassPublicStateService`  | read-only                          |
| `useSubjectQuery`      | `SubjectStateService`      | `create()`, `update()`, `delete()` |
| `useTeacherQuery`      | `TeacherStateService`      | `create()`, `update()`, `delete()` |
| `useGradeQuery`        | `GradeStateService`        | `create()`, `update()`, `delete()` |
| `useNewsQuery`         | `NewsStateService`         | `create()`, `update()`, `delete()` |
| `useNewsPublicQuery`   | `NewsPublicStateService`   | read-only                          |
| `useAccountQuery`      | `AccountStateService`      | `create()`, `update()`, `delete()` |
| `useRegistrationQuery` | `RegistrationStateService` | `create()`, `update()`, `delete()` |
| `useConsultationQuery` | `ConsultationStateService` | `create()`, `update()`, `delete()` |
| `useScheduleQuery`     | `ScheduleStateService`     | `create()`, `update()`, `delete()` |

#### Layer 3: Component-local UI State

| React Pattern                                                | Angular Equivalent                                  |
| ------------------------------------------------------------ | --------------------------------------------------- |
| `const [page, setPage] = useState(0)`                        | `readonly page = signal(0)`                         |
| `const [opened, { open, close }] = useDisclosure(false)`     | `readonly modalOpen = signal(false)`                |
| `const [selectedEntity, setSelectedEntity] = useState(null)` | `readonly selectedEntity = signal<T \| null>(null)` |
| `useMemo(() => ..., [deps])`                                 | `computed(() => ...)`                               |
| `useCallback(() => ..., [deps])`                             | Plain method — `OnPush` + signals eliminates need   |

### 2.2 `useEntityCrud` Hook Analysis

`useEntityCrud` (`src/hooks/useEntityCrud.ts`) is used identically in all 9 management pages. It encapsulates:

- Finding an entity by ID from the cached list
- Opening edit/add modals
- Calling create/update/delete mutations
- Showing success/error notifications

In Angular this becomes a generic `EntityCrudService<T>` provided **per component** (not root), so each management page gets its own isolated instance:

```typescript
// Usage in a management component (providers array)
@Component({
  standalone: true,
  providers: [EntityCrudService],  // fresh instance per component
  ...
})
export class ClassManagementComponent {
  private readonly crud = inject(EntityCrudService<Class>);
  // ...
}
```

### 2.3 Notification System

| React                                        | Angular                                               |
| -------------------------------------------- | ----------------------------------------------------- |
| `NotificationProvider` (custom portal-based) | `NotificationService` wrapping `MatSnackBar`          |
| `useNotification()` hook                     | `inject(NotificationService)`                         |
| `showSuccess(message, title?)`               | `notificationService.showSuccess(message)`            |
| `showError(message, title?)`                 | `notificationService.showError(message)`              |
| `showWarning(message, title?)`               | `notificationService.showWarning(message)`            |
| `showInfo(message, title?)`                  | `notificationService.showInfo(message)`               |
| Custom `AutoNotification` component          | `MatSnackBarComponent` with `panelClass` for coloring |

---

## 3. API Layer

### 3.1 Backend Endpoints Inventory

All API calls target a single backend at `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`). No Next.js API routes are used — all calls go directly to the Spring Boot backend.

Environment config:

- Development: `http://103.81.84.247:8080`
- Production: `http://76.13.181.170:8080`

### 3.2 Complete HTTP Service Map

#### `AuthApiService` (standalone — does not extend `BaseApiService`)

Replaces `src/api/authApi.ts` (`AuthApiClient`).

```typescript
// src/app/core/api/auth-api.service.ts
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { API_BASE_URL } from "../tokens/api-base-url.token";
import type { LoginRequest, LoginResponse } from "../../models/auth.model";

@Injectable({ providedIn: "root" })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(API_BASE_URL);

  private readonly TOKEN_KEY = "auth_token";
  private readonly REFRESH_KEY = "refresh_token";

  // POST /api/auth/login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseURL}/api/auth/login`,
      credentials,
      { withCredentials: true },
    );
  }

  // POST /api/auth/logout
  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.baseURL}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
  }

  // GET /api/auth/validate
  validateToken(): Observable<{ valid: boolean }> {
    return this.http.get<{ valid: boolean }>(
      `${this.baseURL}/api/auth/validate`,
      { withCredentials: true },
    );
  }

  // POST /api/auth/refresh  (called by authInterceptor on 401)
  refresh(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.baseURL}/api/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
          withCredentials: true,
        },
      )
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
          this.setRefreshToken(res.refreshToken);
        }),
      );
  }

  // ── Token storage (localStorage — CSR only) ──────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  removeTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }
}
```

#### `BaseApiService<T>` (abstract generic)

Replaces `src/api/baseApiClient.ts` (`BaseApiClient<T>`). The 401-retry logic moves to the interceptor; this class is pure CRUD.

```typescript
// src/app/core/api/base-api.service.ts
import { inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../tokens/api-base-url.token";
import type {
  BaseEntity,
  ApiListResponse,
  ApiSingleResponse,
  ApiFilters,
} from "../../models/api.models";

export abstract class BaseApiService<
  T extends BaseEntity,
  CreateT = Omit<T, "id" | "createdAt" | "updatedAt">,
  UpdateT = Partial<CreateT>,
> {
  protected abstract readonly endpoint: string;
  protected readonly http = inject(HttpClient);
  protected readonly baseURL = inject(API_BASE_URL);

  getAll(filters?: ApiFilters): Observable<ApiListResponse<T>> {
    const params = this.buildParams(filters);
    return this.http.get<ApiListResponse<T>>(
      `${this.baseURL}${this.endpoint}`,
      { params, withCredentials: true },
    );
  }

  getById(id: string | number): Observable<ApiSingleResponse<T>> {
    return this.http.get<ApiSingleResponse<T>>(
      `${this.baseURL}${this.endpoint}/${id}`,
      { withCredentials: true },
    );
  }

  create(data: CreateT): Observable<ApiSingleResponse<T>> {
    const body = this.serializeData(data);
    return this.http.post<ApiSingleResponse<T>>(
      `${this.baseURL}${this.endpoint}`,
      body,
      { withCredentials: true },
    );
  }

  update(id: string | number, data: UpdateT): Observable<ApiSingleResponse<T>> {
    const body = this.serializeData(data);
    return this.http.put<ApiSingleResponse<T>>(
      `${this.baseURL}${this.endpoint}/${id}`,
      body,
      { withCredentials: true },
    );
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}${this.endpoint}/${id}`, {
      withCredentials: true,
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  protected buildParams(filters?: ApiFilters): HttpParams {
    let params = new HttpParams();
    if (!filters) return params;

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === "") continue;
      if (value instanceof Date) {
        params = params.set(key, value.toISOString());
      } else if (typeof value === "object") {
        params = params.set(key, JSON.stringify(value));
      } else {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  /**
   * Mirror of BaseApiClient.serializeData():
   * - If any value is a File/Blob → serialize as FormData
   * - Otherwise → pass plain object (HttpClient sets Content-Type: application/json)
   */
  protected serializeData(
    data: CreateT | UpdateT,
  ): FormData | CreateT | UpdateT {
    if (data instanceof FormData) return data;
    if (!data || typeof data !== "object") return data;

    const entries = Object.entries(data as Record<string, unknown>);
    const hasBinary = entries.some(([, v]) => this.isBinaryValue(v));

    if (!hasBinary) return data;

    const form = new FormData();
    for (const [key, value] of entries) {
      this.appendToFormData(form, key, value);
    }
    return form;
  }

  private isBinaryValue(value: unknown): boolean {
    if (value instanceof File || value instanceof Blob) return true;
    if (Array.isArray(value)) {
      return value.some((item) => item instanceof File || item instanceof Blob);
    }
    return false;
  }

  private appendToFormData(form: FormData, key: string, value: unknown): void {
    if (value == null) return;
    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (item instanceof File || item instanceof Blob) {
          form.append(key, item);
        } else {
          form.append(key, String(item));
        }
      }
    } else if (value instanceof Date) {
      form.append(key, value.toISOString());
    } else if (typeof value === "object") {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  }
}
```

#### Domain API Services (all extend `BaseApiService`)

```typescript
// ── class-api.service.ts ─────────────────────────────────────────────────
// Replaces src/api/classApi.ts
// Adds public vs admin endpoints — mirrors ClassApiClient exactly
@Injectable({ providedIn: "root" })
export class ClassApiService extends BaseApiService<
  Class,
  CreateClassRequest,
  UpdateClassRequest
> {
  protected readonly endpoint = "/api/classes";

  // Override getAll() to use the public endpoint (matches React getAll())
  override getAll(
    filters?: ClassApiFilters,
  ): Observable<ApiListResponse<Class>> {
    const params = this.buildParams(filters);
    return this.http.get<ApiListResponse<Class>>(
      `${this.baseURL}/api/classes/public`,
      { params, withCredentials: true },
    );
  }

  // Admin-only listing (replaces getAllForAdmin())
  getAllForAdmin(
    filters?: ClassApiFilters,
  ): Observable<ApiListResponse<Class>> {
    const params = this.buildParams(filters);
    return this.http.get<ApiListResponse<Class>>(
      `${this.baseURL}/api/classes/admin`,
      { params, withCredentials: true },
    );
  }

  // GET /api/classes/public?type=FREE
  getFreeClasses(type = "FREE"): Observable<ApiListResponse<Class>> {
    return this.http.get<ApiListResponse<Class>>(
      `${this.baseURL}/api/classes/public`,
      { params: { type }, withCredentials: true },
    );
  }

  // Override getById() to use the public endpoint
  override getById(id: string | number): Observable<ApiSingleResponse<Class>> {
    return this.http.get<ApiSingleResponse<Class>>(
      `${this.baseURL}/api/classes/public/${id}`,
      { withCredentials: true },
    );
  }
}

// ── account-api.service.ts ───────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class AccountApiService extends BaseApiService<
  Account,
  CreateAccountRequest,
  UpdateAccountRequest
> {
  protected readonly endpoint = "/api/accounts";
}

// ── consultation-api.service.ts ──────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class ConsultationApiService extends BaseApiService<
  Consultation,
  CreateConsultationRequest,
  UpdateConsultationRequest
> {
  protected readonly endpoint = "/api/consultations";
}

// ── grade-api.service.ts ─────────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class GradeApiService extends BaseApiService<
  Grade,
  CreateGradeRequest,
  UpdateGradeRequest
> {
  protected readonly endpoint = "/api/grades";
}

// ── news-api.service.ts ──────────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class NewsApiService extends BaseApiService<
  News,
  CreateNewsRequest,
  UpdateNewsRequest
> {
  protected readonly endpoint = "/api/news";
}

// ── registration-api.service.ts ──────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class RegistrationApiService extends BaseApiService<
  Registration,
  CreateRegistrationRequest,
  UpdateRegistrationRequest
> {
  protected readonly endpoint = "/api/registrations";
}

// ── schedule-api.service.ts ──────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class ScheduleApiService extends BaseApiService<
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest
> {
  protected readonly endpoint = "/api/schedules";
}

// ── subject-api.service.ts ───────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class SubjectApiService extends BaseApiService<
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest
> {
  protected readonly endpoint = "/api/subjects";
  // serializeData() from BaseApiService handles File (icon) → FormData automatically
}

// ── teacher-api.service.ts ───────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class TeacherApiService extends BaseApiService<
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest
> {
  protected readonly endpoint = "/api/teachers";
}

// ── upload-image-api.service.ts ──────────────────────────────────────────
// Replaces src/api/uploadImageApi.ts
@Injectable({ providedIn: "root" })
export class UploadImageApiService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(API_BASE_URL);

  upload(file: File): Observable<ApiSingleResponse<string>> {
    const form = new FormData();
    form.append("file", file);
    return this.http.post<ApiSingleResponse<string>>(
      `${this.baseURL}/api/files/upload`,
      form,
      { withCredentials: true },
    );
  }
}
```

### 3.3 Environment & Injection Token

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: "http://103.81.84.247:8080",
};

// src/environments/environment.production.ts
export const environment = {
  production: true,
  apiBaseUrl: "http://76.13.181.170:8080",
};

// src/app/core/tokens/api-base-url.token.ts
import { InjectionToken } from "@angular/core";
import { environment } from "../../../environments/environment";

export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL", {
  providedIn: "root",
  factory: () => environment.apiBaseUrl,
});
```

### 3.4 `app.config.ts` — Bootstrap Configuration

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from "@angular/router";
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";
import { routes } from "./app.routes";
import { authInterceptor } from "./core/auth/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router — withComponentInputBinding() maps route resolvers to @Input()
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // HttpClient — authInterceptor handles Bearer token + 401 retry
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),

    // Angular Material animations (async for performance)
    provideAnimationsAsync(),

    // Snackbar defaults (mirrors NotificationProvider's 4000ms autoClose)
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 4000,
        horizontalPosition: "right",
        verticalPosition: "top",
      },
    },
  ],
};
```

---

## 4. TypeScript Model Inventory

All models port **1:1** from `src/types/` → `src/app/models/`. No structural changes.

### 4.1 File Mapping

| Next.js Source                 | Angular Target                  | Key Types                                                                                                         |
| ------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `types/api.modes.ts`           | `models/api.models.ts`          | `ApiConfig`, `BaseEntity`, `ApiListResponse<T>`, `ApiSingleResponse<T>`, `ApiFilters`, `ApiClient<T,C,U>`         |
| `types/auth.model.ts`          | `models/auth.model.ts`          | `LoginRequest`, `LoginResponse`, `AuthState`                                                                      |
| `types/user.models.ts`         | `models/user.models.ts`         | `UserLogin`                                                                                                       |
| `types/class.models.ts`        | `models/class.models.ts`        | `Class`, `CreateClassRequest`, `UpdateClassRequest`, `ClassApiFilters`                                            |
| `types/teacher.models.ts`      | `models/teacher.models.ts`      | `Teacher`, `CreateTeacherRequest`, `UpdateTeacherRequest`, `TeacherFilters`                                       |
| `types/news.model.ts`          | `models/news.model.ts`          | `News`, `CreateNewsRequest`, `UpdateNewsRequest`, `NewsApiFilters`                                                |
| `types/consultation.models.ts` | `models/consultation.models.ts` | `Consultation`, `CreateConsultationRequest`, `UpdateConsultationRequest`, `ConsultationApiFilters`                |
| `types/registration.models.ts` | `models/registration.models.ts` | `Registration`, `CreateRegistrationRequest`, `UpdateRegistrationRequest`, `RegistrationApiFilters`, `ClassOption` |
| `types/grade.models.ts`        | `models/grade.models.ts`        | `Grade`, `CreateGradeRequest`, `UpdateGradeRequest`                                                               |
| `types/schedule.models.ts`     | `models/schedule.models.ts`     | `Schedule`, `CreateScheduleRequest`, `UpdateScheduleRequest`                                                      |
| `types/subbject.models.ts`     | `models/subject.models.ts`      | `Subject`, `CreateSubjectRequest`, `UpdateSubjectRequest` (note: fix typo in filename)                            |
| `types/account.models.ts`      | `models/account.models.ts`      | `Account`, `CreateAccountRequest`, `UpdateAccountRequest`                                                         |
| `types/components.models.ts`   | `models/components.models.ts`   | `UserSectionProps`, `MobileDrawerProps` (may be eliminated — Angular uses `@Input`)                               |
| `types/http.models.ts`         | `models/http.models.ts`         | HTTP-specific types                                                                                               |

### 4.2 Shared `api.models.ts` (ported)

```typescript
// src/app/models/api.models.ts
export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiListResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export interface ApiSingleResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface ApiFilters {
  id?: number;
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  [key: string]: string | number | boolean | undefined;
}
```

### 4.3 Auth Models (ported)

```typescript
// src/app/models/auth.model.ts
import type { UserLogin } from "./user.models";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  timestamp: string;
  data: {
    refreshToken: string;
    accessToken: string;
    userLogin: UserLogin;
  };
}

export interface AuthState {
  isLoggedIn: boolean;
  user: UserLogin | null;
  isLoading: boolean;
  error: string | null;
}

// src/app/models/user.models.ts
export interface UserLogin {
  id: number;
  sub: string;
  email: string;
  role?: string;
  exp?: number;
  iat?: number;
}
```

---

## 5. Utility Functions Inventory

| Next.js Source        | Angular Target         | Functions                                                                                      |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| `utils/authUtils.ts`  | `utils/auth.utils.ts`  | `decodeAccessTokenUser()`, `parseJwt()`, `isExpired()`, `getStoredToken()`, `getAuthHeaders()` |
| `utils/httpUtils.ts`  | `utils/http.utils.ts`  | `HttpError`, `TimeoutError` (used for error type-narrowing in components)                      |
| `utils/queryUtils.ts` | `utils/query.utils.ts` | `buildQueryString()` — used in `BaseApiService.buildParams()`                                  |
| `utils/textUtils.ts`  | `utils/text.utils.ts`  | Text helpers                                                                                   |
| `utils/index.ts`      | `utils/index.ts`       | Barrel exports                                                                                 |

### 5.1 JWT Utilities (ported verbatim — no browser API changes needed)

```typescript
// src/app/utils/auth.utils.ts
import type { UserLogin } from "../models/user.models";

export function decodeAccessTokenUser(token: string): UserLogin | null {
  try {
    const payload = parseJwt(token);
    return {
      id: payload.sub ?? payload.userId ?? "unknown",
      email: payload.email,
      sub: payload.sub,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}

export function parseJwt(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  if (!base64Url) throw new Error("Invalid JWT");
  const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + (c.codePointAt(0) ?? 0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload) as Record<string, unknown>;
}

export function isExpired(exp?: number): boolean {
  return typeof exp === "number" && exp * 1000 < Date.now();
}
```

### 5.2 Error Classes (ported verbatim)

```typescript
// src/app/utils/http.utils.ts
export class HttpError extends Error {
  override name = "HttpError";
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
  }
}

export class TimeoutError extends Error {
  override name = "TimeoutError";
  constructor(message = "Request timeout") {
    super(message);
  }
}
```

---

## 6. Sidebar Navigation Items

The sidebar (`src/components/management/sidebar/SideBar.tsx`) defines 9 nav items. These map directly to Angular router links:

| Sidebar Item | Next.js `href`             | Angular `routerLink`       |
| ------------ | -------------------------- | -------------------------- |
| Subject      | `/management`              | `/management/subject`      |
| Grades       | `/management/grade`        | `/management/grade`        |
| Teachers     | `/management/teacher`      | `/management/teacher`      |
| Classes      | `/management/class`        | `/management/class`        |
| Schedule     | `/management/schedule`     | `/management/schedule`     |
| Consultation | `/management/consultation` | `/management/consultation` |
| News         | `/management/news`         | `/management/news`         |
| Account      | `/management/account`      | `/management/account`      |
| Registration | `/management/registration` | `/management/registration` |

Active-link detection currently uses `pathname.startsWith(href)` in React. Angular replaces this with `routerLinkActive` directive with `[routerLinkActiveOptions]="{ exact: true }"` for the subject route.

---

## 7. Project Folder Structure (Target)

```
src/
├── app/
│   ├── app.component.ts          # Root component (shell with router-outlet)
│   ├── app.config.ts             # provideRouter, provideHttpClient, etc.
│   ├── app.routes.ts             # All route definitions
│   │
│   ├── core/                     # Singleton services, guards, interceptors
│   │   ├── api/
│   │   │   ├── base-api.service.ts
│   │   │   ├── auth-api.service.ts
│   │   │   ├── class-api.service.ts
│   │   │   ├── account-api.service.ts
│   │   │   ├── consultation-api.service.ts
│   │   │   ├── grade-api.service.ts
│   │   │   ├── news-api.service.ts
│   │   │   ├── registration-api.service.ts
│   │   │   ├── schedule-api.service.ts
│   │   │   ├── subject-api.service.ts
│   │   │   ├── teacher-api.service.ts
│   │   │   └── upload-image-api.service.ts
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── guest.guard.ts
│   │   │   └── auth.interceptor.ts
│   │   ├── services/
│   │   │   ├── notification.service.ts
│   │   │   ├── image-upload.service.ts
│   │   │   └── entity-crud.service.ts
│   │   └── tokens/
│   │       └── api-base-url.token.ts
│   │
│   ├── models/                   # All TypeScript interfaces (ported from src/types/)
│   │   ├── api.models.ts
│   │   ├── auth.model.ts
│   │   ├── user.models.ts
│   │   ├── class.models.ts
│   │   ├── teacher.models.ts
│   │   ├── news.model.ts
│   │   ├── consultation.models.ts
│   │   ├── registration.models.ts
│   │   ├── grade.models.ts
│   │   ├── schedule.models.ts
│   │   ├── subject.models.ts
│   │   ├── account.models.ts
│   │   └── http.models.ts
│   │
│   ├── utils/                    # Ported from src/utils/
│   │   ├── auth.utils.ts
│   │   ├── http.utils.ts
│   │   ├── query.utils.ts
│   │   ├── text.utils.ts
│   │   └── index.ts
│   │
│   ├── shared/                   # Reusable UI components & pipes
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── sidebar/
│   │   │   ├── entity-table/
│   │   │   ├── form-dialog/
│   │   │   ├── confirm-dialog/
│   │   │   ├── add-button/
│   │   │   ├── pagination/
│   │   │   ├── rich-text-editor/
│   │   │   ├── skeleton-card/
│   │   │   ├── class-card/
│   │   │   ├── news-card/
│   │   │   └── subject-card/
│   │   └── pipes/
│   │       └── safe-html.pipe.ts
│   │
│   └── features/
│       ├── auth/
│       │   └── login/
│       ├── public/
│       │   ├── landing/
│       │   │   └── sections/     # 8 landing section components
│       │   ├── class-list/
│       │   ├── class-detail/
│       │   ├── class-by-subject/
│       │   ├── news-list/
│       │   ├── news-detail/
│       │   ├── profile/
│       │   ├── not-authorized/
│       │   ├── not-found/
│       │   └── resolvers/
│       └── management/
│           ├── management-shell/
│           ├── services/         # State services (replaces useXxxQuery hooks)
│           ├── subject/
│           ├── class/
│           ├── account/
│           ├── teacher/
│           ├── news/
│           ├── grade/
│           ├── schedule/
│           ├── registration/
│           └── consultation/
│
├── environments/
│   ├── environment.ts
│   └── environment.production.ts
└── styles/
    ├── _variables.scss           # Brand colours (fresh-blue, fresh-green, etc.)
    ├── _reset.scss
    └── styles.scss               # Global styles (port of globals.css)
```
