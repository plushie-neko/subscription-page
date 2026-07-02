<script lang="ts">
  import { config, currentLang, subscription } from '$lib/stores/subscription';
  import { createTranslator } from '$lib/utils/i18n';

  const t = $derived(createTranslator($currentLang, $config?.baseTranslations));
  import { constructSubscriptionUrl } from '$lib/utils/format';
  import { theme, useDeviceAccent, toggleTheme, toggleDeviceAccent } from '$lib/stores/theme';
  import { renderSVG } from 'uqr';

  let showQrModal = $state(false);
  let copySuccess = $state(false);

  const brandName = $derived($config?.brandingSettings?.title ?? 'NyaVPN');
  const supportUrl = $derived($config?.brandingSettings?.supportUrl ?? '');
  const hideGetLink = $derived($config?.baseSettings?.hideGetLinkButton ?? false);

  const subscriptionUrl = $derived(
    $subscription
      ? constructSubscriptionUrl(typeof window !== 'undefined' ? window.location.href : '', $subscription.user.shortUuid)
      : ''
  );

  function handleGetLink() {
    showQrModal = true;
  }

  function closeModal() {
    showQrModal = false;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      copySuccess = true;
      setTimeout(() => { copySuccess = false; }, 2000);
    } catch {}
  }

  function getSupportIcon(url: string): string {
    if (url.includes('t.me')) return '💬';
    if (url.includes('discord')) return '🎮';
    return '💭';
  }

  const qrSvg = $derived(
    subscriptionUrl
      ? renderSVG(subscriptionUrl, {
          whiteColor: '#141627',
          blackColor: '#7efcca'
        })
      : ''
  );
</script>

<header class="header">
  <div class="header-inner container">
    <div class="brand">
      <div class="logo-icon">🐱</div>
      <span class="brand-name">{brandName}</span>
    </div>

    <div class="header-actions">
      <!-- Device Accent Toggle -->
      <button 
        class="icon-btn header-btn" 
        class:active={$useDeviceAccent}
        onclick={toggleDeviceAccent} 
        title="Match Device Accent Color"
      >
        🎨
      </button>

      <!-- Theme Toggle -->
      <button 
        class="icon-btn header-btn" 
        onclick={toggleTheme} 
        title="Toggle Theme"
      >
        {$theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {#if !hideGetLink}
        <button class="icon-btn header-btn" onclick={handleGetLink} title="Get subscription link">
          🔗
        </button>
      {/if}

      {#if supportUrl}
        <a class="icon-btn header-btn" href={supportUrl} target="_blank" rel="noopener noreferrer" title="Support">
          {getSupportIcon(supportUrl)}
        </a>
      {/if}
    </div>
  </div>
</header>

{#if showQrModal}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-overlay" onclick={closeModal}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header-row">
        <h3 class="modal-title">✨ {#if $config?.baseTranslations}{t('getLink')}{:else}Subscription Link{/if}</h3>
        <button class="close-btn" onclick={closeModal}>✕</button>
      </div>

      {#if qrSvg}
        <div class="qr-frame">
          {@html qrSvg}
        </div>
      {/if}

      <p class="qr-hint">
        {#if $config?.baseTranslations}{t('scanQrCodeDescription')}{:else}Scan to import your subscription, nya~{/if}
      </p>

      <button class="pixel-btn primary copy-link-btn" onclick={handleCopy}>
        {#if copySuccess}
          ✅ {#if $config?.baseTranslations}{t('linkCopied')}{:else}Copied!{/if}
        {:else}
          📋 {#if $config?.baseTranslations}{t('copyLink')}{:else}Copy Link{/if}
        {/if}
      </button>
    </div>
  </div>
{/if}

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: color-mix(in srgb, var(--bg-main) 90%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 3px solid;
    border-color: var(--border-light);
    box-shadow: 0 4px 0 var(--shadow-color);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    user-select: none;
  }

  .logo-icon {
    font-size: 24px;
    animation: pixel-bounce 1s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(126, 252, 202, 0.3));
  }

  .brand-name {
    font-family: var(--font-pixel);
    font-size: 14px;
    color: var(--accent-mint);
    text-shadow: 0 0 10px rgba(126, 252, 202, 0.3);
    letter-spacing: 1px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .header-btn {
    font-size: 16px;
    width: 38px;
    height: 38px;
    text-decoration: none;
  }

  /* Modal */
  .modal-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .modal-title {
    font-family: var(--font-pixel);
    font-size: 11px;
    color: var(--accent-mint);
  }

  .close-btn {
    font-family: var(--font-pixel);
    font-size: 12px;
    color: var(--text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
  }
  .close-btn:hover {
    color: var(--accent-red);
  }

  .qr-frame {
    border: 3px solid var(--accent-mint);
    padding: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    box-shadow: 0 0 12px rgba(126, 252, 202, 0.1);
  }

  .qr-frame :global(svg) {
    width: 100%;
    max-width: 260px;
    height: auto;
    image-rendering: pixelated;
  }

  .qr-hint {
    font-family: var(--font-pixel);
    font-size: 8px;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .copy-link-btn {
    width: 100%;
    text-align: center;
    display: block;
  }

  :global(.icon-btn.active) {
    color: var(--accent-cyan);
    border-color: var(--accent-cyan);
    background: var(--accent-cyan-dim);
    box-shadow: 0 0 6px var(--accent-cyan-dim);
  }
</style>
