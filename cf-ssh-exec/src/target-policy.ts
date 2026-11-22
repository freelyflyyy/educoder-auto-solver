/**
 * @fileoverview Target network policy, IPv4 validation, and anti-SSRF filtering.
 *
 * Enforces strict dotted-quad IPv4 formatting, blocks private/internal/reserved address ranges
 * to prevent Server-Side Request Forgery (SSRF), and evaluates optional CIDR allowlists.
 */

/**
 * Converts a canonical dotted-quad IPv4 string into a 32-bit unsigned integer.
 * Rejects leading zeros, non-decimal characters, and out-of-range octets.
 *
 * @param ip Dotted-quad IPv4 string.
 * @returns 32-bit unsigned integer or `null` if malformed.
 */
export function ipToUint32(ip: string): number | null {
	const octets = ip.split('.');
	if (octets.length !== 4) return null;

	let result = 0;
	for (const octet of octets) {
		if (!/^(0|[1-9][0-9]{0,2})$/.test(octet)) return null;
		const num = Number(octet);
		if (num > 255) return null;
		result = ((result << 8) | num) >>> 0;
	}
	return result;
}

/**
 * Evaluates whether an IPv4 address is globally routable on the public internet.
 *
 * Blocks private networks (RFC 1918), loopback (RFC 1122), link-local / cloud metadata (RFC 3927),
 * carrier-grade NAT (RFC 6598), current network (0.0.0.0/8), multicast (RFC 5771),
 * and reserved/broadcast ranges (RFC 1112).
 *
 * @param host IPv4 address string to evaluate.
 * @returns `true` if `host` is a valid public IPv4 address; `false` otherwise.
 */
export function isPublicIpv4(host: string): boolean {
	const n = ipToUint32(host);
	if (n === null) return false;

	const octet0 = (n >>> 24) & 0xff;
	const octet1 = (n >>> 16) & 0xff;

	// 0.0.0.0/8 (Current network)
	if (octet0 === 0) return false;
	// 10.0.0.0/8 (Private network RFC 1918)
	if (octet0 === 10) return false;
	// 100.64.0.0/10 (Carrier-grade NAT RFC 6598: 100.64.0.0 - 100.127.255.255)
	if (octet0 === 100 && octet1 >= 64 && octet1 <= 127) return false;
	// 127.0.0.0/8 (Loopback RFC 1122)
	if (octet0 === 127) return false;
	// 169.254.0.0/16 (Link-local / Cloud instance metadata RFC 3927)
	if (octet0 === 169 && octet1 === 254) return false;
	// 172.16.0.0/12 (Private network RFC 1918: 172.16.0.0 - 172.31.255.255)
	if (octet0 === 172 && octet1 >= 16 && octet1 <= 31) return false;
	// 192.168.0.0/16 (Private network RFC 1918)
	if (octet0 === 192 && octet1 === 168) return false;
	// 224.0.0.0/4 (Multicast RFC 5771) and 240.0.0.0/4 (Reserved RFC 1112 / Broadcast)
	if (octet0 >= 224) return false;

	return true;
}

/**
 * Checks if a given IPv4 address belongs to any of the specified CIDR blocks or exact IP literals.
 *
 * @param ip Target IPv4 string.
 * @param cidrs Array of CIDR blocks (e.g. `47.99.0.0/16`) or exact IPv4 literals.
 * @returns `true` if `ip` matches at least one entry; `false` otherwise.
 */
export function isIpInCidrs(ip: string, cidrs: readonly string[]): boolean {
	const ipInt = ipToUint32(ip);
	if (ipInt === null || cidrs.length === 0) return false;

	for (const entry of cidrs) {
		const trimmed = entry.trim();
		if (!trimmed) continue;

		if (!trimmed.includes('/')) {
			const entryInt = ipToUint32(trimmed);
			if (entryInt !== null && entryInt === ipInt) return true;
			continue;
		}

		const [prefix, bitsStr, extra] = trimmed.split('/');
		if (extra !== undefined || !/^[0-9]{1,2}$/.test(bitsStr ?? '')) continue;
		const bits = Number(bitsStr);
		if (!Number.isInteger(bits) || bits < 0 || bits > 32) continue;

		const prefixInt = ipToUint32(prefix);
		if (prefixInt === null) continue;

		const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
		if ((ipInt & mask) === (prefixInt & mask)) {
			return true;
		}
	}

	return false;
}

/**
 * Evaluates whether a target host is permitted under anti-SSRF rules and optional CIDR allowlists.
 *
 * @param host Target host string.
 * @param configuredCidrs Optional comma-separated CIDR allowlist (`ALLOWED_HOST_CIDRS`).
 * @returns `true` if the target is a public IPv4 address matching the allowlist (if configured).
 */
export function isAllowedTargetHost(host: string, configuredCidrs?: string): boolean {
	if (!isPublicIpv4(host)) return false;
	const cidrs = configuredCidrs
		?.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
	return !cidrs?.length || isIpInCidrs(host, cidrs);
}
