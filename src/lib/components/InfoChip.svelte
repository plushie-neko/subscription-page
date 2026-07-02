<!--
  InfoChip — BeerCSS row component displaying icon + label + value.
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
		primary: 'var(--primary)',
		success: 'var(--color-success)',
		danger: 'var(--color-danger)',
		warning: 'var(--color-warning)',
		info: 'var(--color-info)'
	};

	const bgMap = {
		primary: 'var(--primary-container)',
		success: 'var(--color-success-container)',
		danger: 'var(--color-danger-container)',
		warning: 'var(--color-warning-container)',
		info: 'var(--color-info-container)'
	};

	const onColorMap = {
		primary: 'var(--on-primary-container)',
		success: 'var(--color-success)',
		danger: 'var(--color-danger)',
		warning: 'var(--color-warning)',
		info: 'var(--color-info)'
	};
</script>

<div
	class="info-row row align-center padding border round"
	style="--row-bg: {bgMap[color]}; --row-border: {colorMap[color]}; --row-text: {onColorMap[color]}"
>
	{#if icon}
		<div class="row-icon circle center">
			{@render icon()}
		</div>
	{/if}
	<div class="max column align-start no-space">
		<div class="row-label font-body truncate">{label}</div>
		<div class="row-value font-display truncate">{value}</div>
	</div>
</div>

<style>
	.info-row {
		background: var(--row-bg) !important;
		border-color: color-mix(in srgb, var(--row-border) 25%, transparent) !important;
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.info-row:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--row-border) 15%, transparent);
	}

	.row-icon {
		width: 36px;
		height: 36px;
		background: color-mix(in srgb, var(--row-border) 12%, transparent);
		color: var(--row-border);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.row-label {
		font-size: var(--text-label-sm);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.8;
		color: var(--row-text);
	}

	.row-value {
		font-size: var(--text-body-md);
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
