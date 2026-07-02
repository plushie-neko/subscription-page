<!--
  SupportButton — BeerCSS circle button for support platforms.
-->
<script lang="ts">
	interface Props {
		url: string;
	}

	let { url }: Props = $props();

	interface PlatformInfo {
		label: string;
		color: string;
		icon: string;
	}

	let platform = $derived.by((): PlatformInfo => {
		if (url.includes('t.me')) return { label: 'Telegram', color: '#0088cc', icon: 'send' };
		if (url.includes('discord.com') || url.includes('discord.gg')) return { label: 'Discord', color: '#5865F2', icon: 'sports_esports' };
		if (url.includes('vk.com')) return { label: 'VK', color: '#0077FF', icon: 'chat' };
		return { label: 'Support', color: 'var(--primary)', icon: 'contact_support' };
	});
</script>

{#if url}
	<a
		class="button circle"
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		style="--support-color: {platform.color}"
		title={platform.label}
	>
		<i>{platform.icon}</i>
	</a>
{/if}

<style>
	a.button.circle {
		background: color-mix(in srgb, var(--support-color) 12%, transparent) !important;
		border: 1px solid color-mix(in srgb, var(--support-color) 25%, transparent) !important;
		color: var(--support-color) !important;
		transition: all var(--transition-fast);
	}

	a.button.circle:hover {
		background: color-mix(in srgb, var(--support-color) 20%, transparent) !important;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--support-color) 20%, transparent);
	}
</style>
