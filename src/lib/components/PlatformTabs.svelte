<!--
  PlatformTabs — M3 segmented button style tabs for platform selection.
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
	<div class="platform-tabs" role="tablist">
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
					<span class="tab-icon" >
						{@html svgLibrary[platform.svgIconKey]}
					</span>
				{/if}
				<span class="tab-label">{t(platform.displayName)}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.platform-tabs {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--md-sys-color-surface-container, #1e1e2e);
		border-radius: var(--radius-full);
		border: 1px solid var(--glass-border);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.platform-tabs::-webkit-scrollbar {
		display: none;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: none;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--md-sys-color-on-surface-variant);
		font-family: var(--font-body);
		font-size: var(--text-label-lg);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-normal);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.tab-btn:hover:not(.active) {
		background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
	}

	.tab-btn.active {
		background: var(--md-sys-color-secondary-container);
		color: var(--md-sys-color-on-secondary-container);
		font-weight: 600;
	}

	.tab-icon {
		display: flex;
		align-items: center;
		width: 18px;
		height: 18px;
	}

	.tab-icon :global(svg) {
		width: 18px;
		height: 18px;
	}

	.tab-label {
		line-height: 1;
	}

	@media (max-width: 480px) {
		.tab-btn {
			padding: 6px 12px;
			font-size: var(--text-label-md);
		}
	}
</style>
