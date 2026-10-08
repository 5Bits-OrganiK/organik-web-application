/**
 * Production environment configuration.
 */
export const environment = {
  production: true,
  /** Simulated latency (ms) applied by the in-memory gateways. */
  apiLatencyMs: 0,
  /** Language used when the user has not chosen one yet. */
  defaultLanguage: 'en',
  /** Fake REST API (Beeceptor) used until the OrganiK web services exist; an empty `baseUrl` keeps every gateway in memory. */
  api: {
    baseUrl: 'https://organik.free.beeceptor.com/api/v1',
    timeoutMs: 8000,
    /** How long (ms) an answer of the API is reused before asking again; the free plan allows few requests per day. */
    cacheMs: 300000
  },
  /** Public marketing site of OrganiK that links to this application. */
  landingUrl: 'https://organik-d6e58.web.app/'
};
