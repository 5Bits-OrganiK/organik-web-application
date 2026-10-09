/**
 * A module reachable from the main navigation.
 */
export interface NavigationItem {
  /** Router path of the module. */
  link: string;
  /** Translation key of the module label. */
  label: string;
  /** Material icon ligature shown next to the label. */
  icon: string;
}

/**
 * Ordered modules of the administrative frontend.
 */
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {link: '/dashboard', label: 'nav.dashboard', icon: 'dashboard'},
  {link: '/inventory', label: 'nav.inventory', icon: 'inventory_2'},
  {link: '/products', label: 'nav.products', icon: 'category'},
  {link: '/requests', label: 'nav.requests', icon: 'receipt_long'},
  {link: '/shipments', label: 'nav.shipments', icon: 'local_shipping'},
  {link: '/suppliers', label: 'nav.suppliers', icon: 'storefront'},
  {link: '/catalog', label: 'nav.catalog', icon: 'local_offer'},
  {link: '/conservation', label: 'nav.conservation', icon: 'thermostat'},
  {link: '/analytics', label: 'nav.analytics', icon: 'analytics'},
  {link: '/alerts', label: 'nav.alerts', icon: 'flag'},
  {link: '/profiles', label: 'nav.profiles', icon: 'badge'},
  {link: '/users', label: 'nav.users', icon: 'admin_panel_settings'},
  {link: '/settings', label: 'nav.settings', icon: 'settings'}
];
