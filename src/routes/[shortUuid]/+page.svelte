<!--
  Main subscription page — [shortUuid]/+page.svelte
  Assembles all components with M3E layout.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Link, Copy } from '@lucide/svelte';
	import SubscriptionCard from '$lib/components/SubscriptionCard.svelte';
	import InstallationGuide from '$lib/components/InstallationGuide.svelte';
	import RawKeys from '$lib/components/RawKeys.svelte';
	import QrModal from '$lib/components/QrModal.svelte';
	import LanguagePicker from '$lib/components/LanguagePicker.svelte';
	import SupportButton from '$lib/components/SupportButton.svelte';
	import { subscription, config, currentLang, setLanguage, detectLanguage } from '$lib/stores/subscription';
	import { createTranslator } from '$lib/utils/i18n';
	import { constructSubscriptionUrl } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Populate stores from server data
	$effect(() => {
		if (data.subscription) subscription.set(data.subscription);
		if (data.config) config.set(data.config);
	});

	onMount(() => {
		if (data.config) {
			detectLanguage(data.config.locales);
		}
	});

	// Reactive translator
	let t = $derived(createTranslator($currentLang, $config?.baseTranslations));

	let subscriptionUrl = $derived(
		$subscription
			? constructSubscriptionUrl(typeof window !== 'undefined' ? window.location.href : '', $subscription.user.shortUuid)
			: ''
	);

	// Get Link / QR modal state
	let showLinkModal = $state(false);
	let copied = $state(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(subscriptionUrl);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch { /* */ }
	}

	// Check for errors
	let hasError = $derived('error' in data);
</script>

<svelte:head>
	<title>{$config?.baseSettings?.metaTitle ?? 'Subscription'}</title>
	<meta name="description" content={$config?.baseSettings?.metaDescription ?? 'Manage your subscription'} />
</svelte:head>

{#if hasError}
	<div class="error-page">
		<div class="error-card">
			<h1>😿</h1>
			<p>Subscription not found</p>
		</div>
	</div>
{:else if $subscription && $config}
	<div class="page">
		<!-- Background decoration -->
		<div class="bg-decoration">
			<div class="bg-orb orb-1"></div>
			<div class="bg-orb orb-2"></div>
			<div class="bg-orb orb-3"></div>
		</div>

		<!-- Header -->
		<header class="page-header">
			<div class="container">
				<div class="header-inner">
					<div class="brand">
						{#if $config.brandingSettings.logoUrl && !$config.brandingSettings.logoUrl.includes('docs.rw')}
							<img
								class="brand-logo"
								src={$config.brandingSettings.logoUrl}
								alt="Logo"
							/>
						{:else}
							<div class="brand-icon">✦</div>
						{/if}
						<h1 class="brand-name">{$config.brandingSettings.title}</h1>
					</div>

					<div class="header-actions">
						{#if !$config.baseSettings.hideGetLinkButton}
							<button
								class="link-btn"
								onclick={() => showLinkModal = true}
								title={t('getLink')}
							>
								<Link size={18} />
							</button>
						{/if}

						<SupportButton url={$config.brandingSettings.supportUrl} />
					</div>
				</div>
			</div>
		</header>

		<!-- Main content -->
		<main class="page-content">
			<div class="container">
				<div class="content-stack">
					<!-- Subscription Info Card -->
					<SubscriptionCard user={$subscription.user} {t} />

					<!-- Installation Guide -->
					<InstallationGuide
						config={$config}
						{subscriptionUrl}
						username={$subscription.user.username}
						{t}
					/>

					<!-- Raw Connection Keys -->
					{#if $config.baseSettings.showConnectionKeys}
						<RawKeys links={$subscription.links} {t} />
					{/if}

					<!-- Language Picker -->
					<div class="lang-center">
						<LanguagePicker
							locales={$config.locales}
							currentLang={$currentLang}
							onchange={setLanguage}
						/>
					</div>
				</div>
			</div>
		</main>
	</div>

	<!-- Get Link QR Modal -->
	<QrModal
		bind:open={showLinkModal}
		title={t('getLink')}
		data={subscriptionUrl}
		description={t('scanQrCodeDescription')}
		copyLabel={t('copyLink')}
		onclose={() => showLinkModal = false}
	/>
{:else}
	<!-- Loading state -->
	<div class="loading">
		<div class="loading-spinner"></div>
	</div>
{/if}

<style>
	/* ── Page Layout ── */
	.page {
		min-height: 100dvh;
		position: relative;
		overflow: hidden;
	}

	.container {
		max-width: 720px;
		margin: 0 auto;
		padding: 0 var(--space-md);
	}

	/* ── Background Decoration ── */
	.bg-decoration {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}

	.bg-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.12;
	}

	.orb-1 {
		width: 400px;
		height: 400px;
		background: var(--md-sys-color-primary);
		top: -100px;
		right: -100px;
		animation: gentle-float 8s ease-in-out infinite;
	}

	.orb-2 {
		width: 300px;
		height: 300px;
		background: var(--md-sys-color-tertiary);
		bottom: 10%;
		left: -80px;
		animation: gentle-float 10s ease-in-out infinite reverse;
	}

	.orb-3 {
		width: 200px;
		height: 200px;
		background: var(--md-sys-color-secondary);
		top: 40%;
		right: -50px;
		animation: gentle-float 7s ease-in-out infinite 2s;
	}

	/* ── Header ── */
	.page-header {
		position: relative;
		z-index: 10;
		padding: var(--space-md) 0;
		backdrop-filter: blur(var(--glass-blur));
		border-bottom: 1px solid var(--glass-border);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		user-select: none;
	}

	.brand-logo {
		width: 32px;
		height: 32px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.brand-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: var(--md-sys-color-primary);
		flex-shrink: 0;
	}

	.brand-name {
		font-family: var(--font-display);
		font-size: var(--text-title-lg);
		font-weight: 800;
		color: var(--md-sys-color-primary);
		margin: 0;
		line-height: 1;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.link-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-sm);
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		color: var(--md-sys-color-on-surface);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.link-btn:hover {
		background: color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent);
		border-color: var(--md-sys-color-primary);
		color: var(--md-sys-color-primary);
		transform: translateY(-1px);
	}

	.link-btn:active {
		transform: scale(0.95);
	}

	/* ── Main Content ── */
	.page-content {
		position: relative;
		z-index: 1;
		padding: var(--space-xl) 0 var(--space-2xl);
	}

	.content-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.lang-center {
		display: flex;
		justify-content: center;
		padding-top: var(--space-sm);
	}

	/* ── Error / Loading ── */
	.error-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.error-card {
		text-align: center;
		padding: var(--space-2xl);
	}

	.error-card h1 {
		font-size: 3rem;
		margin-bottom: var(--space-md);
	}

	.error-card p {
		color: var(--md-sys-color-on-surface-variant);
		font-size: var(--text-body-lg);
	}

	.loading {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--md-sys-color-surface-container-highest);
		border-top-color: var(--md-sys-color-primary);
		border-radius: 50%;
		animation: spin 800ms linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 480px) {
		.container {
			padding: 0 var(--space-sm);
		}

		.brand-name {
			font-size: var(--text-title-md);
		}

		.page-content {
			padding: var(--space-lg) 0 var(--space-xl);
		}

		.content-stack {
			gap: var(--space-md);
		}
	}
</style>
