# Phase 3 — Migration Roadmap

This document provides the complete step-by-step checklist to build the Angular application from scratch, plus the technical debt registry and SSR comparison.

---

## Part A: Phased Checklist

Work through phases in order. Each phase produces a runnable application state. Do not skip ahead.

---

### Phase A — Scaffold & Bootstrap

**Goal:** Empty Angular project compiles and serves with routing and Material.

- [ ] A1. `ng new create-learn-angular --standalone --routing --style=scss --ssr=false`
- [ ] A2. `ng add @angular/material` — choose Indigo/Pink theme; yes animations; yes typography
- [ ] A3. Install additional packages:
  ```
  npm install ngx-editor rxjs
  ```
- [ ] A4. Delete boilerplate: `app.component.html` → minimal `<router-outlet />`, remove `app.component.spec.ts`
- [ ] A5. Create `src/environments/environment.ts` and `src/environments/environment.prod.ts` with `apiBaseUrl`
- [ ] A6. Create `API_BASE_URL` InjectionToken in `src/app/core/tokens.ts`
- [ ] A7. Wire `app.config.ts`:
  - `provideRouter(routes, withComponentInputBinding())`
  - `provideHttpClient(withInterceptors([authInterceptor]))`
  - `provideAnimationsAsync()`
  - `APP_INITIALIZER` calling `AuthService.initialize()`
- [ ] A8. `npm run start` — verify empty app compiles

---

### Phase B — Models

**Goal:** All TypeScript models in place before any service or component.

Port each Next.js type file 1:1, adjusting imports:

- [ ] B1. `src/app/models/base.model.ts` — `BaseEntity`, `ApiFilters`, `ApiListResponse<T>`, `ApiSingleResponse<T>`, `ApiConfig`
- [ ] B2. `src/app/models/auth.model.ts` — `AuthState`, `LoginRequest`, `LoginResponse`, `UserLogin`
- [ ] B3. `src/app/models/account.model.ts`
- [ ] B4. `src/app/models/class.model.ts` — `Class`, `CreateClassRequest`, `UpdateClassRequest`, `ClassApiFilters`
- [ ] B5. `src/app/models/subject.model.ts` — `Subject`, `CreateSubjectRequest`, `UpdateSubjectRequest`
- [ ] B6. `src/app/models/grade.model.ts`
- [ ] B7. `src/app/models/teacher.model.ts` — `Teacher`, `CreateTeacherRequest`, `UpdateTeacherRequest`
- [ ] B8. `src/app/models/schedule.model.ts` — `Schedule`, `CreateScheduleRequest`, `UpdateScheduleRequest`
- [ ] B9. `src/app/models/news.model.ts`
- [ ] B10. `src/app/models/registration.model.ts`
- [ ] B11. `src/app/models/consultation.model.ts`
- [ ] B12. `src/app/models/index.ts` — barrel export
- [ ] B13. Run `ng build` — zero type errors before continuing

---

### Phase C — Core Infrastructure

**Goal:** Auth, HTTP, notifications wired up; guards and interceptor in place.

- [ ] C1. `src/app/core/tokens.ts` — `API_BASE_URL` InjectionToken
- [ ] C2. `src/app/core/utils/auth.utils.ts` — `decodeAccessTokenUser`, `isExpired`, `buildQueryString`
- [ ] C3. `src/app/core/auth/auth-api.service.ts` — login, logout, refresh, refresh$ (Observable), token helpers
- [ ] C4. `src/app/core/auth/auth.service.ts` — full implementation (Phase 2, §1.2)
- [ ] C5. `src/app/core/auth/auth.guard.ts` — `authGuard` and `guestGuard` (Phase 2, §1.4)
- [ ] C6. `src/app/core/auth/auth.interceptor.ts` — JWT header + 401 retry (Phase 2, §1.5)
- [ ] C7. `src/app/core/notifications/notification.service.ts` (Phase 2, §5)
- [ ] C8. `src/app/core/api/base-api.service.ts` (Phase 2, §4)
- [ ] C9. `src/app/core/crud/entity-crud.service.ts` (Phase 2, §2.1)
- [ ] C10. Wire `APP_INITIALIZER` in `app.config.ts`
- [ ] C11. `ng build` — zero errors

---

### Phase D — Domain API Services

**Goal:** All 11 API services available.

- [ ] D1. `src/app/core/api/subject-api.service.ts` — endpoint `/api/subjects`
- [ ] D2. `src/app/core/api/grade-api.service.ts` — endpoint `/api/grades`
- [ ] D3. `src/app/core/api/teacher-api.service.ts` — endpoint `/api/teachers`
- [ ] D4. `src/app/core/api/class-api.service.ts` — dual endpoints (Phase 2, §16)
- [ ] D5. `src/app/core/api/schedule-api.service.ts` — endpoint `/api/schedules`
- [ ] D6. `src/app/core/api/news-api.service.ts` — endpoint `/api/news`
- [ ] D7. `src/app/core/api/account-api.service.ts` — endpoint `/api/accounts`
- [ ] D8. `src/app/core/api/registration-api.service.ts` — endpoint `/api/registrations`
- [ ] D9. `src/app/core/api/consultation-api.service.ts` — endpoint `/api/consultations`
- [ ] D10. `src/app/core/api/auth-api.service.ts` — `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`
- [ ] D11. `src/app/core/api/upload-image-api.service.ts` — endpoint `/api/upload`
- [ ] D12. `ng build` — zero errors

---

### Phase E — Shared UI Components

**Goal:** Reusable components all pass `ng build`; no page components yet.

- [ ] E1. `src/app/shared/entity-table/entity-table.component.ts` — generic `MatTable` (Phase 2, §10)
- [ ] E2. `src/app/shared/confirm-dialog/confirm-dialog.component.ts` (Phase 2, §11)
- [ ] E3. `src/app/shared/pipes/safe-html.pipe.ts` (Phase 2, §14)
- [ ] E4. `src/app/shared/rich-text-editor/rich-text-editor.component.ts` — `ngx-editor` wrapper (Phase 2, §13)
- [ ] E5. `src/app/shared/add-button/add-button.component.ts` — `MatButton` with icon + label input
- [ ] E6. `src/app/shared/index.ts` — barrel export
- [ ] E7. `ng build` — zero errors

---

### Phase F — Auth & Login

**Goal:** `/login` route works; redirect to `/management/subject` on success.

- [ ] F1. Create `LoginComponent` at `src/app/features/auth/login/login.component.ts`
  - Reactive form: email + password fields, validators
  - On submit: call `AuthService.login()`, navigate to `/management/subject`
  - On init: if already logged in, redirect to `/management/subject`
  - Display `auth.error()` signal below form
  - Material: `MatFormField`, `MatInput`, `MatButton`, `MatCard`
- [ ] F2. Register `/login` route with `guestGuard` in `app.routes.ts`
- [ ] F3. Manual test: navigate to `/login`, log in with valid credentials, verify redirect
- [ ] F4. Manual test: logged-in user navigating to `/login` is redirected away

---

### Phase G — Management Shell & Sidebar

**Goal:** `/management/*` routes render inside the shell layout with sidebar navigation.

- [ ] G1. `SidebarComponent` — `MatNavList` with correct routes (Phase 2, §8). Verify `/management/subject` is the Subject link (not `/management`).
- [ ] G2. `ManagementShellComponent` — `MatSidenav` layout (Phase 2, §7)
- [ ] G3. Register management routes in `app.routes.ts`:
  ```typescript
  {
    path: 'management',
    canActivate: [authGuard],
    component: ManagementShellComponent,
    children: [
      { path: '', redirectTo: 'subject', pathMatch: 'full' },
      { path: 'subject',      loadComponent: () => import('./features/management/subject/...') },
      { path: 'grade',        loadComponent: () => import('./features/management/grade/...') },
      { path: 'teacher',      loadComponent: () => import('./features/management/teacher/...') },
      { path: 'class',        loadComponent: () => import('./features/management/class/...') },
      { path: 'schedule',     loadComponent: () => import('./features/management/schedule/...') },
      { path: 'consultation', loadComponent: () => import('./features/management/consultation/...') },
      { path: 'news',         loadComponent: () => import('./features/management/news/...') },
      { path: 'account',      loadComponent: () => import('./features/management/account/...') },
      { path: 'registration', loadComponent: () => import('./features/management/registration/...') },
    ],
  }
  ```
- [ ] G4. Manual test: unauthenticated user hitting `/management/subject` redirects to `/login`
- [ ] G5. Manual test: authenticated user sees sidebar and `router-outlet` renders

---

### Phase H — Management Pages (9 pages)

**Goal:** All management CRUD pages functional. Build one page first as a template, then repeat.

#### H.1 Template Page: Subject (simplest — no special dependencies)

- [ ] H1a. `SubjectCrudService extends EntityCrudService<Subject>` (Phase 2, §2.2)
- [ ] H1b. `SubjectFormComponent` — Reactive form, fields: name, description, file input for icon
  - Use `BaseApiService.serializeData()` (auto-FormData when icon file present)
- [ ] H1c. `SubjectManagementComponent`
  - `providers: [SubjectCrudService]`
  - Table columns: Name, Description, Icon (image tag)
  - `MatPaginator` wired to `SubjectCrudService.loadPage()`
  - Add button → `crud.openAdd()` → `MatDialog.open(SubjectFormComponent)`
  - Edit → `crud.openEdit(row)` → `MatDialog.open(SubjectFormComponent)`
  - Delete → `MatDialog.open(ConfirmDialogComponent)` → `crud.handleConfirmDelete()`
- [ ] H1d. Manual test: create, update, delete a subject

#### H.2 Remaining Pages (same pattern as above)

Each page needs: `*CrudService`, `*FormComponent`, `*ManagementComponent`. Special notes below.

- [ ] H2. **Grade** — fields: name, description. No special dependencies.
- [ ] H3. **Teacher** — fields: firstName, lastName, introduction, gender (MatSelect: MALE/FEMALE), profileImage (file upload via `UploadImageApiService`).
- [ ] H4. **Account** — `AccountFormComponent` (Phase 2, §12.2). Password optional on edit.
- [ ] H5. **News** — `RichTextEditorComponent` for content field.
- [ ] H6. **Consultation** — fields: studentName, phone, subject, message, status.
- [ ] H7. **Registration** — fields: studentName, classId (dropdown), status.
- [ ] H8. **Schedule** — fields: time (string), classId (dropdown). Note: schedules are also managed inline from ClassForm — this standalone page is for bulk management.
- [ ] H9. **Class** — most complex (see H.9 below).

#### H.9 Class (Complex)

- [ ] H9a. `ClassStateService` — load, create, update, delete (Phase 2, §3). Provided per-component.
- [ ] H9b. `ClassFormComponent` — all fields including `FormArray` for schedules (Phase 2, §12.3):
  - Dropdowns: subjects (multi), grades (multi), teacher (single) — load from respective state services
  - Image field: file input → upload via `UploadImageApiService` → store path
  - `RichTextEditorComponent` for description
  - `ScheduleRow` sub-component (inline schedule add/remove)
  - On submit:
    1. Create/update the Class entity
    2. Delete removed schedule IDs (`scheduleApiService.delete()` for each)
    3. Create new schedules (`scheduleApiService.create()` with `clazzId`)
    4. Update existing schedules (`scheduleApiService.update()`)
    5. Reload class list
- [ ] H9c. `ClassManagementComponent` — table with columns: Name, Brief, Teacher, Price, Status (chip), Grades, Subjects
- [ ] H9d. Manual test: create class with schedules, edit class, delete a schedule row, add a new schedule row, update class

---

### Phase I — Public-Facing Pages

**Goal:** Landing, class list, class detail, teachers page, news page functional.

- [ ] I1. `HeaderComponent` (Phase 2, §9) — subjects hover menu, mobile drawer, auth menu
- [ ] I2. `FooterComponent` — static; port from Next.js landing page footer section
- [ ] I3. `AppComponent` — wrap with `<app-header>`, `<router-outlet>`, `<app-footer>`
- [ ] I4. `LandingComponent` — 8 section sub-components, use `@defer` for below-fold sections
- [ ] I5. `ClassListComponent` — public grid; `ClassApiService.getAllPublic()`; `MatCard` per class; filter by subject
- [ ] I6. `ClassDetailComponent` — `ClassApiService.getByIdPublic(id)`; `[innerHTML]="description | safeHtml"` for rich content; schedule list
- [ ] I7. Route: `{ path: 'class/subject/:subjectId', component: ClassListComponent }` — filter by subject
- [ ] I8. `TeachersPageComponent` — grid of teacher cards
- [ ] I9. `NewsPageComponent` — list of news articles
- [ ] I10. `NewsDetailComponent` — single article with `safeHtml` for content
- [ ] I11. `ng build` — zero errors; check all public routes in browser

---

### Phase J — Polish & Error Handling

**Goal:** Edge cases, loading states, error boundaries covered across all pages.

- [ ] J1. Add global error handler (`ErrorHandler` class) that calls `NotificationService.showError()`
- [ ] J2. All management tables: show `MatProgressSpinner` while `isLoading()` is true
- [ ] J3. All management tables: show `MatSnackBar` or inline `<mat-error>` when load fails
- [ ] J4. Form dialogs: disable submit button while `isSubmitting()` is true
- [ ] J5. `AuthService.checkAuthStatus()` failure: route to `/login`; show snackbar
- [ ] J6. 401 from interceptor after failed refresh: navigate to `/login`, show "Session expired"
- [ ] J7. Verify all `routerLinkActive` highlight states in sidebar are correct
- [ ] J8. Mobile responsiveness: test `ManagementShellComponent` sidenav on narrow viewport
- [ ] J9. Test `HeaderComponent` mobile drawer opens/closes
- [ ] J10. Accessibility: all form fields have `mat-label`, all icon buttons have `aria-label`

---

### Phase K — Build Verification & Deployment Prep

**Goal:** Production build clean; Docker/environment configuration parity with Next.js project.

- [ ] K1. `ng build --configuration=production` — zero errors, zero warnings (or document acceptable warnings)
- [ ] K2. Create `environment.ts` (`apiBaseUrl: 'http://103.81.84.247:8080'`) and `environment.prod.ts` (`apiBaseUrl: 'http://76.13.181.170:8080'`)
- [ ] K3. Verify `API_BASE_URL` token reads from the correct environment file per build config
- [ ] K4. Write `Dockerfile` for Angular — multi-stage: `node:20-alpine` build → `nginx:alpine` serve
- [ ] K5. Write `nginx.conf` — `try_files $uri $uri/ /index.html` for SPA routing
- [ ] K6. Test Docker build for dev and prod profiles
- [ ] K7. Confirm no secrets in committed files

---

## Part B: SSR Comparison

| Concern                       | Next.js (current)                                                                         | Angular (target)                              |
| ----------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| Rendering strategy            | Technically SSR-capable (App Router) but every page uses `'use client'` → effectively CSR | Pure CSR (`provideRouter`, no `@angular/ssr`) |
| Server Components used        | None                                                                                      | N/A                                           |
| API Routes                    | None                                                                                      | N/A (direct backend calls remain)             |
| Initial HTML                  | Minimal shell (CSR hydration)                                                             | Identical minimal shell                       |
| SEO                           | Poor (all JS-rendered)                                                                    | Identical (no change)                         |
| First Contentful Paint        | Blocked by client JS bundle                                                               | Same                                          |
| Future SSR option             | `next build` already supports it                                                          | Add `@angular/ssr` (Angular Universal) later  |
| `sessionStorage` anti-flicker | Snapshot read on mount                                                                    | Snapshot read in `APP_INITIALIZER`            |

No functional regression from dropping SSR: the Next.js source was already pure CSR.

---

## Part C: Technical Debt & Pitfalls Registry

Issues discovered during codebase analysis. Each should be addressed during the corresponding migration phase.

| #   | Location                          | Issue                                                                                                                                        | Severity | Recommended fix                                                                                                                                                      | Phase   |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | `ClassForm.tsx:81-83`             | `subjectIds`/`gradeIds` typed as `number[]` in `CreateClassRequest` but Mantine MultiSelect returns `string[]`; requires `.map(Number)` cast | Medium   | In Angular `ClassFormComponent`, keep form value as `string[]` and cast to `number[]` in submit handler                                                              | H9b     |
| 2   | `class/page.tsx:83`               | `selectedClass` is `Class \| null`; accessed as `.id` without null check — pre-existing TS error                                             | Low      | Angular `ClassFormComponent` receives entity directly as input; no null access needed                                                                                | H9c     |
| 3   | `teacher/page.tsx:105,150`        | `UpdateTeacherRequest.id` typed as `string` but `Teacher.id` is `number`; mismatch causes TS error                                           | Medium   | In Angular `TeacherApiService.update()`, coerce to `string` at call site; keep model `id: number`                                                                    | H3      |
| 4   | `SideBar.tsx:40-96`               | Mantine sidebar uses `href: '/management'` for Subject link — active detection breaks for child routes                                       | High     | Angular sidebar uses `routerLink="/management/subject"` — already corrected in `SidebarComponent`                                                                    | G1      |
| 5   | `SideBar.tsx:30-31`               | `icon: React.ComponentType<unknown>` causes type error with Tabler icons (`IconProps & RefAttributes`)                                       | Low      | Non-issue in Angular — Material Icons use string names                                                                                                               | G1      |
| 6   | `useNewsPublicQuery.ts:28`        | Called with 1 argument but expects 0 — pre-existing call signature error                                                                     | Low      | Port news query without the spurious argument                                                                                                                        | D6      |
| 7   | `baseApiClient.ts:55-82`          | 401 retry logic is per-request (inline in `BaseApiClient.request()`) — duplicated across every API call                                      | High     | Moved entirely to `authInterceptor` in Angular — single responsibility                                                                                               | C6      |
| 8   | `ClassForm.tsx:70`                | `useQueryClient()` used inside form to invalidate queries on schedule save — tight coupling between form and cache layer                     | Medium   | Angular `ClassFormComponent` calls `ClassStateService.load()` after submit — no direct cache access                                                                  | H9b     |
| 9   | `AuthContext.tsx:44`              | `useRef(false)` guard needed to prevent double-init in React 18 Strict Mode                                                                  | Low      | Angular `APP_INITIALIZER` runs exactly once — no guard needed                                                                                                        | C10     |
| 10  | `Header.tsx` — `SubjectHoverCard` | `HoverCard` fetches all subjects (pageSize: 100) on every header render                                                                      | Medium   | Angular `SubjectStateService` is singleton; load called once in `AppComponent.ngOnInit()` — shared across header and management                                      | I1      |
| 11  | `management/layout.tsx`           | Mobile overlay uses manual `{mobileMenuOpened && <Box overlay />}` pattern — not a proper focus trap                                         | Low      | Angular `MatSidenav` with `mode="over"` provides proper overlay and focus trapping built-in                                                                          | G2      |
| 12  | All management pages              | `useEntityCrud` receives `createPayload` factory that reconstructs full typed objects — verbose boilerplate repeated 9 times                 | Medium   | Angular `EntityCrudService.handleFormSubmit()` receives `Partial<T>` and calls `apiService.create/update` directly; form components produce correctly typed payloads | H1c–H9c |
| 13  | `ClassForm.tsx:238`               | `wrapSubmit` pattern (from `useImageUpload`) bridges Mantine form submit with async image upload — custom lifecycle hook                     | Medium   | Angular: image upload runs in form `submit()` handler before calling `ClassStateService.create/update()` — no custom hook wrapper needed                             | H9b     |
| 14  | All `use*Query` hooks             | React Query `staleTime: 5 * 60 * 1000` provides automatic background refetch on window focus                                                 | Low      | Angular services have no automatic refetch — acceptable trade-off; add manual refresh if required                                                                    | All H   |

---

## Part D: File-by-File Migration Map

Complete reference mapping every source file to its Angular output.

### Core infrastructure

| Source (Next.js)                         | Target (Angular)                                     |
| ---------------------------------------- | ---------------------------------------------------- |
| `src/contexts/AuthContext.tsx`           | `src/app/core/auth/auth.service.ts`                  |
| `src/api/authApi.ts`                     | `src/app/core/auth/auth-api.service.ts`              |
| `src/api/baseApiClient.ts`               | `src/app/core/api/base-api.service.ts`               |
| `src/hooks/useEntityCrud.ts`             | `src/app/core/crud/entity-crud.service.ts`           |
| `src/hooks/useNotification.ts`           | eliminated — use `inject(NotificationService)`       |
| `src/providers/NotificationProvider.tsx` | `src/app/core/notifications/notification.service.ts` |
| `src/providers/QueryProvider.tsx`        | eliminated                                           |
| `src/utils/authUtils.ts`                 | `src/app/core/utils/auth.utils.ts`                   |
| `src/utils/httpUtils.ts`                 | `src/app/core/utils/http.utils.ts` (if needed)       |
| `src/utils/queryUtils.ts`                | eliminated                                           |

### Domain API services

| Source                       | Target                                         |
| ---------------------------- | ---------------------------------------------- |
| `src/api/classApi.ts`        | `src/app/core/api/class-api.service.ts`        |
| `src/api/accountApis.ts`     | `src/app/core/api/account-api.service.ts`      |
| `src/api/consultationApi.ts` | `src/app/core/api/consultation-api.service.ts` |
| `src/api/gradeApi.ts`        | `src/app/core/api/grade-api.service.ts`        |
| `src/api/newsApi.ts`         | `src/app/core/api/news-api.service.ts`         |
| `src/api/registrationApi.ts` | `src/app/core/api/registration-api.service.ts` |
| `src/api/scheduleApi.ts`     | `src/app/core/api/schedule-api.service.ts`     |
| `src/api/subjectApi.ts`      | `src/app/core/api/subject-api.service.ts`      |
| `src/api/teacherApi.ts`      | `src/app/core/api/teacher-api.service.ts`      |
| `src/api/uploadImageApi.ts`  | `src/app/core/api/upload-image-api.service.ts` |

### Shared components

| Source                                              | Target                                                          |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `components/management/crud/EntityTable.tsx`        | `src/app/shared/entity-table/entity-table.component.ts`         |
| `components/management/crud/DeleteConfirmModal.tsx` | `src/app/shared/confirm-dialog/confirm-dialog.component.ts`     |
| `components/management/crud/FormModal.tsx`          | eliminated — `MatDialog.open()` inline                          |
| `components/management/crud/PaginationBar.tsx`      | eliminated — `MatPaginator` inline                              |
| `components/management/crud/AddNewButton.tsx`       | `src/app/shared/add-button/add-button.component.ts`             |
| `components/rich-text-editor/RichTextEditor.tsx`    | `src/app/shared/rich-text-editor/rich-text-editor.component.ts` |
| `components/auth/ProtectedRoute.tsx`                | eliminated — `authGuard`                                        |

### Layout & navigation

| Source                                      | Target                                                            |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `app/layout.tsx`                            | `src/app/app.component.ts` + `src/app/app.config.ts`              |
| `app/management/layout.tsx`                 | `src/app/features/management/shell/management-shell.component.ts` |
| `components/management/sidebar/SideBar.tsx` | `src/app/features/management/sidebar/sidebar.component.ts`        |
| `components/header/Header.tsx`              | `src/app/features/public/header/header.component.ts`              |

### Management pages

| Source                                                | Target                                                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `app/management/page.tsx` (Subject)                   | `src/app/features/management/subject/subject-management.component.ts`                               |
| `app/management/class/page.tsx` + `ClassForm.tsx`     | `src/app/features/management/class/class-management.component.ts` + `class-form.component.ts`       |
| `app/management/account/page.tsx` + `AccountForm.tsx` | `src/app/features/management/account/account-management.component.ts` + `account-form.component.ts` |
| `app/management/teacher/page.tsx`                     | `src/app/features/management/teacher/teacher-management.component.ts`                               |
| `app/management/grade/page.tsx`                       | `src/app/features/management/grade/grade-management.component.ts`                                   |
| `app/management/news/page.tsx`                        | `src/app/features/management/news/news-management.component.ts`                                     |
| `app/management/schedule/page.tsx`                    | `src/app/features/management/schedule/schedule-management.component.ts`                             |
| `app/management/consultation/page.tsx`                | `src/app/features/management/consultation/consultation-management.component.ts`                     |
| `app/management/registration/page.tsx`                | `src/app/features/management/registration/registration-management.component.ts`                     |

### Public pages

| Source                                          | Target                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `app/landing/page.tsx` (+ 8 section components) | `src/app/features/public/landing/landing.component.ts` + sections |
| `app/class/page.tsx`                            | `src/app/features/public/class-list/class-list.component.ts`      |
| `app/class/[id]/page.tsx`                       | `src/app/features/public/class-detail/class-detail.component.ts`  |
| `app/login/page.tsx`                            | `src/app/features/auth/login/login.component.ts`                  |
| `components/landing/PopularSubjectCard.tsx`     | `src/app/features/public/subject-card/subject-card.component.ts`  |
| `components/landing/ClassCard.tsx`              | `src/app/features/public/class-card/class-card.component.ts`      |

---

## Part E: Target Project Structure

```
src/
├── app/
│   ├── app.component.ts            # Root: <app-header> + <router-outlet> + <app-footer>
│   ├── app.config.ts               # provideRouter, provideHttpClient, APP_INITIALIZER
│   ├── app.routes.ts               # Top-level route table (lazy-loaded)
│   ├── core/
│   │   ├── tokens.ts               # API_BASE_URL InjectionToken
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth-api.service.ts
│   │   │   ├── auth.guard.ts       # authGuard + guestGuard
│   │   │   └── auth.interceptor.ts
│   │   ├── api/
│   │   │   ├── base-api.service.ts
│   │   │   ├── class-api.service.ts
│   │   │   ├── subject-api.service.ts
│   │   │   ├── grade-api.service.ts
│   │   │   ├── teacher-api.service.ts
│   │   │   ├── schedule-api.service.ts
│   │   │   ├── news-api.service.ts
│   │   │   ├── account-api.service.ts
│   │   │   ├── registration-api.service.ts
│   │   │   ├── consultation-api.service.ts
│   │   │   └── upload-image-api.service.ts
│   │   ├── crud/
│   │   │   └── entity-crud.service.ts
│   │   ├── notifications/
│   │   │   └── notification.service.ts
│   │   └── utils/
│   │       ├── auth.utils.ts
│   │       └── http.utils.ts
│   ├── models/
│   │   ├── base.model.ts
│   │   ├── auth.model.ts
│   │   ├── class.model.ts
│   │   ├── subject.model.ts
│   │   ├── grade.model.ts
│   │   ├── teacher.model.ts
│   │   ├── schedule.model.ts
│   │   ├── news.model.ts
│   │   ├── account.model.ts
│   │   ├── registration.model.ts
│   │   ├── consultation.model.ts
│   │   └── index.ts
│   ├── shared/
│   │   ├── entity-table/
│   │   │   └── entity-table.component.ts
│   │   ├── confirm-dialog/
│   │   │   └── confirm-dialog.component.ts
│   │   ├── rich-text-editor/
│   │   │   └── rich-text-editor.component.ts
│   │   ├── add-button/
│   │   │   └── add-button.component.ts
│   │   ├── pipes/
│   │   │   └── safe-html.pipe.ts
│   │   └── index.ts
│   └── features/
│       ├── auth/
│       │   └── login/
│       │       └── login.component.ts
│       ├── management/
│       │   ├── shell/
│       │   │   └── management-shell.component.ts
│       │   ├── sidebar/
│       │   │   └── sidebar.component.ts
│       │   ├── subject/
│       │   │   ├── subject-management.component.ts
│       │   │   ├── subject-form.component.ts
│       │   │   └── subject-crud.service.ts
│       │   ├── grade/
│       │   │   ├── grade-management.component.ts
│       │   │   ├── grade-form.component.ts
│       │   │   └── grade-crud.service.ts
│       │   ├── teacher/
│       │   │   ├── teacher-management.component.ts
│       │   │   ├── teacher-form.component.ts
│       │   │   └── teacher-crud.service.ts
│       │   ├── class/
│       │   │   ├── class-management.component.ts
│       │   │   ├── class-form.component.ts
│       │   │   └── class-state.service.ts
│       │   ├── schedule/
│       │   │   ├── schedule-management.component.ts
│       │   │   ├── schedule-form.component.ts
│       │   │   └── schedule-crud.service.ts
│       │   ├── news/
│       │   │   ├── news-management.component.ts
│       │   │   ├── news-form.component.ts
│       │   │   └── news-crud.service.ts
│       │   ├── account/
│       │   │   ├── account-management.component.ts
│       │   │   ├── account-form.component.ts
│       │   │   └── account-crud.service.ts
│       │   ├── consultation/
│       │   │   ├── consultation-management.component.ts
│       │   │   ├── consultation-form.component.ts
│       │   │   └── consultation-crud.service.ts
│       │   └── registration/
│       │       ├── registration-management.component.ts
│       │       ├── registration-form.component.ts
│       │       └── registration-crud.service.ts
│       └── public/
│           ├── header/
│           │   └── header.component.ts
│           ├── footer/
│           │   └── footer.component.ts
│           ├── landing/
│           │   ├── landing.component.ts
│           │   └── sections/ (8 sub-components)
│           ├── class-list/
│           │   └── class-list.component.ts
│           ├── class-detail/
│           │   └── class-detail.component.ts
│           ├── subject-card/
│           │   └── subject-card.component.ts
│           └── class-card/
│               └── class-card.component.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── assets/
    └── images/
        └── algocore-logo.jpg
```

---

## Part F: Angular Package Versions (locked)

| Package                | Version                           |
| ---------------------- | --------------------------------- |
| `@angular/core`        | 18.x                              |
| `@angular/material`    | 18.x                              |
| `@angular/cdk`         | 18.x                              |
| `@angular/router`      | 18.x                              |
| `@angular/forms`       | 18.x                              |
| `@angular/common/http` | 18.x                              |
| `rxjs`                 | 7.x                               |
| `ngx-editor`           | latest compatible with Angular 18 |
| TypeScript             | 5.x (strict mode)                 |
