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
	<div class="tabs scroll center-align platform-tabs-bar">
		{#each platforms as platform (platform.key)}
			{@const isActive = platform.key === selected}
			<a
				href="##"
				class:active={isActive}
				onclick={(e) => {
					e.preventDefault();
					onselect(platform.key);
				}}
			>
				{#if svgLibrary[platform.svgIconKey]}
					<span class="tab-icon-wrapper" class:active={isActive}>
						{@html svgLibrary[platform.svgIconKey]}
					</span>
				{/if}
				<span>{t(platform.displayName)}</span>
			</a>
		{/each}
	</div>
{/if}

<style>
	.platform-tabs-bar {
		border-block-end: 1px solid var(--glass-border) !important;
		margin-bottom: var(--space-md);
		justify-content: center !important;
	}

	.tab-icon-wrapper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		color: var(--on-surface-variant);
	}

	.tab-icon-wrapper :global(svg) {
		width: 20px;
		height: 20px;
		fill: currentColor;
	}

	.tab-icon-wrapper.active {
		color: var(--primary);
	}
</style>
