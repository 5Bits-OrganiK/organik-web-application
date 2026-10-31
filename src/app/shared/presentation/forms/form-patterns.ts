/**
 * Patterns the forms hand to `Validators.pattern`.
 */

/** A well-formed e-mail address; surrounding spaces are allowed because the value object trims them. */
export const EMAIL_FIELD_PATTERN = /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/;

/** A whole number greater than zero. */
export const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

/** A whole number of zero or more. */
export const NON_NEGATIVE_INTEGER_PATTERN = /^(0|[1-9]\d*)$/;
