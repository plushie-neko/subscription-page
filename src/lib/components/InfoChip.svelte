<!--
  InfoChip — M3 tonal chip displaying icon + label + value.
  Used for username, status, expiry, bandwidth.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		value: string;
		color?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
		icon?: Snippet;
	}

	let { label, value, color = 'primary', icon }: Props = $props();

	const colorMap = {
		primary: 'var(--md-sys-color-primary)',
		success: 'var(--color-success)',
		danger: 'var(--color-danger)',
		warning: 'var(--color-warning)',
		info: 'var(--color-info)'
	};

	const bgMap = {
		primary: 'var(--md-sys-color-primary-container)',
		success: 'var(--color-success-container)',
		danger: 'var(--color-danger-container)',
		warning: 'var(--color-warning-container)',
		info: 'var(--color-info-container)'
	};
</script>

<div class="info-chip" style="--chip-color: {colorMap[color]}; --chip-bg: {bgMap[color]}">
	{#if icon}
		<div class="chip-icon">
			{@render icon()}
		</div>
	{/if}
	<div class="chip-content">
		<span class="chip-label">{label}</span>
		<span class="chip-value">{value}</span>
	</div>
</div>

<style>
	.info-chip {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--chip-bg);
		border-radius: var(--radius-md);
		border: 1px solid color-mix(in srgb, var(--chip-color) 20%, transparent);
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.info-chip:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--chip-color) 15%, transparent);
	}

	.chip-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--chip-color) 15%, transparent);
		color: var(--chip-color);
		flex-shrink: 0;
	}

	.chip-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.chip-label {
		font-family: var(--font-body);
		font-size: var(--text-label-sm);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--md-sys-color-on-surface-variant);
		line-height: 1;
	}

	.chip-value {
		font-family: var(--font-display);
		font-size: var(--text-body-md);
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
