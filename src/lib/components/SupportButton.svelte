<!--
  SupportButton — Header support link that detects Telegram/Discord/VK.
-->
<script lang="ts">
	import { MessageCircle } from '@lucide/svelte';

	interface Props {
		url: string;
	}

	let { url }: Props = $props();

	interface PlatformInfo {
		label: string;
		color: string;
		emoji: string;
	}

	let platform = $derived.by((): PlatformInfo => {
		if (url.includes('t.me')) return { label: 'Telegram', color: '#0088cc', emoji: '✈️' };
		if (url.includes('discord.com') || url.includes('discord.gg')) return { label: 'Discord', color: '#5865F2', emoji: '🎮' };
		if (url.includes('vk.com')) return { label: 'VK', color: '#0077FF', emoji: '💬' };
		return { label: 'Support', color: 'var(--md-sys-color-primary)', emoji: '💬' };
	});
</script>

{#if url}
	<a
		class="support-btn"
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		style="--support-color: {platform.color}"
		title={platform.label}
	>
		<MessageCircle size={18} />
	</a>
{/if}

<style>
	.support-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--support-color) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--support-color) 25%, transparent);
		color: var(--support-color);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-decoration: none;
	}

	.support-btn:hover {
		background: color-mix(in srgb, var(--support-color) 20%, transparent);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--support-color) 20%, transparent);
	}

	.support-btn:active {
		transform: scale(0.95);
	}
</style>
