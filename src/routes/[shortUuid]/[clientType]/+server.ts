import type { RequestHandler } from './$types';
import { getSubscription } from '$lib/server/api';

export const GET: RequestHandler = async ({ params, request, getClientAddress }) => {
	const { shortUuid, clientType } = params;

	// Resolve client IP
	let clientIp = '127.0.0.1';
	try {
		clientIp = getClientAddress();
	} catch {
		clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
	}

	try {
		const requestHeaders = new Headers(request.headers);
		const subscriptionResult = await getSubscription(
			clientIp,
			shortUuid,
			requestHeaders,
			clientType
		);

		if (!subscriptionResult) {
			return new Response('Subscription not found', { status: 404 });
		}

		return new Response(subscriptionResult.body, {
			status: subscriptionResult.status,
			headers: subscriptionResult.headers
		});
	} catch (err) {
		console.error('Error in client subscription proxy:', err);
		return new Response('Internal Server Error', { status: 502 });
	}
};
