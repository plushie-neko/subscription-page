<!--
  Main subscription page — [shortUuid]/+page.svelte
  Assembles all components with BeerCSS styling.
-->
<script lang="ts">
	import { onMount } from 'svelte';
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

	// Handle RTL layout for Persian language
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.dir = $currentLang === 'fa' ? 'rtl' : 'ltr';
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
	<div class="error-page center-align middle-align">
		<article class="card padding error-card fill error-container">
			<h2 class="center-align">😿</h2>
			<div class="space"></div>
			<p class="center-align">Subscription not found</p>
		</article>
	</div>
{:else if $subscription && $config}
	<div class="page-wrapper">
		<!-- Background decoration (subtle gradient orbs) -->
		<div class="bg-decoration">
			<div class="bg-orb orb-1"></div>
			<div class="bg-orb orb-2"></div>
			<div class="bg-orb orb-3"></div>
		</div>

		<!-- Header -->
		<header class="fixed transparent padding-sm row align-center page-top-header">
			<div class="max brand-row row align-center">
				{#if $config.brandingSettings.logoUrl && !$config.brandingSettings.logoUrl.includes('docs.rw')}
					<img
						class="brand-logo"
						src={$config.brandingSettings.logoUrl}
						alt="Logo"
					/>
				{:else}
					<div class="brand-icon-text">✦</div>
				{/if}
				<h6 class="brand-name font-display no-margin">{$config.brandingSettings.title}</h6>
			</div>

			<div class="row align-center header-actions">
				{#if !$config.baseSettings.hideGetLinkButton}
					<button
						class="button circle border"
						onclick={() => showLinkModal = true}
						title={t('getLink')}
					>
						<i>link</i>
					</button>
				{/if}

				<SupportButton url={$config.brandingSettings.supportUrl} />
			</div>
		</header>

		<!-- Main content -->
		<main class="responsive page-content-main">
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
				<div class="row center-align lang-picker-container">
					<LanguagePicker
						locales={$config.locales}
						currentLang={$currentLang}
						onchange={setLanguage}
					/>
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
	<div class="loading-container center-align middle-align">
		<progress class="circle large"></progress>
	</div>
{/if}

<style>
	.page-wrapper {
		min-height: 100dvh;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.page-top-header {
		backdrop-filter: blur(var(--glass-blur)) !important;
		border-bottom: 1px solid var(--glass-border) !important;
		z-index: 100;
	}

	.brand-row {
		gap: var(--space-sm);
	}

	.brand-logo {
		width: 32px;
		height: 32px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.brand-icon-text {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: var(--primary);
		flex-shrink: 0;
	}

	.brand-name {
		font-weight: 800;
		color: var(--primary);
	}

	.header-actions {
		gap: var(--space-xs);
	}

	/* Main Layout Content */
	.page-content-main {
		margin-top: 72px; /* offset header height */
		padding-top: var(--space-md);
		padding-bottom: var(--space-2xl);
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		max-width: 680px !important;
	}

	.content-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.lang-picker-container {
		padding-top: var(--space-sm);
	}

	/* Background Orbs decoration */
	.bg-decoration {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: -1;
		overflow: hidden;
	}

	.bg-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.08;
	}

	.orb-1 {
		width: 400px;
		height: 400px;
		background: var(--primary);
		top: -100px;
		right: -100px;
		animation: gentle-float 8s ease-in-out infinite;
	}

	.orb-2 {
		width: 300px;
		height: 300px;
		background: var(--tertiary);
		bottom: 10%;
		left: -80px;
		animation: gentle-float 10s ease-in-out infinite reverse;
	}

	.orb-3 {
		width: 200px;
		height: 200px;
		background: var(--secondary);
		top: 40%;
		right: -50px;
		animation: gentle-float 7s ease-in-out infinite 2s;
	}

	/* Errors & Loaders */
	.error-page,
	.loading-container {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
	}

	.error-card {
		max-width: 320px;
		border-radius: var(--radius-lg);
	}
</style>
