import {FormControl, Validators} from '@angular/forms';
import {EMAIL_FIELD_PATTERN, NON_NEGATIVE_INTEGER_PATTERN, POSITIVE_INTEGER_PATTERN} from './form-patterns';

describe('form patterns', () => {
  const valid = (pattern: RegExp, value: string) => Validators.pattern(pattern)(new FormControl(value)) === null;

  it('should accept empty values so that required stays in charge', () => {
    expect(valid(EMAIL_FIELD_PATTERN, '')).toBe(true);
    expect(valid(POSITIVE_INTEGER_PATTERN, '')).toBe(true);
  });

  it('should flag malformed e-mail addresses', () => {
    expect(valid(EMAIL_FIELD_PATTERN, 'nope')).toBe(false);
    expect(valid(EMAIL_FIELD_PATTERN, 'ok@organik.pe')).toBe(true);
    expect(valid(EMAIL_FIELD_PATTERN, ' ok@organik.pe ')).toBe(true);
  });

  it('should only accept positive whole numbers', () => {
    expect(valid(POSITIVE_INTEGER_PATTERN, '0')).toBe(false);
    expect(valid(POSITIVE_INTEGER_PATTERN, '2.5')).toBe(false);
    expect(valid(POSITIVE_INTEGER_PATTERN, '24')).toBe(true);
  });

  it('should accept zero only when the number may be non-negative', () => {
    expect(valid(NON_NEGATIVE_INTEGER_PATTERN, '0')).toBe(true);
    expect(valid(NON_NEGATIVE_INTEGER_PATTERN, '-1')).toBe(false);
    expect(valid(NON_NEGATIVE_INTEGER_PATTERN, '07')).toBe(false);
  });
});
