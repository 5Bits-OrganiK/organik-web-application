import {AbstractControl, ValidationErrors} from '@angular/forms';
import {EmailAddress} from '../../domain/model/email-address';

/**
 * Validates that a non-empty value is a well-formed e-mail address.
 *
 * @remarks
 * Delegates to the {@link EmailAddress} value object so the form and the domain agree.
 */
export function emailValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = control.value?.trim();
  return !value || EmailAddress.isValid(value) ? null : {email: true};
}

/**
 * Validates that a value is a whole number greater than zero.
 */
export function positiveIntegerValidator(
  control: AbstractControl<string | number | null>
): ValidationErrors | null {
  const value = control.value;
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? null : {positiveInteger: true};
}

/**
 * Validates that a value is a whole number of zero or more.
 */
export function nonNegativeIntegerValidator(
  control: AbstractControl<string | number | null>
): ValidationErrors | null {
  const value = control.value;
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? null : {nonNegativeInteger: true};
}
