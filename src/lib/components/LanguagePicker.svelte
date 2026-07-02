<!--
  LanguagePicker — BeerCSS dropdown for locale selection.
-->
<script lang="ts">
	interface Props {
		locales: string[];
		currentLang: string;
		onchange: (lang: string) => void;
	}

	let { locales, currentLang, onchange }: Props = $props();

	const LOCALE_LABELS: Record<string, string> = {
		en: '🇬🇧 English',
		ru: '🇷🇺 Русский',
		uk: '🇺🇦 Українська',
		de: '🇩🇪 Deutsch',
		fr: '🇫🇷 Français',
		es: '🇪🇸 Español',
		zh: '🇨🇳 中文',
		ja: '🇯🇵 日本語',
		ko: '🇰🇷 한국어',
		ar: '🇸🇦 العربية',
		fa: '🇮🇷 فارسی',
		tr: '🇹🇷 Türkçe',
		pt: '🇧🇷 Português',
		it: '🇮🇹 Italiano',
	};

	function getLabel(code: string): string {
		return LOCALE_LABELS[code] ?? code.toUpperCase();
	}
</script>

{#if locales.length > 1}
	<div class="field round fill prefix suffix no-margin animate-in stagger-5 lang-picker-field">
		<i>language</i>
		<select
			value={currentLang}
			onchange={(e) => onchange(e.currentTarget.value)}
		>
			{#each locales as locale (locale)}
				<option value={locale}>{getLabel(locale)}</option>
			{/each}
		</select>
		<i>arrow_drop_down</i>
	</div>
{/if}

<style>
	.lang-picker-field {
		max-width: 220px;
		margin: 0 auto;
		background: var(--surface-container) !important;
		border: 1px solid var(--glass-border) !important;
		transition: all var(--transition-fast);
	}
	
	.lang-picker-field:hover {
		border-color: var(--outline) !important;
	}

	.lang-picker-field select {
		font-family: var(--font-body);
		font-size: var(--text-label-lg);
		color: var(--on-surface) !important;
		cursor: pointer;
	}

	.lang-picker-field option {
		background: var(--surface-container-high) !important;
		color: var(--on-surface) !important;
	}
</style>
