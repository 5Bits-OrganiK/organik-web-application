import {TestBed} from '@angular/core/testing';
import {DomainError} from '../../shared/domain/model/domain-error';
import {AuthStore} from './auth.store';
import {SessionStore} from './session.store';
import {SaveUserCommand, UsersStore} from './users.store';

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

const command = (overrides: Partial<SaveUserCommand> = {}): SaveUserCommand => ({
  fullName: 'Rosa Vega',
  email: 'rosa@organik.pe',
  role: 'operator',
  assignedModule: 'conservation',
  status: 'pending',
  notes: '',
  ...overrides
});

describe('UsersStore', () => {
  let store: UsersStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    store = TestBed.inject(UsersStore);
    store.loadUsers();
    await settleGateway();
  });

  afterEach(() => vi.useRealTimers());

  it('should load the users', () => {
    expect(store.users().map(user => user.fullName)).toEqual([
      'Albino Caceres',
      'Cielo Atencio',
      'Alexis Torres',
      'Marco Quispe'
    ]);
  });

  it('should create a user with the next identifier', async () => {
    store.createUser(command()).subscribe();
    await settleGateway();

    expect(store.findById('usr-5')?.role.id).toBe('operator');
  });

  it('should refuse an e-mail that already belongs to someone', () => {
    expect(() => store.createUser(command({email: 'CIELO@organik.pe'}))).toThrow(DomainError);
  });

  it('should refuse a module the role cannot access', () => {
    expect(() => store.createUser(command({role: 'supplier', assignedModule: 'users'}))).toThrow(DomainError);
  });

  it('should update a user keeping its identifier', async () => {
    store.updateUser('usr-2', command({fullName: 'Cielo A.', email: 'cielo@organik.pe', status: 'accepted'})).subscribe();
    await settleGateway();

    expect(store.findById('usr-2')?.fullName).toBe('Cielo A.');
    expect(store.users().length).toBe(4);
  });

  it('should let a user keep their own e-mail when editing', () => {
    expect(() => store.updateUser('usr-2', command({email: 'cielo@organik.pe'}))).not.toThrow();
  });

  it('should only resend invitations that are pending', () => {
    expect(() => store.resendInvitation('usr-1')).toThrow(DomainError);
    expect(() => store.resendInvitation('usr-3')).not.toThrow();
  });

  it('should expose the signed-in administrator', async () => {
    const session = TestBed.inject(SessionStore);
    TestBed.inject(AuthStore).login('albino@organik.pe', 'Organik2026!').subscribe();
    await settleGateway();

    expect(session.currentUser()?.fullName).toBe('Albino Caceres');
    expect(session.roleKey()).toBe('iam.session.administrator');
  });
});
