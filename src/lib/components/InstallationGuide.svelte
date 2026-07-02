<!--
  InstallationGuide — Renders different guides (timeline, minimal, accordion, cards)
  based on config.uiConfig.installationGuidesBlockType, pulling icons from svgLibrary.
-->
<script lang="ts">
	import type { SubpageConfig, PlatformKey, PlatformAppButton } from '$lib/types';
	import PlatformTabs from './PlatformTabs.svelte';
	import { ExternalLink, Copy, Link } from '@lucide/svelte';
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
	let openAccordion = $state(0);

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
		openAccordion = 0;
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

	function toggleAccordion(index: number) {
		if (openAccordion === index) {
			openAccordion = -1;
		} else {
			openAccordion = index;
		}
		
		// Vibration feedback matching original app
		if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
			try {
				navigator.vibrate(10);
			} catch { /* */ }
		}
	}
</script>

{#if platforms.length > 0}
	<div class="installation-guide animate-in stagger-2">
		<div class="guide-header">
			<h3 class="guide-title">{t('installationGuideHeader')}</h3>
			<PlatformTabs
				platforms={platforms}
				selected={selectedPlatform}
				svgLibrary={config.svgLibrary}
				{t}
				onselect={selectPlatform}
			/>
		</div>

		<!-- App selector pills -->
		{#if currentPlatform && currentPlatform.apps.length > 1}
			<div class="app-pills">
				{#each currentPlatform.apps as app, i (app.name)}
					<button
						class="app-pill"
						class:active={i === selectedAppIndex}
						class:featured={app.featured}
						onclick={() => { selectedAppIndex = i; openAccordion = 0; }}
					>
						{#if app.featured}
							<span class="featured-dot"></span>
						{/if}
						{app.name}
					</button>
				{/each}
			</div>
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
									class="timeline-bullet"
									style="background: {gradient.background}; border: {gradient.border}; box-shadow: {gradient.boxShadow || 'none'};"
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
								<h4 class="block-title">{@html t(block.title)}</h4>
								<p class="block-desc">{@html t(block.description)}</p>
								{#if block.buttons.length > 0}
									<div class="block-buttons">
										{#each block.buttons as button, btnIdx}
											{@render actionButton(button, `${i}-${btnIdx}`, 'light')}
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else if blockType === 'minimal'}
				<!-- MINIMAL LAYOUT -->
				<div class="minimal-layout">
					{#each currentApp.blocks as block, i}
						{@const gradient = getColorGradient(block.svgIconColor)}
						<div class="minimal-item animate-in" style="animation-delay: {i * 80 + 100}ms">
							<div class="minimal-header">
								<div
									class="minimal-icon"
									style="background: {gradient.background}; border: {gradient.border};"
								>
									{#if config.svgLibrary[block.svgIconKey]}
										<span class="icon-wrapper">{@html config.svgLibrary[block.svgIconKey]}</span>
									{/if}
								</div>
								<h4 class="block-title">{@html t(block.title)}</h4>
							</div>
							<p class="block-desc">{@html t(block.description)}</p>
							{#if block.buttons.length > 0}
								<div class="block-buttons minimal-buttons">
									{#each block.buttons as button, btnIdx}
										{@render actionButton(button, `${i}-${btnIdx}`, 'subtle')}
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else if blockType === 'accordion'}
				<!-- ACCORDION LAYOUT -->
				<div class="accordion-layout">
					{#each currentApp.blocks as block, i}
						{@const gradient = getColorGradient(block.svgIconColor)}
						{@const isOpen = openAccordion === i}
						<div class="accordion-item" class:open={isOpen}>
							<button
								class="accordion-header"
								onclick={() => toggleAccordion(i)}
								aria-expanded={isOpen}
							>
								<div class="accordion-header-left">
									<div
										class="accordion-icon"
										style="background: {gradient.background}; border: {gradient.border};"
									>
										{#if config.svgLibrary[block.svgIconKey]}
											<span class="icon-wrapper">{@html config.svgLibrary[block.svgIconKey]}</span>
										{/if}
									</div>
									<h4 class="block-title">{@html t(block.title)}</h4>
								</div>
								<svg class="chevron" class:rotate={isOpen} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
							</button>
							{#if isOpen}
								<div class="accordion-content">
									<p class="block-desc">{@html t(block.description)}</p>
									{#if block.buttons.length > 0}
										<div class="block-buttons">
											{#each block.buttons as button, btnIdx}
												{@render actionButton(button, `${i}-${btnIdx}`, 'light')}
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else if blockType === 'cards'}
				<!-- CARDS LAYOUT -->
				<div class="cards-layout">
					{#each currentApp.blocks as block, i}
						{@const gradient = getColorGradient(block.svgIconColor)}
						<div class="card-item animate-in" style="animation-delay: {i * 80 + 100}ms">
							<div class="card-left">
								<div
									class="card-icon"
									style="background: {gradient.background}; border: {gradient.border};"
								>
									{#if config.svgLibrary[block.svgIconKey]}
										<span class="icon-wrapper">{@html config.svgLibrary[block.svgIconKey]}</span>
									{/if}
								</div>
							</div>
							<div class="card-right">
								<h4 class="block-title">{@html t(block.title)}</h4>
								<p class="block-desc">{@html t(block.description)}</p>
								{#if block.buttons.length > 0}
									<div class="block-buttons">
										{#each block.buttons as button, btnIdx}
											{@render actionButton(button, `${i}-${btnIdx}`, 'light')}
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
{/if}

<!-- Reusable Button Snippet -->
{#snippet actionButton(button: PlatformAppButton, btnId: string, styleType: string)}
	{@const href = formatLink(button.link)}
	{#if button.type === 'external'}
		<a
			class="action-btn {styleType}"
			href={button.link}
			target="_blank"
			rel="noopener noreferrer"
		>
			{#if config.svgLibrary[button.svgIconKey]}
				<span class="btn-icon">{@html config.svgLibrary[button.svgIconKey]}</span>
			{:else}
				<ExternalLink size={16} />
			{/if}
			<span>{t(button.text)}</span>
		</a>
	{:else if button.type === 'subscriptionLink'}
		<a
			class="action-btn primary"
			href={href}
			target="_blank"
			rel="noopener noreferrer"
		>
			{#if config.svgLibrary[button.svgIconKey]}
				<span class="btn-icon">{@html config.svgLibrary[button.svgIconKey]}</span>
			{:else}
				<Link size={16} />
			{/if}
			<span>{t(button.text)}</span>
		</a>
	{:else if button.type === 'copyButton'}
		<button
			class="action-btn {styleType}"
			class:copied={copied === btnId}
			onclick={() => copyWithFeedback(button.link, btnId)}
		>
			{#if copied === btnId}
				<span class="btn-icon">✓</span>
			{:else if config.svgLibrary[button.svgIconKey]}
				<span class="btn-icon">{@html config.svgLibrary[button.svgIconKey]}</span>
			{:else}
				<Copy size={16} />
			{/if}
			<span>{copied === btnId ? t({ en: 'Copied', ru: 'Скопировано' }) : t(button.text)}</span>
		</button>
	{/if}
{/snippet}

<style>
	.installation-guide {
		background: var(--md-sys-color-surface-container-low, #1e1e2e);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 1px solid var(--glass-border);
	}

	.guide-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		flex-wrap: wrap;
	}

	.guide-title {
		font-family: var(--font-display);
		font-size: var(--text-title-lg);
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
		margin: 0;
	}

	/* App pills */
	.app-pills {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
		flex-wrap: wrap;
	}

	.app-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 16px;
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--md-sys-color-on-surface-variant);
		font-family: var(--font-body);
		font-size: var(--text-label-md);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.app-pill:hover {
		border-color: var(--md-sys-color-primary);
		color: var(--md-sys-color-primary);
	}

	.app-pill.active {
		background: var(--md-sys-color-primary-container);
		border-color: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary-container);
		font-weight: 600;
	}

	.featured-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--md-sys-color-tertiary);
	}

	/* Reusable components elements */
	.block-title {
		font-family: var(--font-display);
		font-size: var(--text-title-md);
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		margin: 0 0 6px;
	}

	.block-desc {
		font-size: var(--text-body-sm);
		color: var(--md-sys-color-on-surface-variant);
		margin: 0 0 12px;
		line-height: 1.6;
	}

	.block-buttons {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		margin-top: var(--space-xs);
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-full);
		background: var(--glass-bg);
		color: var(--md-sys-color-on-surface);
		font-family: var(--font-body);
		font-size: var(--text-label-md);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		text-decoration: none;
	}

	.action-btn:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
		border-color: var(--md-sys-color-primary);
		color: var(--md-sys-color-primary);
		transform: translateY(-1px);
	}

	.action-btn:active {
		transform: scale(0.97);
	}

	.action-btn.primary {
		background: var(--md-sys-color-primary-container);
		border-color: transparent;
		color: var(--md-sys-color-on-primary-container);
		font-weight: 600;
	}

	.action-btn.primary:hover {
		filter: brightness(1.1);
	}

	.action-btn.copied {
		background: var(--color-success-container);
		border-color: var(--color-success);
		color: var(--color-success);
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
	}

	.btn-icon :global(svg) {
		width: 16px;
		height: 16px;
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		color: inherit;
	}

	.icon-wrapper :global(svg) {
		width: 18px;
		height: 18px;
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
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		z-index: 2;
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
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.minimal-item {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		transition: all var(--transition-normal);
	}

	.minimal-item:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.minimal-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-xs);
	}

	.minimal-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.minimal-header .block-title {
		margin: 0;
	}

	.minimal-buttons {
		margin-top: var(--space-sm);
	}

	/* ── 3. Accordion Layout ── */
	.accordion-layout {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.accordion-item {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		transition: all var(--transition-normal);
	}

	.accordion-item.open {
		background: rgba(255, 255, 255, 0.04);
		border-color: var(--md-sys-color-outline-variant);
	}

	.accordion-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		color: var(--md-sys-color-on-surface);
	}

	.accordion-header-left {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
		flex: 1;
	}

	.accordion-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.accordion-header .block-title {
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.chevron {
		transition: transform var(--transition-normal);
		color: var(--md-sys-color-on-surface-variant);
		flex-shrink: 0;
	}

	.chevron.rotate {
		transform: rotate(180deg);
	}

	.accordion-content {
		padding: 0 var(--space-md) var(--space-md) calc(var(--space-md) + 32px + var(--space-sm));
	}

	/* ── 4. Cards Layout ── */
	.cards-layout {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.card-item {
		display: flex;
		gap: var(--space-md);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		transition: all var(--transition-normal);
	}

	.card-item:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--md-sys-color-outline-variant);
		transform: translateY(-1px);
	}

	.card-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.card-right {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 480px) {
		.installation-guide {
			padding: var(--space-md);
		}

		.guide-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.accordion-content {
			padding-left: var(--space-md);
		}
	}
</style>
