/**
 * A key interaction of the prototype, wired from a module to an action screen.
 */
export interface PrototypeInteraction {
  /** Translation key of the module that owns the interaction. */
  module: string;
  /** Translation key of the action label. */
  action: string;
  /** Router path opened by the interaction. */
  link: string;
}

/**
 * Interaction map of the prototype, in the order presented to evaluators.
 */
export const PROTOTYPE_INTERACTIONS: readonly PrototypeInteraction[] = [
  {module: 'nav.products', action: 'interactions.add-product', link: '/products/new'},
  {module: 'nav.inventory', action: 'interactions.register-stock', link: '/inventory/stock/new'},
  {module: 'nav.inventory', action: 'interactions.register-waste', link: '/inventory/waste/new'},
  {module: 'nav.catalog', action: 'interactions.publish-catalog', link: '/catalog/new'},
  {module: 'nav.requests', action: 'interactions.new-request', link: '/requests/new'},
  {module: 'nav.shipments', action: 'interactions.review-orders', link: '/shipments'},
  {module: 'nav.suppliers', action: 'interactions.new-supplier', link: '/suppliers/new'},
  {module: 'nav.conservation', action: 'interactions.view-alerts', link: '/conservation/alerts'},
  {module: 'nav.analytics', action: 'interactions.generate-report', link: '/analytics/report'},
  {module: 'interactions.alert-module', action: 'interactions.view-suppliers', link: '/suppliers/suggested'},
  {module: 'nav.users', action: 'interactions.new-user', link: '/users/new'}
];
