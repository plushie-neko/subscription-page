/**
 * Translation utility — mirrors the original React useTranslation() pattern.
 * Reads translations from the subpage config baseTranslations.
 */
import { get } from 'svelte/store';
import { currentLang, config } from '$lib/stores/subscription';

/**
 * Translate a key or a locale map.
 * - If given a string, looks it up in `config.baseTranslations[key]`
 * - If given a Record<string, string>, returns value for current lang (fallback to 'en', then first key)
 */
export function t(keyOrMap: string | Record<string, string>): string {
	const lang = get(currentLang);
	const cfg = get(config);

	if (typeof keyOrMap === 'string') {
		const baseTranslations = cfg?.baseTranslations;
		if (!baseTranslations) return keyOrMap;
		const map = baseTranslations[keyOrMap];
		if (map) {
			return map[lang] ?? map['en'] ?? Object.values(map)[0] ?? keyOrMap;
		}
		return keyOrMap;
	}

	return keyOrMap[lang] ?? keyOrMap['en'] ?? Object.values(keyOrMap)[0] ?? '';
}

/**
 * Reactive translate — for use in Svelte components.
 * Returns a function that reads from config reactively.
 */
export function createTranslator(lang: string, baseTranslations: Record<string, Record<string, string>> | undefined) {
	return (keyOrMap: string | Record<string, string>): string => {
		if (typeof keyOrMap === 'string') {
			if (!baseTranslations) return keyOrMap;
			const map = baseTranslations[keyOrMap];
			if (map) {
				return map[lang] ?? map['en'] ?? Object.values(map)[0] ?? keyOrMap;
			}
			return keyOrMap;
		}
		return keyOrMap[lang] ?? keyOrMap['en'] ?? Object.values(keyOrMap)[0] ?? '';
	};
}
