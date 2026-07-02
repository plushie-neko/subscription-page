/**
 * Svelte stores for subscription data and app config.
 * Mirrors the Zustand stores from the original React app.
 */
import { writable, derived } from 'svelte/store';
import type { SubscriptionInfo, SubpageConfig } from '$lib/types';

// ── Subscription Info ──
export const subscription = writable<SubscriptionInfo | null>(null);

// ── App Config ──
export const config = writable<SubpageConfig | null>(null);

// ── Current Language ──
export const currentLang = writable<string>('en');

// ── Derived: is config loaded ──
export const isConfigLoaded = derived(config, ($config) => $config !== null);

// ── Derived: translations for current language ──
export const translations = derived(
	[config, currentLang],
	([$config, $lang]) => {
		if (!$config) return {};
		const base = $config.baseTranslations;
		const flat: Record<string, string> = {};
		for (const [key, map] of Object.entries(base)) {
			flat[key] = map[$lang] ?? map['en'] ?? Object.values(map)[0] ?? '';
		}
		return flat;
	}
);

// ── Derived: available platforms with apps ──
export const availablePlatforms = derived(config, ($config) => {
	if (!$config) return [];
	return (Object.entries($config.platforms) as [string, NonNullable<SubpageConfig['platforms'][keyof SubpageConfig['platforms']]>][])
		.filter(([_, p]) => p.apps.length > 0)
		.map(([key, p]) => ({ key, ...p }));
});

// ── Actions ──
export function setLanguage(lang: string) {
	currentLang.set(lang);
	try {
		localStorage.setItem('preferred-lang', lang);
	} catch { /* SSR safe */ }
}

export function detectLanguage(supportedLocales: string[]) {
	// Check localStorage first
	try {
		const stored = localStorage.getItem('preferred-lang');
		if (stored && supportedLocales.includes(stored)) {
			currentLang.set(stored);
			return;
		}
	} catch { /* SSR safe */ }

	// Browser language detection
	if (typeof navigator !== 'undefined') {
		const browserLang = navigator.language?.split('-')[0];
		if (browserLang && supportedLocales.includes(browserLang)) {
			currentLang.set(browserLang);
			return;
		}
	}

	// Fallback to first supported locale
	if (supportedLocales.length > 0) {
		currentLang.set(supportedLocales[0]);
	}
}
