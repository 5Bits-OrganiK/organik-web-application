# Architectural Decision Records (ADRs)

This document records the principal architectural decisions made for the OrganiK web application.

---

## ADR 001: Adoption of Domain-Driven Design (DDD) with One Folder per Bounded Context

### Status
Accepted

### Context
OrganiK covers several business capabilities (inventory, product catalog, supply requests, shipments, supplier management, conservation monitoring, analytics, identity) that evolve at different speeds. The project report (chapter 4.6) defines twelve bounded contexts, and the code has to mirror them so the design and the implementation can be defended together.

### Decision
Structure the frontend according to Domain-Driven Design tactical patterns, with **one folder per bounded context** under `src/app/`:
- **Bounded Contexts**: `iam`, `profiles`, `dashboard`, `analytics`, `inventory`, `products`, `requisition`, `procurements`, `suppliers`, `conservation`, `communication` and `shared` (Shared Kernel).
- **Layered Architecture per Context**, applying only the layers a context needs:
  - `domain`: entities, value objects, domain services and domain errors, free from Angular, HTTP and UI dependencies.
  - `infrastructure`: gateways, assemblers, resource contracts and seeds that talk to the backend.
  - `application`: signal-based stores that orchestrate use cases and build read models.
  - `presentation`: standalone components, routed views, forms and the routes of the context.

### Consequences
- **Positive**: Clear boundaries between domains, features that are always found in the same place, isolated unit tests, and a direct match with the report.
- **Negative**: Additional boilerplate for mapping between layers, and contexts such as `profiles`, `dashboard` and `communication` currently own no domain model.

---

## ADR 002: Signal-Based State Management for Application Stores

### Status
Accepted

### Context
The views need fine-grained reactivity, predictable state mutations and minimal boilerplate, without adding a state-management library.

### Decision
Use lightweight, context-scoped stores (`InventoryStore`, `RequisitionStore`, `ProductsStore`, `AuthStore`, ...) powered by Angular Signals (`signal`, `computed`, `inject()`):
- Internal mutable state is kept private in a writable signal.
- Public state is exposed as read-only signals and computed read models.
- Stores are the only place that mutates state; views read signals and call store commands.
- Asynchronous gateway calls update the signals when they resolve.

### Consequences
- **Positive**: Integrates natively with zoneless change detection and `OnPush`; no external state library.
- **Negative**: Developers must follow the convention of immutable updates inside store methods.

---

## ADR 003: Assembler Pattern with Gateways That Return Domain Entities

### Status
Accepted

### Context
Backend resources differ from the internal domain model in naming, structure and types (for example dates travel as ISO strings and quantities as plain numbers).

### Decision
Each context keeps its wire contracts in `*-response.ts` files (`*Resource`, `*Response`) and maps them with dedicated assembler classes (`ProductAssembler`, `StockLotAssembler`, `SupplyRequestAssembler`, `ShipmentOrderAssembler`, `UserAssembler`, ...):
- Gateways (`ProductsApi`, `InventoryApi`, `RequisitionApi`, ...) return **domain entities**, never raw resources.
- Assemblers are bidirectional: resource to entity and entity to resource.
- Entities validate their invariants in the constructor and raise a `DomainError` when they are violated.

### Consequences
- **Positive**: The domain stays independent of backend schema changes, and the in-memory gateways can be replaced by HTTP ones without touching stores or views.
- **Negative**: One assembler per resource has to be written and tested.

---

## ADR 004: Value Objects and a Clock Port in the Shared Kernel

### Status
Accepted

### Context
Quantities, money, percentages, e-mail addresses and dates appear in several contexts, and expiration rules depend on the current day, which makes tests fragile.

### Decision
Place reusable value objects (`CalendarDate`, `DateTime`, `EmailAddress`, `Money`, `Percentage`, `Quantity`) and the `Clock` port in `shared/domain`:
- Value objects are immutable and validate themselves.
- Time is always read through `Clock`, so tests can freeze the date.

### Consequences
- **Positive**: Consistent validation, no primitive obsession and deterministic expiration rules.
- **Negative**: Contexts depend on the Shared Kernel, so changes there must be reviewed carefully.

---

## ADR 005: Fake REST API on Beeceptor with a Local Fallback

### Status
Accepted

### Context
The RESTful web services (Spring Boot) are developed in later sprints, while the frontend already has to be deployed and exercised against an API. The team uses the free plan of Beeceptor, which keeps about twelve objects in total (oldest first) and answers a limited number of requests per day.

### Decision
Expose three CRUD routes on Beeceptor under `https://organik.free.beeceptor.com/api/v1`: `/users` (sign in and sign up), `/products` and `/inventory`, documented in `docs/openapi-fake-api.yaml`. The `FakeApi` client in the Shared Kernel is **best effort**:
- Answers are cached for five minutes in memory and in `localStorage`, also when they failed.
- When the API is unreachable or out of quota (HTTP 429), the gateways keep working with their in-memory data.
- Remote objects are merged with the local seed, so no module becomes empty when the plan evicts old objects.
- The integration is switched on by the `FAKE_API_ENABLED` token in `app.config.ts`; unit tests stay in memory.

### Consequences
- **Positive**: The frontend can be deployed and demonstrated against a real HTTP API without the backend, and it never breaks when the free plan is exhausted.
- **Negative**: Data created by users is not durable on the free plan, and the demo passwords stored in the fake API are visible to anyone with the URL.

---

## ADR 006: Material Design 3 Theming with the OrganiK Palette

### Status
Accepted

### Context
The product needs an accessible, consistent UI component library whose look matches the OrganiK brand (forest greens with a lime accent) and the landing page.

### Decision
Adopt Angular Material with Material 3 theming:
- `@include mat.theme(...)` in `src/material-theme.scss` with the green and spring-green palettes, Geist as the interface font and Fraunces as the display font.
- `mat.theme-overrides` and component override mixins (buttons, form fields, tables, ...) for the OrganiK palette.
- Shared design tokens (`--ok-*`) in `src/styles.css` for surfaces, borders, shadows, motion and button variants.

### Consequences
- **Positive**: Accessible components, consistent look across views and one place to change the visual language.
- **Negative**: Requires familiarity with Material 3 token names and Sass mixin APIs.

---

## ADR 007: Standalone Components, Zoneless Change Detection and Lazy Routes

### Status
Accepted

### Context
Angular 22 favors standalone components, signals and zoneless change detection, and the initial bundle has a performance budget.

### Decision
- All components are standalone and declare their dependencies in `@Component.imports`.
- Change detection is zoneless with the default `OnPush` strategy.
- The shell layout and every context routes file are lazy loaded with `loadComponent` / `loadChildren`.
- Router features: component input binding, view transitions and anchor scrolling.

### Consequences
- **Positive**: Small initial bundle (about 360 kB), explicit dependencies and simpler testing.
- **Negative**: Each component must list its imports explicitly.

---

## ADR 008: Internationalization with `@ngx-translate` and English as the Default Language

### Status
Accepted

### Context
The course requires i18n in every product, with English (`en_US`) and Latin American Spanish as base languages and **English as the default** language of the interface.

### Decision
Use `@ngx-translate/core` and `@ngx-translate/http-loader` with `public/i18n/en.json` and `public/i18n/es.json`:
- `environment.defaultLanguage` is `en`, and English is also the fallback language.
- `LanguageStore` restores the language the user chose before and persists new choices.
- Templates use the `translate` pipe; no UI string is hardcoded.

### Consequences
- **Positive**: Runtime language switching without reloads and centralized translation keys.
- **Negative**: Translation files load asynchronously, so the first render waits for them.

---

## ADR 009: Authentication, Role-Based Access and Per-Tab Sessions

### Status
Accepted

### Context
Every module of the administrative frontend must be protected, and each role (administrator, operator, supplier) may only open the modules it is granted.

### Decision
- `authGuard` and `guestGuard` protect the routes; the requested URL is kept and restored after sign in.
- `moduleGuard` redirects to the dashboard when a role opens a module it cannot access, and the sidebar only lists the modules of the role (`Role.accessTo`).
- The session identifier lives in `sessionStorage`, so it ends with the browser tab.
- Sign up creates either a minimarket administrator or a supplier account.

### Consequences
- **Positive**: Least-privilege navigation and no leaked sessions between tabs.
- **Negative**: Credentials are demonstration-only until the identity backend exists; a real service must never expose passwords to the browser.

---

## ADR 010: Vitest for Unit Testing

### Status
Accepted

### Context
The domain model, the stores and the gateways need fast, deterministic unit tests that run without a browser.

### Decision
Use Vitest through the Angular `unit-test` builder (`ng test`) with `jsdom`:
- Domain entities and value objects are tested in isolation.
- Stores are tested with `TestBed`, a frozen `Clock` and fake timers for the simulated gateway latency.
- The `FakeApi` client is tested with `HttpTestingController`.

### Consequences
- **Positive**: Fast feedback and the same API as modern test runners.
- **Negative**: Component tests need jsdom, which does not implement every browser feature.

---

## ADR 011: Firebase Hosting with Separate Sites for the Landing Page and the Application

### Status
Accepted

### Context
The solution has two digital products with independent release cycles: the landing page (static HTML, CSS and JavaScript) and this Angular application.

### Decision
Deploy both to Firebase Hosting in the same project (`organik-d6e58`) as two sites:
- The landing page on `organik-d6e58`, and this application on `organik-app-d6e58`.
- The application serves `index.html` for every route (single-page application rewrite), caches hashed assets for a year and sends `X-Robots-Tag: noindex`.
- The landing page links to the application and the application links back to the landing page (`environment.landingUrl`).

### Consequences
- **Positive**: Free hosting, independent deployments and clear separation of the public and private areas.
- **Negative**: The two products must agree on their public addresses.
