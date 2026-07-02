<!--
  SubscriptionCard — Hero card with user info, status, bandwidth progress ring.
  M3E elevated card with glassmorphism and cute animations.
-->
<script lang="ts">
	import type { SubscriptionUser } from '$lib/types';
	import InfoChip from './InfoChip.svelte';
	import { User, Check, X, Calendar, ArrowUpDown, Activity } from '@lucide/svelte';
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

<div class="subscription-card animate-in stagger-1">
	<!-- Header with status glow -->
	<div class="card-header">
		<div class="user-info">
			<div class="status-indicator" class:active={isActive} class:inactive={!isActive}>
				{#if isActive}
					<Check size={20} />
				{:else}
					<X size={20} />
				{/if}
			</div>
			<div class="user-details">
				<h2 class="username">{user.username || user.shortUuid || 'User'}</h2>
				<span class="expiry-text" class:expired={user.userStatus === 'EXPIRED' || user.daysLeft <= 0}>
					{expirationText}
				</span>
			</div>
		</div>

		<!-- Bandwidth ring -->
		<div class="bandwidth-ring" title="{bandwidthValue}">
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
			<div class="ring-label">
				<Activity size={14} />
			</div>
		</div>
	</div>

	<!-- Info chips grid -->
	<div class="chips-grid">
		<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.name) : 'Username'} value={user.username || user.shortUuid || 'User'} color="primary">
			{#snippet icon()}<User size={16} />{/snippet}
		</InfoChip>

		<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.status) : 'Status'} value={statusText} color={statusColor}>
			{#snippet icon()}
				{#if isActive}<Check size={16} />{:else}<X size={16} />{/if}
			{/snippet}
		</InfoChip>

		<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.expires) : 'Expires'} value={expirationText} color="warning">
			{#snippet icon()}<Calendar size={16} />{/snippet}
		</InfoChip>

		<InfoChip label={$config?.baseTranslations ? t($config.baseTranslations.bandwidth) : 'Bandwidth'} value={bandwidthValue} color="info">
			{#snippet icon()}<ArrowUpDown size={16} />{/snippet}
		</InfoChip>
	</div>
</div>

<style>
	.subscription-card {
		background: var(--md-sys-color-surface-container-low, #1e1e2e);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 1px solid var(--glass-border);
		position: relative;
		overflow: hidden;
	}

	/* Subtle gradient overlay */
	.subscription-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 120px;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent),
			color-mix(in srgb, var(--md-sys-color-tertiary) 5%, transparent)
		);
		pointer-events: none;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-lg);
		position: relative;
		z-index: 1;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		min-width: 0;
		flex: 1;
	}

	.status-indicator {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all var(--transition-normal);
	}

	.status-indicator.active {
		background: var(--color-success-container);
		color: var(--color-success);
		animation: gentle-pulse 2s ease-in-out infinite;
	}

	.status-indicator.inactive {
		background: var(--color-danger-container);
		color: var(--color-danger);
	}

	.user-details {
		min-width: 0;
		flex: 1;
	}

	.username {
		font-family: var(--font-display);
		font-size: var(--text-title-lg);
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.3;
	}

	.expiry-text {
		font-size: var(--text-body-sm);
		color: var(--md-sys-color-on-surface-variant);
		font-weight: 500;
	}

	.expiry-text.expired {
		color: var(--color-danger);
	}

	/* Bandwidth ring */
	.bandwidth-ring {
		width: 56px;
		height: 56px;
		position: relative;
		flex-shrink: 0;
	}

	.bandwidth-ring svg {
		width: 100%;
		height: 100%;
	}

	.ring-bg {
		stroke: var(--md-sys-color-surface-container-highest, #333);
	}

	.ring-fill {
		stroke: var(--md-sys-color-primary);
		transition: stroke-dashoffset 1s cubic-bezier(0.2, 0, 0, 1);
	}

	.ring-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: var(--md-sys-color-primary);
		display: flex;
	}

	/* Chips grid */
	.chips-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-sm);
		position: relative;
		z-index: 1;
	}

	@media (max-width: 480px) {
		.chips-grid {
			grid-template-columns: 1fr;
		}

		.subscription-card {
			padding: var(--space-md);
		}

		.username {
			font-size: var(--text-title-md);
		}

		.bandwidth-ring {
			width: 44px;
			height: 44px;
		}
	}
</style>
