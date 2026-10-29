import type { ServiceEnvelope, ServiceError } from "../types/models";

export type { ServiceEnvelope, ServiceError };

export function ok<T>(data: T): ServiceEnvelope<T> {
  return { data, error: null };
}

export function fail<T>(
  code: string,
  userMessage: string,
  empty: T,
): ServiceEnvelope<T> {
  const error: ServiceError = { code, userMessage };
  return { data: empty, error };
}

export function trySync<T>(empty: T, run: () => T): ServiceEnvelope<T> {
  try {
    return ok(run());
  } catch (thrown) {
    const msg =
      thrown instanceof Error
        ? thrown.message
        : "Unexpected local-store failure";
    return fail("store/unknown", msg, empty);
  }
}
