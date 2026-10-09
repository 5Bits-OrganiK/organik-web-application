# OrganiK Web Application User Stories

## Overview
This document presents the functional requirement user stories for the OrganiK web application. The requirements are organized around the bounded contexts of the solution: **Identity and Access Management (IAM)**, **Profiles**, **Dashboard**, **Inventory**, **Products**, **Requisition**, **Procurements**, **Suppliers**, **Conservation**, **Analytics**, **Communication** and **Shared Capabilities**.

Roles involved:
- **Administrator**: Manages the operation of the minimarket, its users, settings and reports.
- **Operator**: Runs the daily operation in the store: stock, receptions and conservation.
- **Supplier**: Follows the requests and shipments addressed to their company.
- **Visitor**: Unauthenticated person who can only sign in or sign up.

The identifiers in this document (US001, US002, ...) are specific to this repository; the stories of the project report are developed in chapter 3 of the report.

---

## Requirement Traceability Matrix (RTM)

| User Story ID | Title                                      | Bounded Context | Related Implementation Elements                                                                                      |
|---------------|--------------------------------------------|-----------------|----------------------------------------------------------------------------------------------------------------------|
| **US001**     | Sign In and Sign Out                       | IAM             | `Login`, `AuthStore`, `IamApi`, `authGuard`, `guestGuard`                                                            |
| **US002**     | Sign Up as Minimarket or Supplier          | IAM             | `Register`, `Registration`, `RegistrationError`, `AuthStore`, `IamApi`                                               |
| **US003**     | Role-Based Access to Modules               | IAM             | `Role`, `SessionStore`, `moduleGuard`, `Sidebar`                                                                     |
| **US004**     | Manage Users and Roles                     | IAM             | `User`, `UsersStore`, `UserAssembler`, `UserList`, `UserForm`                                                        |
| **US005**     | Resend Pending Invitations                 | IAM             | `User.canResendInvitation`, `UsersStore`, `UserList`                                                                 |
| **US006**     | Review Access Profiles                     | Profiles        | `ProfileList`, `Role`, `SessionStore`                                                                                |
| **US007**     | Configure Thresholds and Language          | Profiles        | `Settings`, `SettingsStore`, `ExpirationPolicy`                                                                      |
| **US008**     | Operational Dashboard                      | Dashboard       | `Dashboard`, `DashboardStore`, `KpiCard`                                                                             |
| **US009**     | View Inventory with Expiration Status      | Inventory       | `InventoryList`, `InventoryStore`, `StockLot`, `ExpirationPolicy`                                                    |
| **US010**     | Register Received Stock                    | Inventory       | `StockForm`, `InventoryStore`, `StockLotAssembler`, `InventoryApi`                                                   |
| **US011**     | Browse the Catalog and Add Products        | Products        | `ProductCategories`, `ProductForm`, `ProductsStore`, `Product`, `ProductAssembler`, `ProductsApi`                    |
| **US012**     | Send Supply Requests to Suppliers          | Requisition     | `RequestList`, `RequestForm`, `RequisitionStore`, `SupplyRequest`, `SupplyRequestAssembler`                          |
| **US013**     | Create, Accept and Reject Supplier Orders  | Procurements    | `ShipmentList`, `OrderForm`, `OrderDetail`, `ProcurementsStore`, `ShipmentOrder`, `OrderDecision`                    |
| **US014**     | Manage the Supplier Directory              | Suppliers       | `SupplierList`, `SupplierDetail`, `SupplierForm`, `SuppliersStore`, `Supplier`                                       |
| **US015**     | Get Suggested Suppliers for Alerts         | Suppliers       | `SuggestedSuppliers`, `SupplierSuggestionService`                                                                    |
| **US016**     | Monitor Temperature and Humidity           | Conservation    | `ConservationMonitoring`, `ConservationStore`, `StorageZone`, `ConservationRange`                                    |
| **US017**     | Prioritized Conservation Alerts            | Conservation    | `ConservationAlerts`, `ConservationAlertService`, `ConservationAlert`                                                |
| **US018**     | Analytics and Alert Trend                  | Analytics       | `AnalyticsOverview`, `AnalyticsStore`, `OperationalIndicators`, `AlertTrend`, `AlertTrendChart`                      |
| **US019**     | Generate an Operational Report             | Analytics       | `ReportForm`, `ReportComposer`, `ReportRequest`, `PdfDocumentBuilder`, `ReportExporter`                              |
| **US020**     | Review Active Alerts                       | Communication   | `AlertsOverview`, `AlertsStore`, `AlertItem`                                                                         |
| **US021**     | Switch Application Language                | Shared          | `LanguageSwitcher`, `LanguageStore`, `TranslateService`, `public/i18n/en.json`, `public/i18n/es.json`               |
| **US022**     | Navigation and Application Shell           | Shared          | `Layout`, `Sidebar`, `AppHeader`, `AppFooter`, `GlobalSearch`, `PageNotFound`, `app.routes.ts`                                    |
| **US023**     | Graceful Error Handling and User Feedback  | Shared          | `DomainError`, `Notifier`, `FormCard`, validators, `StatusBadge`                                                     |
| **US024**     | Use the Fake REST API with a Local Fallback | Shared         | `FakeApi`, `FAKE_API_ENABLED`, `mergeByKey`, `environment.api`, `docs/openapi-fake-api.yaml`                         |
| **US025**     | Prototype Entry Screen                     | Shared          | `PrototypeFlow`, `InteractionLink`                                                                                   |
| **US026**     | Update Products and Lots                   | Products, Inventory | `ProductForm` (edit), `LotForm`, `ProductsStore.updateProduct`, `InventoryStore.updateLot`, `InventoryEvent`          |
| **US027**     | Register Waste and Offers                  | Inventory       | `WasteForm`, `OfferForm`, `StockLot.discard`, `Offer`, `InventoryStore`                                           |
| **US028**     | Consult Lots and the Inventory History     | Inventory       | `ProductLots`, `InventoryHistory`, `InventoryEventItem`, filters of `InventoryList`                                  |
| **US029**     | Publish and Consult the Supplier Catalog   | Suppliers       | `CatalogList`, `OfferingForm`, `OfferedProduct`, `SuppliersStore`, `manageGuard`                                  |
| **US030**     | Supplier and Administrator Dashboards      | Dashboard       | `Dashboard`, `DashboardStore.supplierSummary`, `DashboardStore.attention`                                          |
| **US031**     | Reading History with its Source            | Conservation    | `ConservationMonitoring`, `ConservationStore.history`, `StorageReading.source`                                       |
| **US032**     | Scoped and Read-Only Requests              | Requisition     | `RequisitionStore`, `RequestList`, `manageGuard`, `SupplyRequest.minimarketId`                                      |

---

## US001: Sign In and Sign Out
**Title:** Sign In and Sign Out  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As a registered user, I want to sign in with my e-mail and password so that only authorized people use the system, and sign out when I finish._

**Acceptance Criteria:**
- **AC1.1 – Successful Sign In:** Given valid credentials of an accepted user, when the user signs in, then the system opens an active session and shows the requested page or the dashboard.
- **AC1.2 – Generic Error:** Given a wrong password or an unknown e-mail, when the user signs in, then the system shows the same generic error so nobody can discover which e-mails exist.
- **AC1.3 – Pending Invitation:** Given a user who has not accepted the invitation, when the user signs in, then the system refuses the access and explains that the invitation is pending.
- **AC1.4 – Protected Routes:** Given a visitor without a session, when the visitor opens any module, then the system redirects to the sign-in screen and returns to the requested page after authentication.
- **AC1.5 – Sign Out and Session Scope:** Given an active session, when the user signs out or closes the browser tab, then the session ends and the protected modules are no longer accessible.

---

## US002: Sign Up as Minimarket or Supplier
**Title:** Sign Up as Minimarket or Supplier  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As a visitor, I want to create an account as a minimarket owner or as a supplier so that I can start using the system._

**Acceptance Criteria:**
- **AC2.1 – Account Type:** Given the sign-up screen, when the visitor chooses "I run a minimarket" or "I am a supplier" (or arrives from the landing page with that choice), then the account is created with the matching role and the company field is labeled accordingly.
- **AC2.2 – Validation:** Given incomplete or invalid data (name, e-mail, company, password of at least 8 characters, accepted terms), when the visitor submits the form, then the system marks each invalid field and does not create the account.
- **AC2.3 – Unique E-mail:** Given an e-mail that already has an account, when the visitor submits the form, then the system refuses the registration and offers to sign in instead.
- **AC2.4 – Successful Registration:** Given valid data, when the visitor confirms, then the system creates the account, signs the person in and opens the dashboard.

---

## US003: Role-Based Access to Modules
**Title:** Role-Based Access to Modules  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As a user, I want to see only the modules my role can use so that I do not get lost in features that are not mine._

**Acceptance Criteria:**
- **AC3.1 – Role Navigation:** Given a signed-in user, when the sidebar is displayed, then it lists only the modules the role can manage or view (for example a supplier sees the dashboard, requests, shipment orders and suppliers).
- **AC3.2 – Direct Access:** Given a user who opens the address of a module the role cannot access, when the page is requested, then the system redirects to the dashboard.

---

## US004: Manage Users and Roles
**Title:** Manage Users and Roles  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As an administrator, I want to create and edit users and assign them a role so that each person only uses what they need._

**Acceptance Criteria:**
- **AC4.1 – View Users:** Given existing users, when the administrator opens the users list, then every user is shown with e-mail, role, assigned module and invitation status.
- **AC4.2 – Create or Edit a User:** Given valid data, when the administrator saves the form, then the user is created or updated.
- **AC4.3 – Role Constraints:** Given a role and an assigned module, when the role cannot access that module, then the system refuses the combination.
- **AC4.4 – Unique E-mail:** Given an e-mail that belongs to someone else, when the administrator saves, then the system refuses the change.

---

## US005: Resend Pending Invitations
**Title:** Resend Pending Invitations  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As an administrator, I want to resend the invitation to people who have not joined yet so that they can start using the system._

**Acceptance Criteria:**
- **AC5.1 – Pending Only:** Given a user whose invitation is pending, when the administrator asks to resend it, then the system sends it again.
- **AC5.2 – Accepted Users:** Given a user who already accepted, when the administrator views the list, then no resend action is offered for that user.

---

## US006: Review Access Profiles
**Title:** Review Access Profiles  
**Context:** Profiles  
**Description:**  
_As an administrator, I want to review what each role can do so that I know which access to grant._

**Acceptance Criteria:**
- **AC6.1 – My Profile:** Given a signed-in user, when the profiles screen is displayed, then the person sees their own name, role and e-mail.
- **AC6.2 – Role Profiles:** Given the roles of the system, when the screen is displayed, then administrator, operator and supplier list the modules they manage and the modules they can only view.

---

## US007: Configure Thresholds and Language
**Title:** Configure Thresholds and Language  
**Context:** Profiles  
**Description:**  
_As an administrator, I want to configure the expiration thresholds and the language so that the application matches how the minimarket works._

**Acceptance Criteria:**
- **AC7.1 – Valid Thresholds:** Given the days for the critical and the at-risk states, when the administrator saves, then the system accepts them only when the at-risk threshold is above the critical one.
- **AC7.2 – Remembered Settings:** Given saved settings, when the administrator comes back to the application, then the thresholds and the language are restored.

---

## US008: Operational Dashboard
**Title:** Operational Dashboard  
**Context:** Dashboard  
**Description:**  
_As an administrator, I want a dashboard so that I can see how healthy the operation is at a glance._

**Acceptance Criteria:**
- **AC8.1 – Key Figures:** Given the data of the other contexts, when the dashboard opens, then it shows the operational health, the units available, the requests created and the shipments pending reception.
- **AC8.2 – Recent Activity:** Given recent events, when the dashboard opens, then it lists the lot closest to expiring, the last accepted request and a healthy sensor.
- **AC8.3 – Shortcuts:** Given the dashboard, when the user selects a shortcut, then the system opens the corresponding module.

---

## US009: View Inventory with Expiration Status
**Title:** View Inventory with Expiration Status  
**Context:** Inventory  
**Description:**  
_As an administrator, I want to see the stock lots with their expiration status so that I can act before they expire._

**Acceptance Criteria:**
- **AC9.1 – Status per Lot:** Given the stock lots, when the inventory list opens, then each lot is shown as normal, at risk or critical according to the configured thresholds.
- **AC9.2 – Filters:** Given the list, when the user searches by product or lot, or filters by status, then only the matching lots are displayed.

---

## US010: Register Received Stock
**Title:** Register Received Stock  
**Context:** Inventory  
**Description:**  
_As an operator, I want to register the stock I receive so that the inventory stays accurate._

**Acceptance Criteria:**
- **AC10.1 – Required Data:** Given the register stock form, when the operator submits, then product, lot code, quantity, expiration date and location are required.
- **AC10.2 – Domain Rules:** Given a duplicated lot code or an expired date, when the operator submits, then the system refuses the lot.
- **AC10.3 – Updated Inventory:** Given a valid lot, when the operator confirms, then the lot appears in the inventory list and a confirmation is shown.

---

## US011: Browse the Catalog and Add Products
**Title:** Browse the Catalog and Add Products  
**Context:** Products  
**Description:**  
_As an administrator, I want to browse the product catalog and add products so that I can offer new organic items._

**Acceptance Criteria:**
- **AC11.1 – Categories:** Given the catalog, when the products screen opens, then the product categories are displayed as cards with an accent color.
- **AC11.2 – Add a Product:** Given a name, category, supplier, unit, minimum stock and storage condition, when the administrator saves, then the product receives the next SKU and is added to the catalog.
- **AC11.3 – Persistence:** Given the fake REST API is available, when a product is created, then it is also stored through the API.

---

## US012: Send Supply Requests to Suppliers
**Title:** Send Supply Requests to Suppliers  
**Context:** Requisition  
**Description:**  
_As an administrator, I want to share a replenishment need with a supplier so that the supplier can respond with an order._

**Acceptance Criteria:**
- **AC12.1 – View Requests:** Given existing requests, when the requests list opens, then each one shows product, supplier, quantity, reason and status.
- **AC12.2 – Create a Request:** Given a product, supplier, quantity, reason, required date and priority, when the administrator submits, then the request is created as pending with the next identifier.
- **AC12.3 – Valid Dates:** Given a required date in the past, when the administrator submits, then the system refuses the request.
- **AC12.4 – Not an Order:** Given a request, when it is created or accepted, then it never modifies the inventory.

---

## US013: Create, Accept and Reject Supplier Orders
**Title:** Create, Accept and Reject Supplier Orders
**Context:** Procurements
**Description:**
_As a supplier, I want to create an order for a linked minimarket from my catalog, and as the minimarket administrator, I want to accept or reject it so that the inventory only changes when I agree._

**Acceptance Criteria:**
- **AC13.1 – Scoped Lists:** Given the orders, when the list opens, then a supplier sees only its own orders and the people of a minimarket see the ones addressed to it, each with participants, products, date and status (pending, accepted or rejected).
- **AC13.2 – Create a Pending Order:** Given a supplier, when it creates an order for a linked minimarket with products of its own catalog, then the order is saved as pending and neither the inventory nor the catalog changes.
- **AC13.3 – Availability Check:** Given a line, when the quantity is greater than the availability published by the supplier, then the system refuses the order.
- **AC13.4 – Accept:** Given a pending order, when the administrator of the destination minimarket accepts it, then the order keeps who accepted it and when, and its lots enter the inventory exactly once.
- **AC13.5 – Reject with a Reason:** Given a pending order, when the administrator rejects it, then a reason is required, it is kept with the actor and the date, and the inventory does not change.
- **AC13.6 – Only the Destination Administrator Decides:** Given an order, when a supplier or an operator tries to answer it, then the system refuses and the buttons are not shown.
- **AC13.7 – Detail:** Given an order, when it is opened, then the detail shows the participants, the lines with their lots, the status and the decision.

---

## US014: Manage the Supplier Directory
**Title:** Manage the Supplier Directory  
**Context:** Suppliers  
**Description:**  
_As an administrator, I want a supplier directory so that I can find, review and register suppliers._

**Acceptance Criteria:**
- **AC14.1 – Directory:** Given the suppliers, when the directory opens, then each one is shown with its name, specialty and status.
- **AC14.2 – Supplier Profile:** Given a supplier, when the administrator opens it, then the contact data, certification and categories are displayed.
- **AC14.3 – Register a Supplier:** Given a valid e-mail and phone, when the administrator saves a new supplier, then it is added to the directory.

---

## US015: Get Suggested Suppliers for Alerts
**Title:** Get Suggested Suppliers for Alerts  
**Context:** Suppliers  
**Description:**  
_As an administrator, I want suggested suppliers for the active alerts so that I can resolve them quickly._

**Acceptance Criteria:**
- **AC15.1 – Suggestions by Situation:** Given the active alerts, when the suggestions screen opens, then suppliers are grouped as urgent restock, fresh products and critical preservation.
- **AC15.2 – Request from a Suggestion:** Given a suggested supplier, when the administrator chooses to request, then the system opens the new request form with that supplier preselected.

---

## US016: Monitor Temperature and Humidity
**Title:** Monitor Temperature and Humidity  
**Context:** Conservation  
**Description:**  
_As an administrator, I want to monitor the storage zones so that I detect conditions outside their range._

**Acceptance Criteria:**
- **AC16.1 – Last Reading:** Given the storage zones, when the monitoring screen opens, then each zone shows its last temperature and humidity reading.
- **AC16.2 – Status:** Given a reading and the range of its zone, when it is evaluated, then the zone is shown as normal, warning or critical.

---

## US017: Prioritized Conservation Alerts
**Title:** Prioritized Conservation Alerts  
**Context:** Conservation  
**Description:**  
_As an administrator, I want a prioritized list of alerts so that I know where the problem comes from._

**Acceptance Criteria:**
- **AC17.1 – Alert Derivation:** Given sensor readings outside their range, when the alerts are computed, then each one is listed with its zone, product and cause.
- **AC17.2 – Priority:** Given several alerts, when the list is displayed, then the most urgent ones come first.

---

## US018: Analytics and Alert Trend
**Title:** Analytics and Alert Trend  
**Context:** Analytics  
**Description:**  
_As an administrator, I want indicators and the trend of alerts so that I can spot abnormal growth._

**Acceptance Criteria:**
- **AC18.1 – Indicators:** Given the operational data, when the analytics screen opens, then it shows the avoided loss, the products at risk and the accepted requests.
- **AC18.2 – Alert Trend:** Given the alerts raised per week, when the chart is displayed, then weeks with a sharp growth are highlighted.

---

## US019: Generate an Operational Report
**Title:** Generate an Operational Report  
**Context:** Analytics  
**Description:**  
_As an administrator, I want to generate a report so that I can share the operational status._

**Acceptance Criteria:**
- **AC19.1 – Report Options:** Given the report form, when the administrator chooses a valid period and the indicators to include, then the system accepts the request.
- **AC19.2 – Invalid Periods:** Given an end date before the start date or no indicator selected, when the administrator submits, then the system refuses the request.
- **AC19.3 – PDF Download:** Given a valid request, when the administrator confirms, then a PDF file with the selected indicators is downloaded.

---

## US020: Review Active Alerts
**Title:** Review Active Alerts  
**Context:** Communication  
**Description:**  
_As an administrator, I want one place with the active alerts, the key figures and the trend so that I know what needs attention first._

**Acceptance Criteria:**
- **AC20.1 – Alerts Overview:** Given the active alerts, when the alerts screen opens, then it shows the key figures, the alert trend and the list of alerts.
- **AC20.2 – Alert Details:** Given an alert, when it is displayed, then it states its type, its severity and the subjects (zones or products) it refers to.

---

## US021: Switch Application Language
**Title:** Switch Application Language  
**Context:** Shared  
**Description:**  
_As a user, I want to switch between English and Spanish so that the interface is displayed in my preferred language._

**Acceptance Criteria:**
- **AC21.1 – Default Language:** Given a user without a saved preference, when the application opens, then the interface is displayed in English.
- **AC21.2 – Language Selection:** Given a supported language, when the user selects it, then every label, heading, message and option is displayed in that language without reloading the page.
- **AC21.3 – Remembered Choice:** Given a chosen language, when the user comes back, then the application restores it.

---

## US022: Navigation and Application Shell
**Title:** Navigation and Application Shell  
**Context:** Shared  
**Description:**  
_As a user, I want clear navigation across the modules so that I can reach any feature quickly._

**Acceptance Criteria:**
- **AC22.1 – Module Navigation:** Given the sidebar, when the user selects a module, then the corresponding view is displayed and the active module is highlighted.
- **AC22.2 – Global Search:** Given the header search, when the user types a product, supplier or order, then matching results are offered.
- **AC22.3 – Unknown Pages:** Given an address that does not exist, when the user opens it, then the system shows a not-found page with a way back to the dashboard.
- **AC22.4 – Page Titles:** Given any view, when it is displayed, then the browser tab shows the title of the module in the active language.
- **AC22.5 – Legal Footer:** Given any screen of the application (including the sign-in and sign-up screens), when the user reaches the footer, then the links to the terms and conditions and to the privacy policy of the landing page are available.

---

## US023: Graceful Error Handling and User Feedback
**Title:** Graceful Error Handling and User Feedback  
**Context:** Shared  
**Description:**  
_As a user, I want clear feedback when an operation fails or an input is invalid so that I understand what happened and how to proceed._

**Acceptance Criteria:**
- **AC23.1 – Validation Feedback:** Given invalid or missing input, when the form is submitted, then each field shows a specific, actionable message.
- **AC23.2 – Domain Rules:** Given an operation that violates a business rule, when it is attempted, then the system refuses it with a user-friendly message and no internal details.
- **AC23.3 – Confirmation:** Given a completed action, when it succeeds, then a non-blocking confirmation is displayed.

---

## US024: Use the Fake REST API with a Local Fallback
**Title:** Use the Fake REST API with a Local Fallback  
**Context:** Shared  
**Description:**  
_As a team member, I want the application to talk to a fake REST API while the backend does not exist so that the frontend can be deployed and demonstrated._

**Acceptance Criteria:**
- **AC24.1 – Remote Resources:** Given the fake API is available, when the application loads users, products or inventory, then the data is read from and created through the API routes.
- **AC24.2 – Fallback:** Given the API fails or answers that its daily quota is exhausted, when the application needs data, then it keeps working with its in-memory data.
- **AC24.3 – Quota Savings:** Given an answer was obtained recently, when the application needs the same data again, then the stored answer is reused instead of sending a new request.
- **AC24.4 – Documentation:** Given the three routes, when the team documents the services, then they are described with OpenAPI in `docs/openapi-fake-api.yaml`.

---

## US025: Prototype Entry Screen
**Title:** Prototype Entry Screen  
**Context:** Shared  
**Description:**  
_As an evaluator, I want an entry screen with the interaction map so that I can walk through the prototype._

**Acceptance Criteria:**
- **AC25.1 – Interaction Map:** Given the prototype screen, when it opens, then it links every key interaction of the application.
- **AC25.2 – Recommended Walkthrough:** Given the screen, when the evaluator follows it, then the walkthrough visits the modules in a suggested order.

---

## US026: Update Products and Lots
**Title:** Update Products and Lots
**Context:** Products and Inventory
**Description:**
_As a user who manages the inventory, I want to correct the data of a product or of a lot so that the stock is reliable and every change is traceable._

**Acceptance Criteria:**
- **AC26.1 – Initial Quantity:** Given the new product form, when an initial quantity, expiration date and location are given, then a lot is created with them.
- **AC26.2 – Edit a Product:** Given a product, when its data is edited, then the change is saved and recorded in the inventory history with the actor and the date.
- **AC26.3 – Edit a Lot:** Given a lot, when its quantity, expiration or location is edited, then the change is saved and recorded in the history.
- **AC26.4 – Negative Refused:** Given a quantity, when it is negative, then the system refuses it.

---

## US027: Register Waste and Offers
**Title:** Register Waste and Offers
**Context:** Inventory
**Description:**
_As a user who manages the inventory, I want to register the units lost and the offers of products about to expire so that losses are explained and stock is sold in time._

**Acceptance Criteria:**
- **AC27.1 – Waste:** Given a lot, when waste is registered with a cause and a quantity not greater than the stock, then the lot decreases and the movement is recorded.
- **AC27.2 – Waste Over Stock Refused:** Given a lot, when the waste is greater than its units, then the system refuses it.
- **AC27.3 – Offers:** Given a product, when an offer with a percentage and a period is registered, then it is listed and shown as active only inside its dates.

---

## US028: Consult Lots and the Inventory History
**Title:** Consult Lots and the Inventory History
**Context:** Inventory
**Description:**
_As a user, I want to filter the inventory, see the lots of a product with their supplier and read the history of movements so that I understand what happened to the stock._

**Acceptance Criteria:**
- **AC28.1 – Filters:** Given the inventory, when a category or an expiration status is chosen, then only the matching rows remain, and a reset clears the filters.
- **AC28.2 – Lots of a Product:** Given a product, when its lots are opened, then each lot shows quantity, expiration and supplier of origin, or a message when there are none.
- **AC28.3 – History:** Given the movements, when the history opens, then every registration, update, waste, offer and received order shows the date, the actor and the detail.

---

## US029: Publish and Consult the Supplier Catalog
**Title:** Publish and Consult the Supplier Catalog
**Context:** Suppliers
**Description:**
_As a supplier, I want to publish the products I offer with their lot and availability so that the minimarkets know what I can deliver._

**Acceptance Criteria:**
- **AC29.1 – Publish:** Given a supplier, when it publishes a product with lot, availability and expiration, then the product appears in its catalog.
- **AC29.2 – Update:** Given an entry of its catalog, when the supplier changes the lot or the availability, then the update date is stored; another supplier cannot change it.
- **AC29.3 – Read-Only for Minimarkets:** Given the catalogs, when a minimarket user consults them, then the availability is visible but no form is available.
- **AC29.4 – Supplier Detail:** Given a supplier of the directory, when its detail opens, then its catalog is listed.

---

## US030: Supplier and Administrator Dashboards
**Title:** Supplier and Administrator Dashboards
**Context:** Dashboard
**Description:**
_As a user, I want a dashboard with the figures that matter for my role so that I know what to do first._

**Acceptance Criteria:**
- **AC30.1 – Supplier Dashboard:** Given a supplier, when the dashboard opens, then it shows the needs shared by the minimarkets, the products it offers and its pending, accepted and rejected orders.
- **AC30.2 – Administrator Attention:** Given the administrator of a minimarket, when the dashboard opens, then it shows the expiring lots, the products below the minimum and the orders waiting for an answer.

---

## US031: Reading History with its Source
**Title:** Reading History with its Source
**Context:** Conservation
**Description:**
_As an operator, I want the history of temperature and humidity readings so that I can review how each zone behaved and where each reading came from._

**Acceptance Criteria:**
- **AC31.1 – History:** Given the readings, when the history is shown, then each reading has zone, value, date and source (sensor or manual).
- **AC31.2 – Date Range:** Given a range of dates, when it is applied, then only the readings inside it are listed.
- **AC31.3 – Zones without Readings:** Given a zone with no readings, when the monitoring opens, then a message says so.

---

## US032: Scoped and Read-Only Requests
**Title:** Scoped and Read-Only Requests
**Context:** Requisition
**Description:**
_As a supplier, I want to consult the needs addressed to me without being able to change them so that I can answer with an order._

**Acceptance Criteria:**
- **AC32.1 – Scope:** Given the requests, when a supplier opens the list, then it sees only the ones addressed to it, and a minimarket user sees its own.
- **AC32.2 – Read-Only:** Given a supplier, when it opens the requests, then there is no button to create one and the new-request address redirects to the list.
