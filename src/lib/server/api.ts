import axios from 'axios';
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
export function filterHeaders(headers: Headers): Record<string, string> {
	const newHeaders: Record<string, string> = {};
	headers.forEach((value, key) => {
		if (!IGNORED_HEADERS.has(key.toLowerCase())) {
			newHeaders[key] = value;
		}
	});
	return newHeaders;
}

/**
 * Get an Axios instance configured for the Remnawave Panel
 */
function getAxiosClient(clientIp?: string, customHeaders?: Headers) {
	const config = getAppConfig();
	const headers: Record<string, string> = {
		'user-agent': 'Remnawave Subscription Page',
		'Authorization': `Bearer ${config.REMNAWAVE_API_TOKEN}`
	};

	// Optional Addons
	if (config.CADDY_AUTH_API_TOKEN) {
		headers['X-Api-Key'] = config.CADDY_AUTH_API_TOKEN;
	}
	if (config.CLOUDFLARE_ZERO_TRUST_CLIENT_ID && config.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET) {
		headers['CF-Access-Client-Id'] = config.CLOUDFLARE_ZERO_TRUST_CLIENT_ID;
		headers['CF-Access-Client-Secret'] = config.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET;
	}
	if (config.EGAMES_COOKIE) {
		headers['Cookie'] = config.EGAMES_COOKIE;
	}

	// For loopback or proxy forwarding
	if (config.REMNAWAVE_PANEL_URL.startsWith('http://')) {
		headers['X-Forwarded-For'] = '127.0.0.1';
		headers['X-Forwarded-Proto'] = 'https';
	}

	// Forward client request headers if passed (except ignored ones)
	if (customHeaders) {
		customHeaders.forEach((value, key) => {
			if (!IGNORED_HEADERS.has(key.toLowerCase())) {
				headers[key] = value;
			}
		});
	}

	// Inject Real IP
	if (clientIp) {
		headers['X-Real-IP'] = clientIp;
		headers['X-Forwarded-For'] = clientIp;
	}

	return axios.create({
		baseURL: config.REMNAWAVE_PANEL_URL,
		timeout: 10000,
		headers
	});
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
		const client = getAxiosClient(clientIp);
		// Correct endpoint: GET /api/sub/{shortUuid}/info
		const response = await client.get(`/api/sub/${encodeURIComponent(shortUuid)}/info`, {
			headers: {
				'x-remnawave-real-ip': clientIp
			}
		});
		return response.data;
	} catch (e: any) {
		console.error('Error fetching subscription info:', e?.message || e);
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
		const client = getAxiosClient();
		// Correct endpoint: /api/subscription-page-configs/{uuid}
		const response = await client.get(`/api/subscription-page-configs/${encodeURIComponent(uuid)}`);
		const subpageConfig = response.data?.response?.config || null;
		
		if (subpageConfig) {
			setToCache(uuid, subpageConfig, configCache);
		}
		return subpageConfig;
	} catch (e: any) {
		if (e?.response?.status !== 404) {
			console.error(`Error fetching subpage config ${uuid}:`, e?.message || e);
		}
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
		// Map client request headers to a plain Record for the request body
		const reqHeadersRecord: Record<string, string> = {};
		if (requestHeaders) {
			requestHeaders.forEach((value, key) => {
				reqHeadersRecord[key] = value;
			});
		}

		const client = getAxiosClient(clientIp, requestHeaders);

		// The backend-contract defines this as GET /api/subscriptions/subpage-config/{shortUuid}
		// with requestHeaders in the body (Remnawave uses GET with body)
		const response = await client.request({
			method: 'GET',
			url: `/api/subscriptions/subpage-config/${encodeURIComponent(shortUuid)}`,
			data: {
				requestHeaders: reqHeadersRecord
			},
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const result = response.data?.response;
		if (!result) {
			return { config: null, webpageAllowed: false };
		}

		const { subpageConfigUuid, webpageAllowed } = result;
		if (!webpageAllowed) {
			return { config: null, webpageAllowed: false };
		}

		// 2. Fetch the actual full configuration object
		const targetUuid = subpageConfigUuid || config.SUBPAGE_CONFIG_UUID;
		const fullConfig = await getSubpageConfigByUuid(targetUuid);

		return {
			config: fullConfig,
			webpageAllowed: true
		};
	} catch (e: any) {
		console.error('Error resolving subpage config by shortUuid:', e?.response?.data || e?.message || e);
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
		let path = `api/sub/${encodeURIComponent(shortUuid)}`;
		if (clientType) {
			path += `/${encodeURIComponent(clientType)}`;
		}

		// Filter client headers, removing connection-specific ones
		const safeHeaders = filterHeaders(headers);

		const client = getAxiosClient(clientIp, headers);
		const response = await client.get(path, {
			responseType: 'text',
			// Don't throw errors for status codes >= 400 (let us proxy them natively)
			validateStatus: () => true,
			headers: {
				...safeHeaders,
				Accept: '*/*',
				'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0',
				Pragma: 'no-cache',
				Expires: '0',
				'x-remnawave-real-ip': clientIp,
				Authorization: undefined as unknown as string // Let getAxiosClient handle this
			}
		});

		if (response.status === 404) {
			return null;
		}

		const responseHeaders = new Headers();
		// Forward headers from panel, ignoring transport/connection specific ones
		Object.entries(response.headers).forEach(([key, value]) => {
			if (!IGNORED_HEADERS.has(key.toLowerCase()) && value !== undefined) {
				responseHeaders.set(key, String(value));
			}
		});

		// Ensure we return a valid status code for the Response constructor
		// HTTP 304 is not a valid status for Response with body, convert to 200
		let finalStatus = response.status;
		if (finalStatus === 304) {
			finalStatus = 200;
		}

		return {
			body: response.data,
			status: finalStatus,
			headers: responseHeaders
		};
	} catch (e) {
		console.error(`Error in getSubscription proxy:`, e);
		return null;
	}
}
