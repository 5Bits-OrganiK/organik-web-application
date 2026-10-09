import {DomainError} from '../../../shared/domain/model/domain-error';
import {EmailAddress} from '../../../shared/domain/model/email-address';
import {ROLES} from './role';
import {User, UserProps} from './user.entity';

const props = (overrides: Partial<UserProps> = {}): UserProps => ({
  id: 'usr-3',
  fullName: ' Alexis Torres ',
  email: new EmailAddress('alexis@organik.pe'),
  role: ROLES.find(role => role.id === 'supplier')!,
  assignedModule: 'requests',
  status: 'pending',
  notes: '',
  ...overrides
});

describe('User', () => {
  it('should trim the full name', () => {
    expect(new User(props()).fullName).toBe('Alexis Torres');
  });

  it('should refuse a module the role cannot access', () => {
    expect(() => new User(props({assignedModule: 'users'}))).toThrow(DomainError);
  });

  it('should only resend the invitation while it is pending', () => {
    expect(new User(props()).canResendInvitation).toBe(true);
    expect(new User(props({status: 'accepted'})).canResendInvitation).toBe(false);
  });

  it('should return an updated copy without changing the original', () => {
    const original = new User(props());
    const accepted = original.with({status: 'accepted'});

    expect(accepted.status).toBe('accepted');
    expect(accepted.id).toBe('usr-3');
    expect(original.status).toBe('pending');
  });

  it('should keep the invariants when updating', () => {
    expect(() => new User(props()).with({assignedModule: 'settings'})).toThrow(DomainError);
  });
});
