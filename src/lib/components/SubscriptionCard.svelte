<!--
  SubscriptionCard — Hero card with user info, status, bandwidth progress ring.
  Rebuilt with BeerCSS article.card classes.
-->
<script lang="ts">
	import type { SubscriptionUser } from '$lib/types';
	import InfoChip from './InfoChip.svelte';
	import { getExpirationText } from '$lib/utils/format';
	import { currentLang, config } from '$lib/stores/subscription';

	interface Props {
		user: SubscriptionUser;
		t: (key: string | Record<string, string>) => string;
	}

	let { user, t }: Props = $props();

	let isActive = $derived(user.userStatus === 'ACTIVE');
	let statusText = $derived(
		$config?.baseTranslations
			? (isActive ? t($config.baseTranslations.active) : t($config.baseTranslations.inactive))
			: (isActive ? 'Active' : 'Inactive')
	);
	let statusColor = $derived(isActive ? 'success' as const : 'danger' as const);

	let bandwidthValue = $derived(
		!user.trafficLimit || user.trafficLimit === '0' || user.trafficLimit === '0.00 B'
			? `${user.trafficUsed || '0 B'} / ∞`
			: `${user.trafficUsed || '0 B'} / ${user.trafficLimit}`
	);

	// Bandwidth progress for ring
	let progress = $derived(() => {
		if (!user.trafficLimit || user.trafficLimit === '0' || user.trafficLimit === '0.00 B') return 0;
		const used = parseFloat(user.trafficUsed || '0');
		const limit = parseFloat(user.trafficLimit);
		if (isNaN(used) || isNaN(limit) || limit === 0) return 0;
		return Math.min(used / limit, 1);
	});

	let ringCircumference = 2 * Math.PI * 42;
	let ringOffset = $derived(ringCircumference - progress() * ringCircumference);

	// Reactive relative expiration text
	let expirationText = $derived(
		$config?.baseTranslations
			? getExpirationText(user.expiresAt, $currentLang, $config.baseTranslations)
			: 'Unknown'
	);
</script>

<article class="card elevated hero-subscription-card animate-in stagger-1 no-margin">
	<!-- Hero header with user info & bandwidth progress -->
	<div class="row align-center card-hero-header">
		<div class="status-indicator-circle center circle" class:active={isActive} class:inactive={!isActive}>
			<i>{isActive ? 'check' : 'close'}</i>
		</div>
		
		<div class="max column align-start no-space user-details-box">
			<h4 class="username font-display no-margin truncate">{user.username || user.shortUuid || 'User'}</h4>
			<p class="expiry-label font-body no-margin truncate" class:expired={user.userStatus === 'EXPIRED' || user.daysLeft <= 0}>
				{expirationText}
			</p>
		</div>

		<!-- Bandwidth ring -->
		<div class="bandwidth-ring-box" title={bandwidthValue}>
			<svg viewBox="0 0 100 100">
				<circle
					class="ring-bg"
					cx="50" cy="50" r="42"
					fill="none"
					stroke-width="6"
				/>
				<circle
					class="ring-fill ring-animate"
					cx="50" cy="50" r="42"
					fill="none"
					stroke-width="6"
					stroke-dasharray={ringCircumference}
					stroke-dashoffset={ringOffset}
					stroke-linecap="round"
					transform="rotate(-90 50 50)"
					style="--ring-circumference: {ringCircumference}; --ring-offset: {ringOffset}"
				/>
			</svg>
			<div class="ring-label-icon">
				<i>speed</i>
			</div>
		</div>
	</div>

	<div class="space"></div>

	<!-- Info chips grid -->
	<div class="grid no-space">
		<div class="s12 m6 padding-xs">
			<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.name) : 'Username'} value={user.username || user.shortUuid || 'User'} color="primary">
				{#snippet icon()}<i>person</i>{/snippet}
			</InfoChip>
		</div>

		<div class="s12 m6 padding-xs">
			<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.status) : 'Status'} value={statusText} color={statusColor}>
				{#snippet icon()}
					<i>{isActive ? 'check' : 'close'}</i>
				{/snippet}
			</InfoChip>
		</div>

		<div class="s12 m6 padding-xs">
			<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.expires) : 'Expires'} value={expirationText} color="warning">
				{#snippet icon()}<i>calendar_today</i>{/snippet}
			</InfoChip>
		</div>

		<div class="s12 m6 padding-xs">
			<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.bandwidth) : 'Bandwidth'} value={bandwidthValue} color="info">
				{#snippet icon()}<i>swap_vert</i>{/snippet}
			</InfoChip>
		</div>
	</div>
</article>

<style>
	.hero-subscription-card {
		background: var(--surface-container-low) !important;
		border-radius: var(--radius-lg) !important;
		border: 1px solid var(--glass-border) !important;
		padding: var(--space-lg) !important;
		position: relative;
		overflow: hidden;
	}

	.hero-subscription-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100px;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--primary) 8%, transparent),
			color-mix(in srgb, var(--tertiary) 5%, transparent)
		);
		pointer-events: none;
	}

	.card-hero-header {
		position: relative;
		z-index: 1;
	}

	.status-indicator-circle {
		width: 44px;
		height: 44px;
		flex-shrink: 0;
	}

	.status-indicator-circle.active {
		background: var(--color-success-container);
		color: var(--color-success);
		animation: gentle-pulse 2s ease-in-out infinite;
	}

	.status-indicator-circle.inactive {
		background: var(--color-danger-container);
		color: var(--color-danger);
	}

	.user-details-box {
		padding-left: var(--space-xs);
	}

	.username {
		font-weight: 700;
		color: var(--on-surface);
	}

	.expiry-label {
		font-size: var(--text-body-sm);
		color: var(--on-surface-variant);
		font-weight: 500;
		margin-top: 2px;
	}

	.expiry-label.expired {
		color: var(--color-danger);
	}

	.bandwidth-ring-box {
		width: 56px;
		height: 56px;
		position: relative;
		flex-shrink: 0;
	}

	.bandwidth-ring-box svg {
		width: 100%;
		height: 100%;
	}

	.ring-bg {
		stroke: var(--surface-container-highest);
	}

	.ring-fill {
		stroke: var(--primary);
		transition: stroke-dashoffset 1s cubic-bezier(0.2, 0, 0, 1);
	}

	.ring-label-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: var(--primary);
		display: flex;
	}

	.ring-label-icon i {
		font-size: 16px;
	}

	.padding-xs {
		padding: 4px !important;
	}

	@media (max-width: 480px) {
		.hero-subscription-card {
			padding: var(--space-md) !important;
		}

		.bandwidth-ring-box {
			width: 44px;
			height: 44px;
		}
	}
</style>
