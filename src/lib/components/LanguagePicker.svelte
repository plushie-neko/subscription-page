<!--
  LanguagePicker — M3 dropdown for locale selection with flags.
-->
<script lang="ts">
	import { Globe } from '@lucide/svelte';

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
	<div class="lang-picker animate-in stagger-5">
		<Globe size={16} />
		<select
			class="lang-select"
			value={currentLang}
			onchange={(e) => onchange(e.currentTarget.value)}
		>
			{#each locales as locale (locale)}
				<option value={locale}>{getLabel(locale)}</option>
			{/each}
		</select>
	</div>
{/if}

<style>
	.lang-picker {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: 6px 12px;
		background: var(--md-sys-color-surface-container, #1e1e2e);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-full);
		color: var(--md-sys-color-on-surface-variant);
		transition: all var(--transition-fast);
	}

	.lang-picker:hover {
		border-color: var(--md-sys-color-outline);
	}

	.lang-select {
		background: transparent;
		border: none;
		color: var(--md-sys-color-on-surface);
		font-family: var(--font-body);
		font-size: var(--text-label-lg);
		cursor: pointer;
		outline: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		padding-right: 4px;
	}

	.lang-select option {
		background: var(--md-sys-color-surface-container-high);
		color: var(--md-sys-color-on-surface);
	}
</style>
