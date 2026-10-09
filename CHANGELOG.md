# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-10-07

### Added

- Inventory: edit products and lots, register waste and offers, filters by category and expiration, lots of a product with their supplier, and the history of movements with actor and date.
- Products: initial quantity, expiration and location when a product is created, and a product list with edit.
- Conservation: reading history with source (sensor or manual), date range and zones without readings.
- Suppliers: product catalog (publish, update, consult read-only) and catalog section in the supplier detail.
- Procurements: orders created by suppliers from their catalog, accepted or rejected by the administrator of the destination minimarket with actor, date and reason; accepted orders add their lots to the inventory once.
- Dashboard: supplier variant and attention figures for the administrator.
- IAM: users linked to a minimarket or a supplier, a supplier demo account, `manageGuard` for forms, and the plan chosen on the landing saved at sign-up.

### Changed

- Requests are scoped by user and read-only for suppliers.
- The reception of shipments (complete or partial) was replaced by the accept or reject decision of an order.

### Added
- **Legal Footer**: `AppFooter` component with the copyright and the links to the terms and conditions and the privacy policy of the landing page, shown in the application shell and on the sign-in and sign-up screens.

## [1.3.1] - 2026-10-07

### Added
- **Architectural Decision Records**: Added `docs/adrs.md` with eleven ADRs covering DDD with one folder per bounded context, signal-based stores, the Assembler pattern, the Shared Kernel value objects, the fake REST API, Material 3 theming, zoneless standalone components, internationalization, authentication and role-based access, Vitest and Firebase Hosting.
- **License**: Added `LICENSE.md` with the MIT license.
- **Contributing Guidelines**: Added `CONTRIBUTING.md` covering DDD layers, OOP rules, Git Flow, Conventional Commits, SemVer, TypeScript and Angular standards and the pull request checklist.

### Changed
- **Project Documentation**: Rewrote `README.md` in English following the structure of the reference repository: overview, features, current scope, architecture overview, project structure tree, technologies, documentation index, fake API, scripts and deployment.
- **Requirement Specifications**: Rewrote `docs/user-stories.md` as functional requirement artifacts (twenty-five user stories grouped by bounded context, with Given-When-Then acceptance criteria and the Requirement Traceability Matrix mapped to the current implementation elements).
- **Changelog**: Reformatted this file in English with descriptive entries.

## [1.3.0] - 2026-10-07

### Added
- **Sign Up**: `/register` screen (name, e-mail, account type, company, password and accepted terms) that creates an account and signs it in. The login links to it, and the landing page sends each segment to it with `?role=administrator` or `?role=supplier`.
- **Role-Based Navigation**: The sidebar only lists the modules the role can open, and `moduleGuard` redirects to the dashboard when a module is not allowed.
- **Fake REST API on Beeceptor**: Gateways for users (sign in and sign up), products and inventory call `/api/v1/users`, `/api/v1/products` and `/api/v1/inventory`, with a local fallback, a merge with the local seed and a five-minute cache. The routes are documented in `docs/openapi-fake-api.yaml`.
- **Firebase Hosting**: `firebase.json` and `.firebaserc` with the single-page rewrite, cache headers and the production address of the landing page.

### Changed
- **Bounded Contexts**: Organized the source in the twelve bounded contexts of the project report, one folder each: `catalog` became `products`, `procurement` was split into `requisition` and `procurements`, the profiles and settings moved to `profiles`, and `communication` was created for alerts and notifications.
- **Default Language**: English is now the default interface language; Spanish stays one click away and is remembered once chosen.

### Removed
- **Demo Account Box**: Removed the demo account box of the login screen because the product is not offered as a demo.

## [1.2.0] - 2026-10-02

### Added
- **Sign In**: Login screen, auth guard on every module, per-tab session stored in `sessionStorage` and sign out.
- **Landing Page Connection**: "Iniciar sesión" on the landing page opens `/login`, and the login links back to the site.
- **Smooth Motion**: Soft staggered entrances with blur, cross-fade between pages (View Transitions), table rows that settle one by one and count-up key figures.

### Changed
- **Layout**: Content fills the available width with a consistent grid across every view.
- **Typography**: The interface typeface is Geist (like the landing page) and every card heading uses the Fraunces display serif.
- **Prototype Entry Screen**: Moved to `/prototype`; `/` redirects to the dashboard.
- **Charts and Forms**: Chart bars spread across the card and form controls share one size.

## [1.1.0] - 2026-10-02

### Changed
- **Green Palette**: Redesigned the interface with a forest sidebar, one action green, a lime accent and mint-tinted neutrals.
- **Typography**: Figtree for the interface and Fraunces for page titles and key figures.
- **Icons and Brand**: Replaced eyebrows with icon tiles, added icons to KPI cards, categories and shortcuts, and drew a leaf brand mark.
- **Alert Trend Chart**: Monochrome green chart that highlights spikes in forest green.
- **Surfaces and Motion**: Tables, buttons and cards use tinted depth, hover states and a single entrance motion that respects reduced motion; text selection, caret, focus ring, scrollbars and tabular numerals follow the theme.

## [1.0.0] - 2026-10-02

### Added
- **Project Configuration**:
  - Angular 22 with an Angular Material theme using the OrganiK palette.
  - NGX-Translate with Spanish and English resources.
  - Development and production environments.
- **Shared Kernel**:
  - Value objects `CalendarDate`, `DateTime`, `EmailAddress`, `Money`, `Percentage` and `Quantity`, and the `Clock` port.
  - Application shell with sidebar, header, global search and language switcher.
  - Reusable components: module banner, form card, status badge and KPI card.
  - Prototype entry screen with the interaction map.
- **Catalog Context** (renamed to Products in 1.3.0): Product categories and the add product form.
- **Inventory Context**: Stock lots with an expiration policy, a filterable inventory list and the register stock form.
- **Suppliers Context**: Supplier directory, profile, registration form and recommendations by alert situation.
- **Procurement Context** (split into Requisition and Procurements in 1.3.0): Supply requests, shipment orders and the reception flow with full and partial reception.
- **Conservation Context**: Storage zones with conservation ranges, sensor readings and derived alerts.
- **Analytics Context**: Operational indicators, alert trend chart, active alerts and a dependency-free PDF report.
- **Dashboard Context**: Operational health, key figures, recent activity and module shortcuts.
- **IAM Context**: Users, role permissions, access profiles and the signed-in session.
- **Settings**: Interface language and expiration thresholds remembered in the browser.
- **Testing**: Unit tests for the domain model and the application stores.
- **Documentation**: User stories with the requirement traceability matrix and the PlantUML class diagram.

### Changed
- **Performance Budget**: Lazy loaded the application shell to keep the initial bundle under the budget.
