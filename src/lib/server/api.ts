import { getAppConfig } from './config';
import type { SubscriptionData, SubpageConfig } from '$lib/types';

// Header names that should not be forwarded to the panel
export const IGNORED_HEADERS = new Set([
	'accept-encoding',
	'alt-svc',
	'authorization',
	'cache-control',
	'cf-access-client-id',
	'cf-access-client-secret',
	'cf-cache-status',
	'cf-connecting-ip',
	'cf-ray',
	'connection',
	'content-length',
	'content-security-policy',
	'cross-origin-opener-policy',
	'cross-origin-resource-policy',
	'expires',
	'fastly-client-ip',
	'forwarded',
	'forwarded-for',
	'host',
	'keep-alive',
	'nel',
	'origin-agent-cluster',
	'pragma',
	'proxy-authenticate',
	'proxy-authorization',
	'report-to',
	'server',
	'te',
	'trailer',
	'transfer-encoding',
	'true-client-ip',
	'upgrade',
	'x-api-key',
	'x-client-ip',
	'x-cluster-client-ip',
	'x-forwarded',
	'x-forwarded-for',
	'x-forwarded-proto',
	'x-forwarded-scheme',
	'x-real-ip',
	'x-remnawave-client-type',
	'x-remnawave-real-ip',
	'x-subpage-version',
]);

// Simple in-memory cache for configs to prevent slamming the panel
interface CacheEntry<T> {
	value: T;
	expiry: number;
}
const configCache = new Map<string, CacheEntry<SubpageConfig>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function getFromCache<T>(key: string, cache: Map<string, CacheEntry<T>>): T | null {
	const entry = cache.get(key);
	if (entry && entry.expiry > Date.now()) {
		return entry.value;
	}
	cache.delete(key);
	return null;
}

function setToCache<T>(key: string, value: T, cache: Map<string, CacheEntry<T>>) {
	cache.set(key, {
		value,
		expiry: Date.now() + CACHE_TTL_MS
	});
}

/**
 * Filter client request headers, removing connection-specific and security-sensitive headers
 */
export function filterHeaders(headers: Headers): Headers {
	const newHeaders = new Headers();
	headers.forEach((value, key) => {
		if (!IGNORED_HEADERS.has(key.toLowerCase())) {
			newHeaders.set(key, value);
		}
	});
	return newHeaders;
}

/**
 * Prepare custom headers for requests to the Remnawave panel
 */
function preparePanelHeaders(clientIp?: string, customHeaders?: Headers): Headers {
	const config = getAppConfig();
	const headers = new Headers();

	// Basic Authorization and UA
	headers.set('user-agent', 'Remnawave Subscription Page');
	headers.set('Authorization', `Bearer ${config.REMNAWAVE_API_TOKEN}`);

	// Optional Addons
	if (config.CADDY_AUTH_API_TOKEN) {
		headers.set('X-Api-Key', config.CADDY_AUTH_API_TOKEN);
	}
	if (config.CLOUDFLARE_ZERO_TRUST_CLIENT_ID && config.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET) {
		headers.set('CF-Access-Client-Id', config.CLOUDFLARE_ZERO_TRUST_CLIENT_ID);
		headers.set('CF-Access-Client-Secret', config.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET);
	}
	if (config.EGAMES_COOKIE) {
		headers.set('Cookie', config.EGAMES_COOKIE);
	}

	// For loopback or proxy forwarding
	if (config.REMNAWAVE_PANEL_URL.startsWith('http://')) {
		headers.set('X-Forwarded-For', '127.0.0.1');
		headers.set('X-Forwarded-Proto', 'https');
	}

	// Forward client request headers if passed (except ignored ones)
	if (customHeaders) {
		customHeaders.forEach((value, key) => {
			if (!IGNORED_HEADERS.has(key.toLowerCase())) {
				headers.set(key, value);
			}
		});
	}

	// Inject Real IP
	if (clientIp) {
		headers.set('X-Real-IP', clientIp);
		headers.set('X-Forwarded-For', clientIp);
	}

	return headers;
}

/**
 * Fetch subscription info by UUID
 */
export async function getSubscriptionInfo(clientIp: string, shortUuid: string): Promise<SubscriptionData | null> {
	const config = getAppConfig();
	if (!config.REMNAWAVE_PANEL_URL || !config.REMNAWAVE_API_TOKEN) {
		return null;
	}

	try {
		const response = await fetch(`${config.REMNAWAVE_PANEL_URL}/api/sub/${shortUuid}/info`, {
			method: 'GET',
			headers: preparePanelHeaders(clientIp)
		});

		if (!response.ok) {
			console.error(`Failed to fetch subscription info: ${response.status} ${response.statusText}`);
			return null;
		}

		return await response.json();
	} catch (e) {
		console.error('Error fetching subscription info:', e);
		return null;
	}
}

/**
 * Fetch subpage config by UUID
 */
export async function getSubpageConfigByUuid(uuid: string): Promise<SubpageConfig | null> {
	const config = getAppConfig();
	if (!config.REMNAWAVE_PANEL_URL || !config.REMNAWAVE_API_TOKEN) {
		return null;
	}

	const cached = getFromCache(uuid, configCache);
	if (cached) return cached;

	try {
		const response = await fetch(`${config.REMNAWAVE_PANEL_URL}/api/subscription-page/config/${uuid}`, {
			method: 'GET',
			headers: preparePanelHeaders()
		});

		if (!response.ok) {
			console.error(`Failed to fetch subpage config ${uuid}: ${response.status}`);
			return null;
		}

		const data = await response.json();
		const subpageConfig = data?.response?.config || null;
		if (subpageConfig) {
			setToCache(uuid, subpageConfig, configCache);
		}
		return subpageConfig;
	} catch (e) {
		console.error(`Error fetching subpage config ${uuid}:`, e);
		return null;
	}
}

/**
 * Resolve shortUuid -> subpageConfigUuid -> subpageConfig details
 * Implements GetSubpageConfigByShortUuidCommand behavior
 */
export async function getSubpageConfigByShortUuid(
	clientIp: string,
	shortUuid: string,
	requestHeaders?: Headers
): Promise<{ config: SubpageConfig | null; webpageAllowed: boolean }> {
	const config = getAppConfig();
	if (!config.REMNAWAVE_PANEL_URL || !config.REMNAWAVE_API_TOKEN) {
		return { config: null, webpageAllowed: false };
	}

	try {
		// 1. Resolve shortUuid to configUuid and webpageAllowed status
		const response = await fetch(
			`${config.REMNAWAVE_PANEL_URL}/api/subscriptions/subpage-config/${shortUuid}`,
			{
				method: 'POST', // The command has requestBody containing headers, usually sent via POST or GET with body
				headers: preparePanelHeaders(clientIp, requestHeaders),
				body: JSON.stringify({
					requestHeaders: requestHeaders ? Object.fromEntries(requestHeaders.entries()) : {}
				})
			}
		);

		// Fallback to GET if POST is not accepted (some setups might vary)
		let responseData;
		if (!response.ok) {
			// Try GET
			const getResponse = await fetch(
				`${config.REMNAWAVE_PANEL_URL}/api/subscriptions/subpage-config/${shortUuid}`,
				{
					method: 'GET',
					headers: preparePanelHeaders(clientIp, requestHeaders)
				}
			);
			if (!getResponse.ok) {
				console.error(`Failed to resolve subpage config by shortUuid: ${getResponse.status}`);
				return { config: null, webpageAllowed: false };
			}
			responseData = await getResponse.json();
		} else {
			responseData = await response.json();
		}

		const result = responseData?.response;
		if (!result) {
			return { config: null, webpageAllowed: false };
		}

		const { subpageConfigUuid, webpageAllowed } = result;
		if (!webpageAllowed) {
			return { config: null, webpageAllowed: false };
		}

		// 2. Fetch the actual full configuration object
		// If subpageConfigUuid is null, resolve default SUBPAGE_CONFIG_UUID
		const targetUuid = subpageConfigUuid || config.SUBPAGE_CONFIG_UUID;
		const fullConfig = await getSubpageConfigByUuid(targetUuid);

		return {
			config: fullConfig,
			webpageAllowed: true
		};
	} catch (e) {
		console.error('Error resolving subpage config by shortUuid:', e);
		return { config: null, webpageAllowed: false };
	}
}

/**
 * Proxy raw subscription content for client apps
 */
export async function getSubscription(
	clientIp: string,
	shortUuid: string,
	headers: Headers,
	clientType?: string
): Promise<{ body: string; status: number; headers: Headers } | null> {
	const config = getAppConfig();
	if (!config.REMNAWAVE_PANEL_URL || !config.REMNAWAVE_API_TOKEN) {
		return null;
	}

	try {
		let path = `/api/sub/${shortUuid}`;
		if (clientType) {
			path += `/${clientType}`;
		}

		const reqHeaders = preparePanelHeaders(clientIp, headers);

		const response = await fetch(`${config.REMNAWAVE_PANEL_URL}${path}`, {
			method: 'GET',
			headers: reqHeaders
		});

		if (response.status === 404) {
			return null;
		}

		const body = await response.text();
		const responseHeaders = new Headers();

		// Forward headers from panel, ignoring transport/connection specific ones
		response.headers.forEach((value, key) => {
			if (!IGNORED_HEADERS.has(key.toLowerCase())) {
				responseHeaders.set(key, value);
			}
		});

		return {
			body,
			status: response.status,
			headers: responseHeaders
		};
	} catch (e) {
		console.error(`Error in getSubscription proxy:`, e);
		return null;
	}
}
