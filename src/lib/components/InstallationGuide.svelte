<!--
  InstallationGuide — Platform-based installation guide with app selector + step timeline.
-->
<script lang="ts">
	import type { SubpageConfig, PlatformKey } from '$lib/types';
	import PlatformTabs from './PlatformTabs.svelte';
	import { ExternalLink, Copy, Link } from '@lucide/svelte';

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
		return link
			.replace(/\{\{subscriptionUrl\}\}/g, subscriptionUrl)
			.replace(/\{\{username\}\}/g, username);
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
						onclick={() => selectedAppIndex = i}
					>
						{#if app.featured}
							<span class="featured-dot"></span>
						{/if}
						{app.name}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Steps timeline -->
		{#if currentApp}
			<div class="blocks">
				{#each currentApp.blocks as block, blockIdx}
					<div class="block animate-in" style="animation-delay: {blockIdx * 100 + 200}ms">
						<h4 class="block-title">{t(block.title)}</h4>
						{#if block.description}
							<p class="block-desc">{t(block.description)}</p>
						{/if}

						<!-- Steps -->
						{#if block.steps.length > 0}
							<div class="steps-timeline">
								{#each block.steps as step, stepIdx}
									<div class="step">
										<div class="step-number">{stepIdx + 1}</div>
										<div class="step-line"></div>
										<p class="step-text">{t(step.text)}</p>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Buttons -->
						{#if block.buttons.length > 0}
							<div class="block-buttons">
								{#each block.buttons as button, btnIdx}
									{@const btnId = `${blockIdx}-${btnIdx}`}
									{#if button.type === 'external'}
										<a
											class="action-btn"
											href={button.link}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink size={16} />
											<span>{t(button.text)}</span>
										</a>
									{:else if button.type === 'subscriptionLink'}
										<a
											class="action-btn primary"
											href={formatLink(button.link)}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Link size={16} />
											<span>{t(button.text)}</span>
										</a>
									{:else if button.type === 'copyButton'}
										<button
											class="action-btn"
											class:copied={copied === btnId}
											onclick={() => copyWithFeedback(button.link, btnId)}
										>
											<Copy size={16} />
											<span>{copied === btnId ? '✓' : t(button.text)}</span>
										</button>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

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

	/* Blocks */
	.blocks {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.block {
		border-left: 2px solid var(--md-sys-color-outline-variant);
		padding-left: var(--space-lg);
	}

	.block-title {
		font-family: var(--font-display);
		font-size: var(--text-title-md);
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		margin: 0 0 var(--space-xs);
	}

	.block-desc {
		font-size: var(--text-body-sm);
		color: var(--md-sys-color-on-surface-variant);
		margin: 0 0 var(--space-md);
	}

	/* Steps timeline */
	.steps-timeline {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.step {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		position: relative;
	}

	.step-number {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-label-sm);
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-line {
		display: none;
	}

	.step-text {
		font-size: var(--text-body-md);
		color: var(--md-sys-color-on-surface);
		margin: 0;
		padding-top: 2px;
		line-height: 1.5;
	}

	/* Buttons */
	.block-buttons {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--md-sys-color-on-surface);
		font-family: var(--font-body);
		font-size: var(--text-label-lg);
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

	@media (max-width: 480px) {
		.installation-guide {
			padding: var(--space-md);
		}

		.guide-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.block {
			padding-left: var(--space-md);
		}
	}
</style>
