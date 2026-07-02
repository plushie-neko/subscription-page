import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifySessionToken } from '$lib/server/jwt';
import { getSubpageConfigByUuid } from '$lib/server/api';
import { getAppConfig } from '$lib/server/config';
import { MOCK_CONFIG } from '$lib/server/mock-data';

export const GET: RequestHandler = async ({ cookies }) => {
	const config = getAppConfig();

	// Dev Mode fallback if panel not configured
	if (!config.REMNAWAVE_PANEL_URL || !config.REMNAWAVE_API_TOKEN) {
		return json(MOCK_CONFIG);
	}

	const session = cookies.get('session');
	if (!session) {
		return new Response(null, { status: 403 });
	}

	const decryptedUuid = verifySessionToken(session);
	if (!decryptedUuid) {
		return new Response(null, { status: 403 });
	}

	try {
		const subpageConfig = await getSubpageConfigByUuid(decryptedUuid);
		if (!subpageConfig) {
			return new Response(null, { status: 404 });
		}

		return json(subpageConfig);
	} catch (err) {
		console.error('Error fetching subpage config for assets endpoint:', err);
		return new Response(null, { status: 500 });
	}
};
