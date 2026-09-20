/**
 * Utility functions for resolving and sanitizing client IP addresses in SvelteKit
 * behind various reverse proxies, CDNs, and container bridge networks.
 */

function isPrivateOrLoopback(ip: string): boolean {
	const clean = ip.replace(/^::ffff:/i, '').trim();
	if (!clean || clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') {
		return true;
	}
	// 10.0.0.0/8
	if (/^10\./.test(clean)) return true;
	// 172.16.0.0/12 (Docker bridge networks: 172.17.x, 172.18.x, ..., 172.31.x)
	if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
	// 192.168.0.0/16
	if (/^192\.168\./.test(clean)) return true;
	return false;
}

/**
 * Resolves the client's public/real IP address from the SvelteKit request context.
 * 
 * 1. Checks getClientAddress() (configured via ADDRESS_HEADER in @sveltejs/adapter-node).
 * 2. If missing or pointing to a private/Docker bridge network, checks reverse proxy headers:
 *    - CF-Connecting-IP (Cloudflare)
 *    - X-Real-IP (HAProxy, Nginx, Caddy)
 *    - X-Forwarded-For (Leftmost client IP)
 * 3. Strips the dual-stack IPv4-mapped IPv6 prefix (::ffff:) while preserving native IPv6.
 */
export function resolveClientIp(event: {
	getClientAddress?: () => string;
	request: Request;
}): string {
	let clientIp = '';

	if (typeof event.getClientAddress === 'function') {
		try {
			clientIp = event.getClientAddress();
		} catch {
			// getClientAddress throws if ADDRESS_HEADER is configured but not found in request
		}
	}

	// If getClientAddress is empty or resolved to a local Docker bridge IP, inspect proxy headers
	if (!clientIp || isPrivateOrLoopback(clientIp)) {
		const headers = event.request.headers;
		const cfConnectingIp = headers.get('cf-connecting-ip');
		const xRealIp = headers.get('x-real-ip');
		const xForwardedFor = headers.get('x-forwarded-for');

		if (cfConnectingIp && cfConnectingIp.trim()) {
			clientIp = cfConnectingIp.trim();
		} else if (xRealIp && xRealIp.trim()) {
			clientIp = xRealIp.trim();
		} else if (xForwardedFor && xForwardedFor.trim()) {
			// X-Forwarded-For can be a comma-separated list of IPs: "client, proxy1, proxy2"
			const firstIp = xForwardedFor.split(',')[0].trim();
			if (firstIp) {
				clientIp = firstIp;
			}
		}
	}

	if (!clientIp) {
		clientIp = '127.0.0.1';
	}

	// Clean IPv4-mapped IPv6 addresses (e.g. ::ffff:1.2.3.4 -> 1.2.3.4), preserve native IPv6
	return clientIp.replace(/^::ffff:/i, '').trim();
}
