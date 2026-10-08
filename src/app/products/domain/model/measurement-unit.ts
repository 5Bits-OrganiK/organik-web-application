/** Unit in which the stock of a product is counted. */
export type MeasurementUnit = 'unit' | 'kg' | 'liter' | 'pack';

/** Every supported measurement unit. */
export const MEASUREMENT_UNITS: readonly MeasurementUnit[] = ['unit', 'kg', 'liter', 'pack'];
