import type { Handle } from '@sveltejs/kit';
import { getSubscription } from '$lib/server/api';

const browserKeywords = [
	'Mozilla',
	'Chrome',
	'Safari',
	'Firefox',
	'Opera',
	'Edge',
	'TelegramBot',
	'WhatsApp'
];

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const parts = pathname.slice(1).split('/');

	// Filter out generic resource paths early
	const genericExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.css', '.js'];
	if (genericExts.some((ext) => pathname.includes(ext))) {
		return resolve(event);
	}

	// Intercept paths: /[shortUuid] or /[shortUuid]/[clientType]
	if ((parts.length === 1 || parts.length === 2) && parts[0] !== '') {
		const shortUuid = parts[0];
		const clientType = parts.length === 2 ? parts[1] : undefined;
		
		// Reserved folders/files in SvelteKit
		const excluded = ['api', 'assets', 'favicon.ico', 'robots.txt', '_app', 'static', 'locales'];

		if (!excluded.includes(shortUuid) && !shortUuid.includes('.')) {
			const userAgent = event.request.headers.get('user-agent') || '';
			const isBrowser = browserKeywords.some((keyword) => userAgent.includes(keyword));

			// If NOT a browser, proxy the raw subscription content
			if (!isBrowser) {
				let clientIp = '127.0.0.1';
				try {
					clientIp = event.getClientAddress();
				} catch {
					clientIp = event.request.headers.get('x-forwarded-for') || '127.0.0.1';
				}

				try {
					const requestHeaders = new Headers(event.request.headers);
					const subscriptionResult = await getSubscription(
						clientIp,
						shortUuid,
						requestHeaders,
						clientType
					);

					if (subscriptionResult) {
						// Return raw response directly — status already sanitized (304→200)
						return new Response(subscriptionResult.body, {
							status: subscriptionResult.status,
							headers: subscriptionResult.headers
						});
					}
				} catch (e) {
					console.error('Error proxying raw subscription in hooks:', e);
				}

				return new Response('Subscription not found', { status: 404 });
			}
		}
	}

	return resolve(event);
};
