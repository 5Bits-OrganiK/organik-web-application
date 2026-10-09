import {FormControl} from '@angular/forms';
import {emailValidator, positiveIntegerValidator} from './validators';

describe('form validators', () => {
  it('should accept empty values so that required stays in charge', () => {
    expect(emailValidator(new FormControl(''))).toBeNull();
    expect(positiveIntegerValidator(new FormControl(''))).toBeNull();
  });

  it('should flag malformed e-mail addresses', () => {
    expect(emailValidator(new FormControl('nope'))).toEqual({email: true});
    expect(emailValidator(new FormControl('ok@organik.pe'))).toBeNull();
  });

  it('should only accept positive whole numbers', () => {
    expect(positiveIntegerValidator(new FormControl('0'))).toEqual({positiveInteger: true});
    expect(positiveIntegerValidator(new FormControl('2.5'))).toEqual({positiveInteger: true});
    expect(positiveIntegerValidator(new FormControl('24'))).toBeNull();
  });
});
