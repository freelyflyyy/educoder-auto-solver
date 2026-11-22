/**
 * @fileoverview Centralized security constraints, rate-limiting windows, and access policies.
 */

export const MAX_TARGET_TTL_SECONDS = 30 * 60;
export const MAX_EXECUTIONS_PER_TOKEN = 100;
export const TARGET_WINDOW_MS = 60_000;
export const MAX_EXECUTIONS_PER_WINDOW = 10;
export const RESERVATION_GRACE_MS = 5_000;
