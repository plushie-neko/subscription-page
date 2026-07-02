/**
 * Formatting utilities for dates, bytes, and subscription URLs.
 */
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

// Import locales for dayjs
import 'dayjs/locale/ru.js';
import 'dayjs/locale/zh.js';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/fa.js';
import 'dayjs/locale/uz.js';
import 'dayjs/locale/de.js';
import 'dayjs/locale/hi.js';
import 'dayjs/locale/tr.js';
import 'dayjs/locale/az.js';
import 'dayjs/locale/es.js';
import 'dayjs/locale/vi.js';
import 'dayjs/locale/ja.js';
import 'dayjs/locale/be.js';
import 'dayjs/locale/uk.js';
import 'dayjs/locale/pt.js';
import 'dayjs/locale/pl.js';
import 'dayjs/locale/id.js';
import 'dayjs/locale/tk.js';
import 'dayjs/locale/th.js';

dayjs.extend(relativeTime);

export function getLocalizedText(
	textObj: Record<string, string> | undefined,
	lang: string
): string {
	if (!textObj) return '';
	return textObj[lang] ?? textObj['en'] ?? Object.values(textObj)[0] ?? '';
}

export function getExpirationText(
	expireAt: string | null | undefined,
	currentLang: string,
	baseTranslations: Record<string, Record<string, string>>
): string {
	if (!expireAt) {
		return getLocalizedText(baseTranslations.unknown, currentLang);
	}

	const expiration = dayjs(expireAt).locale(currentLang);
	const now = dayjs();

	if (expiration.isBefore(now)) {
		return `${getLocalizedText(baseTranslations.expired, currentLang)} ${expiration.fromNow(false)}`;
	}

	if (expiration.year() === 2099) {
		return getLocalizedText(baseTranslations.indefinitely, currentLang);
	}

	return `${getLocalizedText(baseTranslations.expiresIn, currentLang)} ${expiration.fromNow(false)}`;
}

export function formatDate(
	dateStr: string | null | undefined,
	currentLang: string,
	baseTranslations: Record<string, Record<string, string>>
): string {
	if (!dateStr) {
		return getLocalizedText(baseTranslations.unknown, currentLang);
	}
	const d = dayjs(dateStr);
	if (d.year() === 2099) {
		return getLocalizedText(baseTranslations.indefinitely, currentLang);
	}
	if (currentLang === 'fa') {
		return Intl.DateTimeFormat('fa-IR', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: undefined,
			minute: undefined
		}).format(new Date(dateStr));
	}
	return dayjs(dateStr).locale(currentLang).format('DD MMMM, YYYY');
}

export function constructSubscriptionUrl(currentHref: string, shortUuid: string): string {
	try {
		const url = new URL(currentHref);
		// Remove trailing segments and rebuild with shortUuid
		const pathParts = url.pathname.split('/').filter(Boolean);
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
	if (limit === '0' || limit === '0.00 B' || !limit) return 0; // unlimited
	const usedNum = parseFloat(used);
	const limitNum = parseFloat(limit);
	if (isNaN(usedNum) || isNaN(limitNum) || limitNum === 0) return 0;
	return Math.min(usedNum / limitNum, 1);
}
