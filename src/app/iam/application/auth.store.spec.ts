import {TestBed} from '@angular/core/testing';
import {AuthenticationError} from '../domain/model/authentication-error';
import {Registration} from '../domain/model/registration';
import {RegistrationError} from '../domain/model/registration-error';
import {AuthStore} from './auth.store';

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('AuthStore', () => {
  let store: AuthStore;

  const attempt = async (email: string, password: string) => {
    let outcome: unknown = 'pending';
    store.login(email, password).subscribe({
      next: user => (outcome = user),
      error: (error: unknown) => (outcome = error)
    });
    await settleGateway();
    return outcome;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should start without a session', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.userId()).toBeNull();
  });

  it('should sign in with right credentials, ignoring the case of the e-mail', async () => {
    await attempt('Albino@Organik.pe', 'Organik2026!');

    expect(store.isAuthenticated()).toBe(true);
    expect(store.userId()).toBe('usr-1');
    expect(sessionStorage.getItem('organik.session')).toBe('usr-1');
  });

  it('should answer the same way for a wrong password and an unknown e-mail', async () => {
    const wrongPassword = await attempt('albino@organik.pe', 'nope');
    const unknown = await attempt('ghost@organik.pe', 'Organik2026!');

    expect(wrongPassword).toBeInstanceOf(AuthenticationError);
    expect((wrongPassword as AuthenticationError).reason).toBe('invalid-credentials');
    expect((unknown as AuthenticationError).reason).toBe('invalid-credentials');
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should refuse users who have not accepted their invitation', async () => {
    const outcome = await attempt('alexis@organik.pe', 'Organik2026!');

    expect((outcome as AuthenticationError).reason).toBe('pending-invitation');
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should end the session on logout', async () => {
    await attempt('cielo@organik.pe', 'Organik2026!');
    store.logout();

    expect(store.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('organik.session')).toBeNull();
  });

  it('should restore the session of the same tab', async () => {
    await attempt('cielo@organik.pe', 'Organik2026!');

    TestBed.resetTestingModule();
    expect(TestBed.inject(AuthStore).userId()).toBe('usr-2');
  });

  describe('register', () => {
    const registration: Registration = {fullName: 'Rosa Quispe', email: 'Rosa@Vidaverde.pe', role: 'administrator', company: 'Vida Verde', password: 'hojas-verdes-1'};

    const signUp = async (data = registration) => {
      let outcome: unknown = 'pending';
      store.register(data).subscribe({next: user => (outcome = user), error: (error: unknown) => (outcome = error)});
      await settleGateway();
      return outcome;
    };

    it('should create an administrator account and sign its owner in', async () => {
      const user = (await signUp()) as {id: string; role: {id: string}; email: {toString(): string}};

      expect(user.role.id).toBe('administrator');
      expect(user.email.toString()).toBe('rosa@vidaverde.pe');
      expect(store.userId()).toBe(user.id);
      expect(sessionStorage.getItem('organik.session')).toBe(user.id);
    });

    it('should create a supplier account that starts in the requests module', async () => {
      const user = (await signUp({...registration, email: 'ventas@frutosdelvalle.pe', role: 'supplier', company: 'Frutos del Valle'})) as {role: {id: string}; assignedModule: string; notes: string};

      expect(user.role.id).toBe('supplier');
      expect(user.assignedModule).toBe('requests');
      expect(user.notes).toBe('Frutos del Valle');
    });

    it('should let the new user sign in again with the chosen password only', async () => {
      await signUp();
      store.logout();

      expect(await attempt('rosa@vidaverde.pe', 'Organik2026!')).toBeInstanceOf(AuthenticationError);
      expect(await attempt('rosa@vidaverde.pe', 'hojas-verdes-1')).toHaveProperty('fullName', 'Rosa Quispe');
    });

    it('should refuse an e-mail that already has an account, whatever its case', async () => {
      const outcome = await signUp({...registration, email: 'ALBINO@organik.pe'});

      expect(outcome).toBeInstanceOf(RegistrationError);
      expect((outcome as RegistrationError).reason).toBe('email-taken');
      expect(store.isAuthenticated()).toBe(false);
    });

    it('should remember the account after the page is reloaded', async () => {
      await signUp();
      store.logout();

      TestBed.resetTestingModule();
      store = TestBed.inject(AuthStore);

      expect(await attempt('rosa@vidaverde.pe', 'hojas-verdes-1')).toHaveProperty('fullName', 'Rosa Quispe');
    });
  });
});
