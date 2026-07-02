<!--
  PlatformTabs — BeerCSS tabs for platform selection.
-->
<script lang="ts">
	interface PlatformOption {
		key: string;
		displayName: Record<string, string>;
		svgIconKey: string;
	}

	interface Props {
		platforms: PlatformOption[];
		selected: string;
		svgLibrary: Record<string, string>;
		t: (key: string | Record<string, string>) => string;
		onselect: (key: string) => void;
	}

	let { platforms, selected, svgLibrary, t, onselect }: Props = $props();
</script>

{#if platforms.length > 1}
	<div class="scroll tabs platform-tabs-nav">
		{#each platforms as platform (platform.key)}
			{@const isActive = platform.key === selected}
			<button
				class="tab-btn"
				class:active={isActive}
				role="tab"
				aria-selected={isActive}
				onclick={() => onselect(platform.key)}
			>
				{#if svgLibrary[platform.svgIconKey]}
					<span class="tab-icon" class:active-icon={isActive}>
						{@html svgLibrary[platform.svgIconKey]}
					</span>
				{/if}
				<span>{t(platform.displayName)}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.platform-tabs-nav {
		background: transparent !important;
		border-bottom: 1px solid var(--glass-border) !important;
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-md);
	}

	.tab-btn {
		background: transparent !important;
		border: none !important;
		color: var(--on-surface-variant) !important;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-md) var(--space-lg) !important;
		cursor: pointer;
		font-family: var(--font-body);
		font-size: var(--text-label-lg);
		font-weight: 500;
		transition: all var(--transition-fast);
		border-bottom: 2px solid transparent !important;
		border-radius: 0 !important;
		height: auto !important;
	}

	.tab-btn:hover:not(.active) {
		color: var(--on-surface) !important;
		background: color-mix(in srgb, var(--on-surface) 6%, transparent) !important;
	}

	.tab-btn.active {
		color: var(--primary) !important;
		border-bottom-color: var(--primary) !important;
		font-weight: 600;
	}

	.tab-icon {
		display: inline-flex;
		align-items: center;
		width: 18px;
		height: 18px;
		fill: var(--on-surface-variant);
	}

	.tab-icon :global(svg) {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}

	.tab-btn.active .tab-icon {
		fill: var(--primary);
	}
</style>
