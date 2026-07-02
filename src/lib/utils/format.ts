/**
 * Formatting utilities for dates, bytes, and subscription URLs.
 */
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import 'dayjs/locale/ru.js';

dayjs.extend(relativeTime);

export function formatDate(
	dateStr: string | null,
	lang: string,
	translations: Record<string, string>
): string {
	if (!dateStr) return translations['neverExpires'] ?? 'Never';
	const d = dayjs(dateStr);
	if (!d.isValid()) return translations['neverExpires'] ?? 'Never';
	return d.locale(lang === 'ru' ? 'ru' : 'en').format('DD MMM YYYY');
}

export function getExpirationText(
	dateStr: string | null,
	lang: string,
	translations: Record<string, string>
): string {
	if (!dateStr) return translations['neverExpires'] ?? 'Never expires';
	const d = dayjs(dateStr);
	if (!d.isValid()) return translations['neverExpires'] ?? 'Never expires';

	const now = dayjs();
	if (d.isBefore(now)) return translations['expired'] ?? 'Expired';

	const daysLeft = d.diff(now, 'day');
	const template = translations['daysLeft'] ?? '{days} days left';
	return template.replace('{days}', String(daysLeft));
}

export function constructSubscriptionUrl(currentHref: string, shortUuid: string): string {
	try {
		const url = new URL(currentHref);
		// Remove trailing segments and rebuild with shortUuid
		const pathParts = url.pathname.split('/').filter(Boolean);
		// Replace the last segment (which is the current shortUuid route) or append
		if (pathParts.length > 0) {
			pathParts[pathParts.length - 1] = shortUuid;
		} else {
			pathParts.push(shortUuid);
		}
		url.pathname = '/' + pathParts.join('/');
		return url.toString();
	} catch {
		return `${currentHref}/${shortUuid}`;
	}
}

/**
 * Template engine for subscription URLs in button links.
 * Replaces {{subscriptionUrl}}, {{username}} placeholders.
 */
export function formatTemplate(
	template: string,
	vars: { subscriptionUrl: string; username: string }
): string {
	return template
		.replace(/\{\{subscriptionUrl\}\}/g, vars.subscriptionUrl)
		.replace(/\{\{username\}\}/g, vars.username);
}

/**
 * Parse proxy link names from the fragment identifier.
 */
export function parseLinkName(link: string): { name: string; fullLink: string } {
	const hashIndex = link.lastIndexOf('#');
	let name = 'Unknown';

	if (hashIndex !== -1) {
		const encoded = link.substring(hashIndex + 1);
		try {
			name = decodeURIComponent(encoded);
		} catch {
			name = encoded;
		}
	}

	return { name, fullLink: link };
}

/**
 * Bandwidth progress as 0-1 ratio.
 */
export function bandwidthProgress(used: string, limit: string): number {
	if (limit === '0') return 0; // unlimited
	const usedNum = parseFloat(used);
	const limitNum = parseFloat(limit);
	if (isNaN(usedNum) || isNaN(limitNum) || limitNum === 0) return 0;
	return Math.min(usedNum / limitNum, 1);
}
