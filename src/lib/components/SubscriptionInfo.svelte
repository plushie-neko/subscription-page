<script lang="ts">
  import { subscription, config, currentLang } from '$lib/stores/subscription';
  import { formatDate, getExpirationText, bandwidthProgress } from '$lib/utils/format';
  import { createTranslator } from '$lib/utils/i18n';

  const t = $derived(createTranslator($currentLang, $config?.baseTranslations));

  const user = $derived($subscription?.user);

  const isActive = $derived(user?.userStatus === 'ACTIVE');
  const statusText = $derived(
    $config?.baseTranslations
      ? (isActive ? t($config.baseTranslations.active) : t($config.baseTranslations.inactive))
      : (isActive ? 'Active' : 'Inactive')
  );

  const expiryText = $derived(
    user && $config?.baseTranslations ? getExpirationText(user.expiresAt, $currentLang, $config.baseTranslations) : ''
  );
  const expiryDate = $derived(
    user && $config?.baseTranslations ? formatDate(user.expiresAt, $currentLang, $config.baseTranslations) : ''
  );

  // Bandwidth progress and display
  const isUnlimited = $derived(
    !user?.trafficLimit || user?.trafficLimit === '0' || user?.trafficLimit === '0.00 B'
  );

  const bandwidthPercent = $derived(
    user ? Math.min(100, Math.max(2, bandwidthProgress(user.trafficUsed, user.trafficLimit) * 100)) : 0
  );

  const barClass = $derived(
    bandwidthPercent > 90 ? 'danger' :
    bandwidthPercent > 70 ? 'warning' :
    'mp'
  );

  // Get layout config from backend settings
  const blockType = $derived($config?.uiConfig?.subscriptionInfoBlockType ?? 'expanded');

  // Status icon configuration for header blocks
  const statusConfig = $derived.by(() => {
    if (user?.userStatus === 'ACTIVE' && user.daysLeft > 3) {
      return { color: 'green', icon: 'pixelarticons:check' };
    }
    if (user?.userStatus === 'ACTIVE' && user.daysLeft > 0) {
      return { color: 'yellow', icon: 'pixelarticons:alert' };
    }
    return { color: 'red', icon: 'pixelarticons:close' };
  });

  // Collapsed block toggle state
  let isExpanded = $state(false);
</script>

{#snippet statsGrid(user: any)}
  <div class="stats-grid">
    <!-- Username -->
    <div class="stat-card mint">
      <div class="stat-icon"><iconify-icon icon="pixelarticons:user"></iconify-icon></div>
      <div class="stat-text">
        <div class="stat-label">{#if $config?.baseTranslations}{t('name')}{:else}Name{/if}</div>
        <div class="stat-value">{user.username || user.shortUuid}</div>
      </div>
    </div>

    <!-- Status -->
    <div class="stat-card" class:green={isActive} class:red={!isActive}>
      <div class="stat-icon">
        <iconify-icon icon={isActive ? 'pixelarticons:heart' : 'pixelarticons:heart-broken'}></iconify-icon>
      </div>
      <div class="stat-text">
        <div class="stat-label">{#if $config?.baseTranslations}{t('status')}{:else}Status{/if}</div>
        <div class="stat-value" class:active-glow={isActive}>
          {statusText}
        </div>
      </div>
      {#if isActive}
        <div class="status-sparkle">
          <iconify-icon icon="pixelarticons:flash"></iconify-icon>
        </div>
      {/if}
    </div>

    <!-- Expires -->
    <div class="stat-card peach">
      <div class="stat-icon"><iconify-icon icon="pixelarticons:calendar"></iconify-icon></div>
      <div class="stat-text">
        <div class="stat-label">{#if $config?.baseTranslations}{t('expires')}{:else}Expires{/if}</div>
        <div class="stat-value">{expiryDate}</div>
        {#if expiryDate !== expiryText}
          <div class="stat-sub">{expiryText}</div>
        {/if}
      </div>
    </div>

    <!-- Bandwidth -->
    <div class="stat-card cyan bandwidth-card">
      <div class="stat-icon"><iconify-icon icon="pixelarticons:chart-bar"></iconify-icon></div>
      <div class="stat-text">
        <div class="stat-label">{#if $config?.baseTranslations}{t('bandwidth')}{:else}Bandwidth{/if}</div>
        <div class="stat-value bandwidth-val">
          {#if user}
            {user.trafficUsed || '0 B'} / 
            {#if isUnlimited}
              <svg class="infinity-icon" viewBox="0 0 13 6" fill="currentColor" aria-label="infinity">
                <rect x="1" y="0" width="4" height="1" />
                <rect x="8" y="0" width="4" height="1" />
                <rect x="0" y="1" width="2" height="1" />
                <rect x="4" y="1" width="2" height="1" />
                <rect x="7" y="1" width="2" height="1" />
                <rect x="11" y="1" width="2" height="1" />
                <rect x="0" y="2" width="2" height="1" />
                <rect x="5" y="2" width="3" height="1" />
                <rect x="11" y="2" width="2" height="1" />
                <rect x="0" y="3" width="2" height="1" />
                <rect x="5" y="3" width="3" height="1" />
                <rect x="11" y="3" width="2" height="1" />
                <rect x="0" y="4" width="2" height="1" />
                <rect x="4" y="4" width="2" height="1" />
                <rect x="7" y="4" width="2" height="1" />
                <rect x="11" y="4" width="2" height="1" />
                <rect x="1" y="5" width="4" height="1" />
                <rect x="8" y="5" width="4" height="1" />
              </svg>
            {:else}
              {user.trafficLimit}
            {/if}
          {/if}
        </div>
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
{/snippet}

{#if user && blockType !== 'hidden'}
  <section class="sub-info" style="animation: slide-up 0.3s ease both; animation-delay: 0.1s;">
    <h2 class="section-title">{#if $config?.baseTranslations}{t('playerStats')}{:else}Player Stats{/if}</h2>

    {#if blockType === 'cards'}
      {@render statsGrid(user)}
    {:else if blockType === 'collapsed'}
      <div class="pixel-card sub-info-card">
        <button class="card-header-btn" onclick={() => isExpanded = !isExpanded} aria-expanded={isExpanded}>
          <div class="header-left">
            <div class="status-icon-circle {statusConfig.color}">
              <iconify-icon icon={statusConfig.icon}></iconify-icon>
            </div>
            <div class="header-text">
              <div class="header-name">{user.username || user.shortUuid}</div>
              <div class="header-desc" class:expiry-warning={statusConfig.color === 'yellow'} class:expiry-danger={statusConfig.color === 'red'}>{expiryText}</div>
            </div>
          </div>
          <div class="header-right">
            <iconify-icon icon="pixelarticons:chevron-down" class="chevron" class:expanded={isExpanded}></iconify-icon>
          </div>
        </button>

        {#if isExpanded}
          <div class="collapse-content" style="animation: slide-up 0.2s ease both;">
            {@render statsGrid(user)}
          </div>
        {/if}
      </div>
    {:else if blockType === 'expanded'}
      <div class="pixel-card sub-info-card">
        <div class="card-header-static">
          <div class="header-left">
            <div class="status-icon-circle {statusConfig.color}">
              <iconify-icon icon={statusConfig.icon}></iconify-icon>
            </div>
            <div class="header-text">
              <div class="header-name">{user.username || user.shortUuid}</div>
              <div class="header-desc" class:expiry-warning={statusConfig.color === 'yellow'} class:expiry-danger={statusConfig.color === 'red'}>{expiryText}</div>
            </div>
          </div>
        </div>

        <div class="collapse-content expanded">
          {@render statsGrid(user)}
        </div>
      </div>
    {/if}
  </section>
{/if}

<style>
  .sub-info {
    animation: slide-up 0.3s ease both;
    animation-delay: 0.1s;
  }

  .sub-info-card {
    padding: 16px !important;
  }

  /* Header Button (for Collapsed) */
  .card-header-btn {
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    text-align: left;
    outline: none;
  }

  :global([dir="rtl"]) .card-header-btn {
    text-align: right;
  }

  .card-header-static {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .status-icon-circle {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 2px solid;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 2px 0 var(--shadow-color);
  }

  .status-icon-circle.green {
    background: rgba(105, 219, 124, 0.1);
    border-color: var(--accent-green);
    color: var(--accent-green);
  }

  .status-icon-circle.yellow {
    background: rgba(255, 212, 59, 0.1);
    border-color: var(--accent-yellow);
    color: var(--accent-yellow);
  }

  .status-icon-circle.red {
    background: rgba(255, 107, 107, 0.1);
    border-color: var(--accent-red);
    color: var(--accent-red);
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }

  .header-name {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-desc {
    font-size: 8px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-desc.expiry-warning {
    color: var(--accent-yellow);
  }

  .header-desc.expiry-danger {
    color: var(--accent-red);
  }

  .header-right {
    display: flex;
    align-items: center;
    padding: 0 4px;
  }

  .chevron {
    font-size: 16px;
    color: var(--text-secondary);
    transition: transform 0.2s ease;
  }

  .chevron.expanded {
    transform: rotate(180deg);
  }

  /* Collapse Content Panel */
  .collapse-content {
    margin-top: 16px;
    border-top: 2px dashed rgba(255, 255, 255, 0.08);
    padding-top: 16px;
  }

  .collapse-content.expanded {
    border-top-style: solid;
  }

  /* Stats Grid */
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
    font-size: 12px;
    color: var(--accent-green);
    animation: sparkle-float 2s ease-in-out infinite;
  }

  .bandwidth-card .stat-text {
    width: 100%;
  }

  .bandwidth-val {
    font-size: 10px !important;
  }

  .infinity-icon {
    display: inline-block;
    height: 8px;
    width: auto;
    vertical-align: middle;
    margin-left: 4px;
    position: relative;
    top: -1px;
  }

  .bar-wrapper {
    margin-top: 6px;
    width: 100%;
  }


</style>
