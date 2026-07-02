import type { PageServerLoad } from './$types';
import { MOCK_SUBSCRIPTION, MOCK_CONFIG } from '$lib/server/mock-data';
import { getAppConfig } from '$lib/server/config';
import { getSubscriptionInfo, getSubpageConfigByShortUuid } from '$lib/server/api';
import { signSessionToken } from '$lib/server/jwt';

export const load: PageServerLoad = async ({ params, request, cookies, getClientAddress }) => {
	const { shortUuid } = params;

	// Exclude requests for static files/assets that leak into dynamic routing
	if (shortUuid.includes('.') || ['favicon.ico', 'favicon.png', 'robots.txt', 'sitemap.xml', 'assets'].includes(shortUuid)) {
		return { error: 'Not found', status: 404 };
	}

	const config = getAppConfig();

	// Fallback to mock data if not fully configured (dev mode helper)
	if (!config.REMNAWAVE_PANEL_URL || !config.REMNAWAVE_API_TOKEN) {
		console.warn('Remnawave Panel URL or API Token not configured. Serving mock data.');
		return {
			subscription: MOCK_SUBSCRIPTION.response,
			config: MOCK_CONFIG,
			shortUuid
		};
	}

	try {
		// Resolve Client IP from SvelteKit event
		let clientIp = '127.0.0.1';
		try {
			clientIp = getClientAddress();
		} catch {
			// Fallback if getClientAddress is not available/fails
			clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
		}

		// 1. Resolve subpage config by shortUuid
		const requestHeaders = new Headers(request.headers);
		const { config: subpageConfig, webpageAllowed } = await getSubpageConfigByShortUuid(
			clientIp,
			shortUuid,
			requestHeaders
		);

		if (!webpageAllowed || !subpageConfig) {
			console.warn(`Webpage access is not allowed or config not found for shortUuid: ${shortUuid}`);
			return { error: 'Access denied or config not found', status: 403 };
		}

		// 2. Fetch subscription info
		const subscriptionData = await getSubscriptionInfo(clientIp, shortUuid);
		if (!subscriptionData || !subscriptionData.response) {
			return { error: 'Subscription not found', status: 404 };
		}

		const subscriptionInfo = subscriptionData.response;

		// 3. Clear/remove connection keys if not allowed in baseSettings
		if (!subpageConfig.baseSettings.showConnectionKeys) {
			subscriptionInfo.links = [];
			subscriptionInfo.ssConfLinks = {};
		}

		// 4. Set secure session cookie with JWT
		// Get configUuid from subpageConfig if available to store in JWT payload
		// This matches the NestJS backend logic
		const sessionToken = signSessionToken(subpageConfig.baseSettings ? config.SUBPAGE_CONFIG_UUID : null);
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 30 * 60 // 30 minutes
		});

		return {
			subscription: subscriptionInfo,
			config: subpageConfig,
			shortUuid
		};
	} catch (err) {
		console.error('Error fetching subscription page data:', err);
		// Fallback to mock data for development resilience
		return {
			subscription: MOCK_SUBSCRIPTION.response,
			config: MOCK_CONFIG,
			shortUuid
		};
	}
};
