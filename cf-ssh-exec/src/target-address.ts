/**
 * @fileoverview Target address data structures, validation rules, and sharding key generation.
 *
 * Enforces strict IPv4 formatting, TCP port bounds, and username length limits
 * to generate canonical keys for durable object instance routing.
 */

/**
 * Normalized target address composite key.
 */
export type TargetAddress = { host: string; port: number; username: string };

/**
 * Type guard verifying that a value is a non-empty, non-whitespace string.
 */
export function nonBlank(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates and extracts target connection attributes from an untrusted dictionary.
 *
 * @param payload Raw dictionary payload.
 * @returns Parsed TargetAddress or null if validation fails.
 */
export function readTargetAddress({ host, port, username }: Record<string, unknown>): TargetAddress | null {
	if (!nonBlank(host) || typeof port !== 'number' || !Number.isInteger(port) || port < 1 || port > 65_535 || !nonBlank(username)) {
		return null;
	}
	return { host, port, username };
}

/**
 * Generates a canonical JSON serialization key for routing to the target's Durable Object.
 * Enforces strict IPv4 dotted-decimal syntax to prevent SSRF and arbitrary host dial exploitation.
 *
 * @param target Validated TargetAddress.
 * @returns Canonical sharding key string, or null if host is not a valid IPv4 address.
 */
export function targetKey({ host, port, username }: TargetAddress): string | null {
	const octets = host.split('.');
	// Enforce valid IPv4 dotted-quad notation and bounded username length
	if (username.length > 256 || octets.length !== 4 || !octets.every((octet) => /^(0|[1-9][0-9]{0,2})$/.test(octet) && Number(octet) <= 255)) {
		return null;
	}
	return JSON.stringify([host, port, username]);
}
