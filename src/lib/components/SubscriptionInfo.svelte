<script lang="ts">
  import { subscription, config, currentLang } from '$lib/stores/subscription';
  import { formatDate, getExpirationText, bandwidthProgress } from '$lib/utils/format';
  import { t } from '$lib/utils/i18n';

  const user = $derived($subscription?.user);

  const isActive = $derived(user?.userStatus === 'ACTIVE');
  const statusText = $derived(
    $config?.baseTranslations
      ? (isActive ? t($config.baseTranslations.active) : t($config.baseTranslations.inactive))
      : (isActive ? 'Active' : 'Inactive')
  );
  const statusEmoji = $derived(isActive ? '💚' : '💔');

  const expiryText = $derived(
    user && $config?.baseTranslations ? getExpirationText(user.expiresAt, $currentLang, $config.baseTranslations) : ''
  );
  const expiryDate = $derived(
    user && $config?.baseTranslations ? formatDate(user.expiresAt, $currentLang, $config.baseTranslations) : ''
  );

  // Bandwidth progress and display
  const bandwidthDisplay = $derived(
    user
      ? !user.trafficLimit || user.trafficLimit === '0' || user.trafficLimit === '0.00 B'
        ? `${user.trafficUsed || '0 B'} / ∞`
        : `${user.trafficUsed || '0 B'} / ${user.trafficLimit}`
      : ''
  );

  const bandwidthPercent = $derived(
    user ? Math.min(100, Math.max(2, bandwidthProgress(user.trafficUsed, user.trafficLimit) * 100)) : 0
  );

  const barClass = $derived(
    bandwidthPercent > 90 ? 'danger' :
    bandwidthPercent > 70 ? 'warning' :
    'mp'
  );
</script>

{#if user}
  <section class="sub-info" style="animation: slide-up 0.3s ease both; animation-delay: 0.1s;">
    <h2 class="section-title">{#if $config?.baseTranslations}{t('playerStats')}{:else}Player Stats{/if}</h2>

    <div class="stats-grid">
      <!-- Username -->
      <div class="stat-card mint">
        <div class="stat-icon">👤</div>
        <div class="stat-text">
          <div class="stat-label">{#if $config?.baseTranslations}{t('name')}{:else}Name{/if}</div>
          <div class="stat-value">{user.username || user.shortUuid}</div>
        </div>
      </div>

      <!-- Status -->
      <div class="stat-card" class:green={isActive} class:red={!isActive}>
        <div class="stat-icon">{statusEmoji}</div>
        <div class="stat-text">
          <div class="stat-label">{#if $config?.baseTranslations}{t('status')}{:else}Status{/if}</div>
          <div class="stat-value" class:active-glow={isActive}>
            {statusText}
          </div>
        </div>
        {#if isActive}
          <div class="status-sparkle">✦</div>
        {/if}
      </div>

      <!-- Expires -->
      <div class="stat-card peach">
        <div class="stat-icon">📅</div>
        <div class="stat-text">
          <div class="stat-label">{#if $config?.baseTranslations}{t('expires')}{:else}Expires{/if}</div>
          <div class="stat-value">{expiryDate}</div>
          <div class="stat-sub">{expiryText}</div>
        </div>
      </div>

      <!-- Bandwidth -->
      <div class="stat-card cyan bandwidth-card">
        <div class="stat-icon">📊</div>
        <div class="stat-text">
          <div class="stat-label">{#if $config?.baseTranslations}{t('bandwidth')}{:else}Bandwidth{/if}</div>
          <div class="stat-value bandwidth-val">{bandwidthDisplay}</div>
          <div class="bar-wrapper">
            <div class="pixel-bar-container">
              <div
                class="pixel-bar-fill {barClass}"
                style="width: {bandwidthPercent}%"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .sub-info {
    animation: slide-up 0.3s ease both;
    animation-delay: 0.1s;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  @media (max-width: 500px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  .stat-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .stat-sub {
    font-family: var(--font-pixel);
    font-size: 7px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .active-glow {
    text-shadow: 0 0 8px rgba(105, 219, 124, 0.4);
  }

  .status-sparkle {
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 10px;
    color: var(--accent-green);
    animation: sparkle-float 2s ease-in-out infinite;
  }

  .bandwidth-card .stat-text {
    width: 100%;
  }

  .bandwidth-val {
    font-size: 10px !important;
  }

  .bar-wrapper {
    margin-top: 6px;
    width: 100%;
  }
</style>
