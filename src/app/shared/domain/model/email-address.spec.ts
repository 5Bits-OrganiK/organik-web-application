import {DomainError} from './domain-error';
import {EmailAddress} from './email-address';

describe('EmailAddress', () => {
  it('should normalize case and surrounding spaces', () => {
    expect(new EmailAddress('  Albino@Organik.PE ').toString()).toBe('albino@organik.pe');
  });

  it('should reject malformed addresses', () => {
    expect(() => new EmailAddress('albino.organik.pe')).toThrow(DomainError);
    expect(() => new EmailAddress('albino@')).toThrow(DomainError);
  });

  it('should expose validity without throwing', () => {
    expect(EmailAddress.isValid('cielo@organik.pe')).toBe(true);
    expect(EmailAddress.isValid('cielo')).toBe(false);
  });
});
