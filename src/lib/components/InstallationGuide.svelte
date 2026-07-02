<!--
  InstallationGuide — Renders different guides (timeline, minimal, accordion, cards)
  based on config.uiConfig.installationGuidesBlockType, styled with BeerCSS.
-->
<script lang="ts">
	import type { SubpageConfig, PlatformKey, PlatformAppButton } from '$lib/types';
	import PlatformTabs from './PlatformTabs.svelte';
	import { getColorGradient, getColorGradientSolid } from '$lib/utils/color';
	import { formatTemplate } from '$lib/utils/format';

	interface Props {
		config: SubpageConfig;
		subscriptionUrl: string;
		username: string;
		t: (key: string | Record<string, string>) => string;
	}

	let { config, subscriptionUrl, username, t }: Props = $props();

	// Determine available platforms
	let platforms = $derived(
		(Object.entries(config.platforms) as [PlatformKey, NonNullable<SubpageConfig['platforms'][PlatformKey]>][])
			.filter(([_, p]) => p && p.apps.length > 0)
			.map(([key, p]) => ({ key, ...p }))
	);

	let selectedPlatform = $state('');
	let selectedAppIndex = $state(0);

	$effect(() => {
		if (platforms.length > 0 && !selectedPlatform) {
			selectedPlatform = platforms[0].key;
		}
	});

	let currentPlatform = $derived(
		config.platforms[selectedPlatform as PlatformKey]
	);
	let currentApp = $derived(currentPlatform?.apps[selectedAppIndex] ?? currentPlatform?.apps[0]);

	function selectPlatform(key: string) {
		selectedPlatform = key;
		selectedAppIndex = 0;
	}

	function formatLink(link: string): string {
		return formatTemplate(link, { subscriptionUrl, username });
	}

	async function handleCopy(text: string) {
		try {
			await navigator.clipboard.writeText(formatLink(text));
		} catch { /* */ }
	}

	let copied = $state('');
	async function copyWithFeedback(text: string, id: string) {
		await handleCopy(text);
		copied = id;
		setTimeout(() => copied = '', 2000);
	}
</script>

{#if platforms.length > 0}
	<article class="card elevated installation-guide-card animate-in stagger-2 no-margin">
		<div class="row align-center guide-header no-space">
			<h5 class="max font-display no-margin">{t('installationGuideHeader')}</h5>
		</div>

		<PlatformTabs
			platforms={platforms}
			selected={selectedPlatform}
			svgLibrary={config.svgLibrary}
			{t}
			onselect={selectPlatform}
		/>

		<!-- App selector pills -->
		{#if currentPlatform && currentPlatform.apps.length > 1}
			<div class="row scroll no-space app-pills-row">
				{#each currentPlatform.apps as app, i (app.name)}
					<button
						class="chip"
						class:fill={i === selectedAppIndex}
						class:primary={i === selectedAppIndex}
						class:border={i !== selectedAppIndex}
						onclick={() => selectedAppIndex = i}
					>
						{#if app.featured}
							<span class="featured-dot"></span>
						{/if}
						<span>{app.name}</span>
					</button>
				{/each}
			</div>
			<div class="space"></div>
		{/if}

		<!-- Blocks container -->
		{#if currentApp}
			{@const blockType = config.uiConfig.installationGuidesBlockType || 'timeline'}

			{#if blockType === 'timeline'}
				<!-- TIMELINE LAYOUT -->
				<div class="timeline-layout">
					{#each currentApp.blocks as block, i}
						{@const gradient = getColorGradientSolid(block.svgIconColor)}
						<div class="timeline-item animate-in" style="animation-delay: {i * 80 + 100}ms">
							<div class="timeline-bullet-wrapper">
								<div
									class="timeline-bullet circle center"
									style="background: {gradient.background}; border: 1px solid {gradient.border};"
								>
									{#if config.svgLibrary[block.svgIconKey]}
										<span class="icon-wrapper">{@html config.svgLibrary[block.svgIconKey]}</span>
									{/if}
								</div>
								{#if i < currentApp.blocks.length - 1}
									<div class="timeline-line"></div>
								{/if}
							</div>
							<div class="timeline-content">
								<h6 class="block-title font-display">{@html t(block.title)}</h6>
								<p class="block-desc font-body">{@html t(block.description)}</p>
								{#if block.buttons.length > 0}
									<nav class="row block-buttons">
										{#each block.buttons as button, btnIdx}
											{@render actionButton(button, `${i}-${btnIdx}`, 'border')}
										{/each}
									</nav>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else if blockType === 'minimal'}
				<!-- MINIMAL LAYOUT -->
				<div class="minimal-layout grid no-space">
					{#each currentApp.blocks as block, i}
						{@const gradient = getColorGradient(block.svgIconColor)}
						<div class="s12 padding-xs minimal-item-cell">
							<div class="minimal-item animate-in border padding round" style="animation-delay: {i * 80 + 100}ms">
								<div class="row align-center minimal-header">
									<div
										class="minimal-icon circle center"
										style="background: {gradient.background}; border: 1px solid {gradient.border};"
									>
										{#if config.svgLibrary[block.svgIconKey]}
											<span class="icon-wrapper">{@html config.svgLibrary[block.svgIconKey]}</span>
										{/if}
									</div>
									<h6 class="block-title font-display max no-margin">{@html t(block.title)}</h6>
								</div>
								<div class="space"></div>
								<p class="block-desc font-body no-margin">{@html t(block.description)}</p>
								{#if block.buttons.length > 0}
									<div class="space"></div>
									<nav class="row block-buttons no-space">
										{#each block.buttons as button, btnIdx}
											{@render actionButton(button, `${i}-${btnIdx}`, 'transparent')}
										{/each}
									</nav>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else if blockType === 'accordion'}
				<!-- ACCORDION LAYOUT -->
				<div class="accordion-layout">
					{#each currentApp.blocks as block, i}
						{@const gradient = getColorGradient(block.svgIconColor)}
						<details class="border round accordion-details">
							<summary class="row align-center">
								<div
									class="accordion-icon circle center"
									style="background: {gradient.background}; border: 1px solid {gradient.border};"
								>
									{#if config.svgLibrary[block.svgIconKey]}
										<span class="icon-wrapper">{@html config.svgLibrary[block.svgIconKey]}</span>
									{/if}
								</div>
								<h6 class="block-title font-display max no-margin">{@html t(block.title)}</h6>
								<i>expand_more</i>
							</summary>
							<div class="accordion-body-content">
								<p class="block-desc font-body">{@html t(block.description)}</p>
								{#if block.buttons.length > 0}
									<nav class="row block-buttons">
										{#each block.buttons as button, btnIdx}
											{@render actionButton(button, `${i}-${btnIdx}`, 'border')}
										{/each}
									</nav>
								{/if}
							</div>
						</details>
					{/each}
				</div>
			{:else if blockType === 'cards'}
				<!-- CARDS LAYOUT -->
				<div class="cards-layout">
					{#each currentApp.blocks as block, i}
						{@const gradient = getColorGradient(block.svgIconColor)}
						<article class="card border round padding card-item animate-in" style="animation-delay: {i * 80 + 100}ms">
							<div class="row align-top">
								<div
									class="card-icon circle center"
									style="background: {gradient.background}; border: 1px solid {gradient.border};"
								>
									{#if config.svgLibrary[block.svgIconKey]}
										<span class="icon-wrapper">{@html config.svgLibrary[block.svgIconKey]}</span>
									{/if}
								</div>
								<div class="max card-right-box">
									<h6 class="block-title font-display no-margin">{@html t(block.title)}</h6>
									<div class="space"></div>
									<p class="block-desc font-body no-margin">{@html t(block.description)}</p>
									{#if block.buttons.length > 0}
										<div class="space"></div>
										<nav class="row block-buttons">
											{#each block.buttons as button, btnIdx}
												{@render actionButton(button, `${i}-${btnIdx}`, 'border')}
											{/each}
										</nav>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		{/if}
	</article>
{/if}

<!-- Reusable Button Snippet -->
{#snippet actionButton(button: PlatformAppButton, btnId: string, styleType: string)}
	{@const href = formatLink(button.link)}
	{#if button.type === 'external'}
		<a
			class="button {styleType} round action-btn"
			href={button.link}
			target="_blank"
			rel="noopener noreferrer"
		>
			{#if config.svgLibrary[button.svgIconKey]}
				<span class="btn-icon">{@html config.svgLibrary[button.svgIconKey]}</span>
			{:else}
				<i>open_in_new</i>
			{/if}
			<span>{t(button.text)}</span>
		</a>
	{:else if button.type === 'subscriptionLink'}
		<a
			class="button fill primary round action-btn"
			href={href}
			target="_blank"
			rel="noopener noreferrer"
		>
			{#if config.svgLibrary[button.svgIconKey]}
				<span class="btn-icon">{@html config.svgLibrary[button.svgIconKey]}</span>
			{:else}
				<i>link</i>
			{/if}
			<span>{t(button.text)}</span>
		</a>
	{:else if button.type === 'copyButton'}
		<button
			class="button {styleType} round action-btn"
			class:success-button={copied === btnId}
			onclick={() => copyWithFeedback(button.link, btnId)}
		>
			{#if copied === btnId}
				<i>check</i>
			{:else if config.svgLibrary[button.svgIconKey]}
				<span class="btn-icon">{@html config.svgLibrary[button.svgIconKey]}</span>
			{:else}
				<i>content_copy</i>
			{/if}
			<span>{copied === btnId ? t({ en: 'Copied', ru: 'Скопировано' }) : t(button.text)}</span>
		</button>
	{/if}
{/snippet}

<style>
	.installation-guide-card {
		background: var(--surface-container-low) !important;
		border-radius: var(--radius-lg) !important;
		border: 1px solid var(--glass-border) !important;
		padding: var(--space-lg) !important;
	}

	.guide-header {
		margin-bottom: var(--space-md);
	}

	.app-pills-row {
		gap: 6px;
	}

	.featured-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--tertiary);
		display: inline-block;
		margin-right: 4px;
	}

	.block-title {
		font-weight: 600;
		color: var(--on-surface);
	}

	.block-desc {
		font-size: var(--text-body-sm);
		color: var(--on-surface-variant);
		line-height: 1.6;
		margin-top: 4px;
	}

	.block-buttons {
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	.action-btn {
		font-family: var(--font-body);
		font-size: var(--text-label-md);
		font-weight: 500;
		height: auto !important;
		padding: 8px 16px !important;
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
	}

	.btn-icon :global(svg) {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		color: inherit;
		fill: currentColor;
	}

	.icon-wrapper :global(svg) {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}

	/* ── 1. Timeline Layout ── */
	.timeline-layout {
		display: flex;
		flex-direction: column;
	}

	.timeline-item {
		display: flex;
		gap: var(--space-md);
	}

	.timeline-bullet-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
	}

	.timeline-bullet {
		width: 36px;
		height: 36px;
		z-index: 2;
		color: white;
	}

	.timeline-line {
		width: 2px;
		background: var(--glass-border);
		flex: 1;
		margin: 4px 0;
	}

	.timeline-content {
		flex: 1;
		padding-bottom: var(--space-xl);
	}

	.timeline-item:last-child .timeline-content {
		padding-bottom: 0;
	}

	/* ── 2. Minimal Layout ── */
	.minimal-layout {
		margin-top: calc(-1 * var(--space-xs));
	}

	.padding-xs {
		padding: 4px !important;
	}

	.minimal-item {
		background: var(--surface-container-lowest) !important;
		border-color: var(--glass-border) !important;
		transition: all var(--transition-normal);
	}

	.minimal-item:hover {
		background: color-mix(in srgb, var(--on-surface) 3%, var(--surface-container-lowest)) !important;
	}

	.minimal-icon {
		width: 32px;
		height: 32px;
		color: white;
		flex-shrink: 0;
	}

	/* ── 3. Accordion Layout ── */
	.accordion-layout {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.accordion-details {
		background: var(--surface-container-lowest) !important;
		border-color: var(--glass-border) !important;
		transition: all var(--transition-normal);
		overflow: hidden;
	}

	.accordion-details[open] {
		background: color-mix(in srgb, var(--on-surface) 2%, var(--surface-container-lowest)) !important;
		border-color: var(--outline-variant) !important;
	}

	.accordion-details summary {
		padding: var(--space-md) !important;
		cursor: pointer;
		user-select: none;
		list-style: none;
	}

	.accordion-details summary::-webkit-details-marker {
		display: none;
	}

	.accordion-icon {
		width: 32px;
		height: 32px;
		color: white;
		flex-shrink: 0;
	}

	.accordion-body-content {
		padding: 0 var(--space-md) var(--space-md) calc(var(--space-md) + 32px + var(--space-sm));
	}

	/* ── 4. Cards Layout ── */
	.cards-layout {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.card-item {
		background: var(--surface-container-lowest) !important;
		border-color: var(--glass-border) !important;
		transition: all var(--transition-normal);
	}

	.card-item:hover {
		background: color-mix(in srgb, var(--on-surface) 3%, var(--surface-container-lowest)) !important;
		border-color: var(--outline-variant) !important;
		transform: translateY(-2px);
	}

	.card-icon {
		width: 36px;
		height: 36px;
		color: white;
		flex-shrink: 0;
	}

	.card-right-box {
		padding-left: var(--space-sm);
	}

	.success-button {
		background: var(--color-success) !important;
		color: #1a1a2e !important;
	}

	@media (max-width: 480px) {
		.installation-guide-card {
			padding: var(--space-md) !important;
		}

		.accordion-body-content {
			padding-left: var(--space-md);
		}
	}
</style>
