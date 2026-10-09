/**
 * Where a measurement comes from: a physical sensor or a simulation used while the sensors are not installed.
 */
export type ReadingSource = 'simulated' | 'sensor';

/** Every reading source. */
export const READING_SOURCES: readonly ReadingSource[] = ['simulated', 'sensor'];
