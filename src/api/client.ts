/**
 * Base API Client wrapper with error normalization and request logging.
 * Implements a standardized request layer that mimics a real backend HTTP client
 * (e.g. Axios/Fetch with interceptors) while leveraging durable in-memory / local storage
 * for realistic state mutations across the application lifecycle.
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  fieldErrors?: Record<string, string>;
}

export class AppApiError extends Error {
  statusCode: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, statusCode = 500, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'AppApiError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Simulates network latency and error normalization
 */
export async function simulateDelay<T>(
  dataProducer: () => T | Promise<T>,
  minMs = 180,
  maxMs = 380,
  failureRate = 0.0
): Promise<T> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, ms));

  if (failureRate > 0 && Math.random() < failureRate) {
    throw new AppApiError('Simulated temporary network fluctuation. Please retry.', 503);
  }

  return await dataProducer();
}

/**
 * Helper to sync state to localStorage for persistence across reloads
 */
export function getPersistentState<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`talentpulse_${key}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Failed reading ${key} from storage`, err);
  }
  return defaultValue;
}

export function savePersistentState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`talentpulse_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed writing ${key} to storage`, err);
  }
}
