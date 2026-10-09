/**
 * Demo credentials used while the identity backend is not available.
 *
 * @remarks
 * This file exists only for the prototype: a real backend never ships passwords to the
 * browser. Replace the gateway method that reads it when the backend is available.
 */
export const DEMO_PASSWORD = 'Organik2026!';

/** E-mail addresses of the seeded users that can sign in with {@link DEMO_PASSWORD}. */
export const DEMO_ACCOUNTS: readonly string[] = [
  'albino@organik.pe',
  'cielo@organik.pe',
  'alexis@organik.pe',
  'marco@bioandes.pe'
];
