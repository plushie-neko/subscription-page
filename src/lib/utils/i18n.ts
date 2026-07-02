/**
 * Translation utility — mirrors the original React useTranslation() pattern.
 * Reads translations from the subpage config, keyed by locale code.
 */
import { get } from 'svelte/store';
import { currentLang, config } from '$lib/stores/subscription';

/**
 * Translate a key or a locale map.
 * - If given a string, looks it up in `config.translations[lang]`
 * - If given a Record<string, string>, returns value for current lang (fallback to 'en', then first key)
 */
export function t(keyOrMap: string | Record<string, string>): string {
	const lang = get(currentLang);
	const cfg = get(config);

	if (typeof keyOrMap === 'string') {
		// Lookup in translations table
		const translations = cfg?.translations;
		if (!translations) return keyOrMap;
		return translations[lang]?.[keyOrMap]
			?? translations['en']?.[keyOrMap]
			?? keyOrMap;
	}

	// Locale map: { en: "...", ru: "..." }
	return keyOrMap[lang] ?? keyOrMap['en'] ?? Object.values(keyOrMap)[0] ?? '';
}

/**
 * Reactive translate — for use in Svelte components.
 * Returns a function that reads from stores reactively.
 */
export function createTranslator(lang: string, translations: Record<string, Record<string, string>> | undefined) {
	return (keyOrMap: string | Record<string, string>): string => {
		if (typeof keyOrMap === 'string') {
			if (!translations) return keyOrMap;
			return translations[lang]?.[keyOrMap]
				?? translations['en']?.[keyOrMap]
				?? keyOrMap;
		}
		return keyOrMap[lang] ?? keyOrMap['en'] ?? Object.values(keyOrMap)[0] ?? '';
	};
}
