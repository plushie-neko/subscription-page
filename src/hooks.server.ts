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

	// Only intercept root single-segment paths like /[shortUuid]
	if (parts.length === 1 && parts[0] !== '') {
		const shortUuid = parts[0];
		
		// Reserved folders/files in SvelteKit
		const excluded = ['api', 'assets', 'favicon.ico', 'robots.txt', '_app', 'static'];

		if (!excluded.includes(shortUuid) && !shortUuid.includes('.')) {
			const userAgent = event.request.headers.get('user-agent') || '';
			const isBrowser = browserKeywords.some((keyword) => userAgent.includes(keyword));

			// If NOT a browser, proxy the raw default subscription config
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
						requestHeaders
					);

					if (subscriptionResult) {
						// Return raw response directly
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
