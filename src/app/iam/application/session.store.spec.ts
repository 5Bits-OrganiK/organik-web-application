import {TestBed} from '@angular/core/testing';
import {AuthStore} from './auth.store';
import {SessionStore} from './session.store';

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('SessionStore', () => {
  let auth: AuthStore;
  let session: SessionStore;

  const signUp = async (role: 'administrator' | 'supplier', email: string) => {
    auth.register({fullName: 'Persona Prueba', email, role, company: 'Empresa', password: 'clave-segura-1'}).subscribe();
    await settleGateway();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthStore);
    session = TestBed.inject(SessionStore);
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should let an administrator open every module', async () => {
    await signUp('administrator', 'admin@minimarket.pe');

    expect(session.canOpen('/users')).toBe(true);
    expect(session.canOpen('/inventory')).toBe(true);
  });

  it('should keep a supplier inside the modules of their role', async () => {
    await signUp('supplier', 'proveedor@empresa.pe');

    expect(session.canOpen('/requests')).toBe(true);
    expect(session.canOpen('/shipments')).toBe(true);
    expect(session.canOpen('/dashboard')).toBe(true);
    expect(session.canOpen('/inventory')).toBe(false);
    expect(session.canOpen('/users')).toBe(false);
  });

  it('should always allow links that are not modules', async () => {
    await signUp('supplier', 'proveedor@empresa.pe');

    expect(session.canOpen('/profiles')).toBe(true);
  });

  it('should allow everything while nobody is loaded', () => {
    expect(session.canOpen('/users')).toBe(true);
  });
});
