/** Modules of the administrative frontend a role can be granted access to. */
export type ModuleKey =
  | 'dashboard'
  | 'inventory'
  | 'products'
  | 'requests'
  | 'shipments'
  | 'suppliers'
  | 'catalog'
  | 'conservation'
  | 'analytics'
  | 'alerts'
  | 'users'
  | 'settings';

/** Every module, in navigation order. */
export const MODULE_KEYS: readonly ModuleKey[] = [
  'dashboard',
  'inventory',
  'products',
  'requests',
  'shipments',
  'suppliers',
  'catalog',
  'conservation',
  'analytics',
  'alerts',
  'users',
  'settings'
];

/** Identifier of a role of the minimarket. */
export type RoleId = 'administrator' | 'operator' | 'supplier';

/**
 * What a role can do in a module: `view` is read-only and `manage` also allows changes.
 * A module that is not granted is not accessible at all (`none`).
 */
export type AccessLevel = 'manage' | 'view' | 'none';

/**
 * Represents a role and the access it grants to each module.
 */
export class Role {
  /**
   * @param id - Identifier of the role.
   * @param grants - Access granted per module; modules left out are not accessible.
   */
  constructor(
    readonly id: RoleId,
    private readonly grants: Readonly<Partial<Record<ModuleKey, 'manage' | 'view'>>>
  ) {}

  /**
   * Access the role has to a module.
   *
   * @param module - Module to check.
   */
  accessTo(module: ModuleKey): AccessLevel {
    return this.grants[module] ?? 'none';
  }

  /**
   * Modules the role can use at the given level, in navigation order.
   *
   * @param level - `manage` or `view`.
   */
  modulesWith(level: 'manage' | 'view'): ModuleKey[] {
    return MODULE_KEYS.filter(module => this.accessTo(module) === level);
  }
}

/**
 * Roles of the minimarket and their permissions.
 *
 * - Administrator: manages the whole operation, including users and settings.
 * - Operator: runs the daily operation in the store (stock, receptions, conservation).
 * - Supplier: keeps their catalog, follows the needs of the minimarkets and creates orders; the
 *   minimarket is the only one that decides an order.
 */
export const ROLES: readonly Role[] = [
  new Role('administrator', {
    dashboard: 'manage',
    inventory: 'manage',
    products: 'manage',
    requests: 'manage',
    shipments: 'manage',
    suppliers: 'manage',
    catalog: 'view',
    conservation: 'manage',
    analytics: 'manage',
    alerts: 'manage',
    users: 'manage',
    settings: 'manage'
  }),
  new Role('operator', {
    dashboard: 'view',
    inventory: 'manage',
    products: 'view',
    requests: 'manage',
    shipments: 'manage',
    suppliers: 'view',
    catalog: 'view',
    conservation: 'manage',
    analytics: 'view',
    alerts: 'view'
  }),
  new Role('supplier', {
    dashboard: 'view',
    requests: 'view',
    shipments: 'manage',
    suppliers: 'view',
    catalog: 'manage'
  })
];
