<script lang="ts">
  import { config, currentLang, subscription, availablePlatforms } from '$lib/stores/subscription';
  import { createTranslator } from '$lib/utils/i18n';

  const t = $derived(createTranslator($currentLang, $config?.baseTranslations));
  import { constructSubscriptionUrl, formatTemplate } from '$lib/utils/format';
  import type { PlatformKey, PlatformAppBlock, PlatformAppButton } from '$lib/types';

  const platformFallbackIcons: Record<string, string> = {
    ios: 'pixelarticons:device-phone',
    android: 'pixelarticons:device-phone',
    windows: 'pixelarticons:device-laptop',
    macos: 'pixelarticons:device-laptop',
    linux: 'pixelarticons:device-laptop',
    androidTV: 'pixelarticons:device-tv',
    appleTV: 'pixelarticons:device-tv'
  };

  let selectedPlatformKey = $state<string | null>(null);
  let selectedAppIndex = $state(0);
  let userPlatform = $state<string | null>(null);
  let hasAutoSelected = $state(false);

  function detectPlatform(): string | null {
    if (typeof navigator === 'undefined') return null;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('appletv')) return 'appleTV';
    if (ua.includes('googletv') || ua.includes('androidtv') || (ua.includes('android') && ua.includes('tv'))) return 'androidTV';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
    if (ua.includes('android')) return 'android';
    if (ua.includes('win')) return 'windows';
    if (ua.includes('macintosh') || ua.includes('mac os x')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    return null;
  }

  $effect(() => {
    userPlatform = detectPlatform();
  });

  const sortedPlatforms = $derived.by(() => {
    const list = [...$availablePlatforms];
    if (!userPlatform) return list;
    const matchIdx = list.findIndex(plat => plat.key === userPlatform);
    if (matchIdx > -1) {
      const [matched] = list.splice(matchIdx, 1);
      list.unshift(matched);
    }
    return list;
  });

  // Auto-select first platform based on sorted list
  $effect(() => {
    if (sortedPlatforms.length > 0 && !hasAutoSelected) {
      selectedPlatformKey = sortedPlatforms[0].key;
      if (typeof navigator !== 'undefined') {
        hasAutoSelected = true;
      }
    }
  });

  const selectedPlatform = $derived(
    selectedPlatformKey && $config?.platforms ? $config.platforms[selectedPlatformKey as PlatformKey] : null
  );

  const apps = $derived(selectedPlatform?.apps ?? []);
  const selectedApp = $derived(apps[selectedAppIndex] ?? apps[0]);

  function selectPlatform(key: string) {
    selectedPlatformKey = key;
    selectedAppIndex = 0;
  }

  function selectApp(index: number) {
    selectedAppIndex = index;
  }

  const subscriptionUrl = $derived(
    $subscription
      ? constructSubscriptionUrl(typeof window !== 'undefined' ? window.location.href : '', $subscription.user.shortUuid)
      : ''
  );

  const username = $derived($subscription?.user?.username ?? '');

  function formatLink(link: string): string {
    return formatTemplate(link, { subscriptionUrl, username });
  }

  let copied = $state('');

  async function handleButton(btn: PlatformAppButton, btnId: string) {
    const formattedUrl = formatLink(btn.link);

    switch (btn.type) {
      case 'copyButton':
        try {
          await navigator.clipboard.writeText(formattedUrl);
          copied = btnId;
          setTimeout(() => { copied = ''; }, 2000);
        } catch {}
        break;
      case 'external':
      case 'subscriptionLink':
        window.open(formattedUrl, '_blank', 'noopener,noreferrer');
        break;
    }
  }
</script>

{#if $availablePlatforms.length > 0}
  <section class="install-guide" style="animation: slide-up 0.3s ease both; animation-delay: 0.2s;">
    <h2 class="section-title">
      {#if $config?.baseTranslations}{t('installationGuideHeader')}{:else}Quest Log — Setup Guide{/if}
    </h2>

    <div class="pixel-card">
      <!-- Platform tabs -->
      <div class="platform-tabs">
        {#each sortedPlatforms as plat}
          <button
            class="pixel-tab"
            class:active={selectedPlatformKey === plat.key}
            onclick={() => selectPlatform(plat.key)}
          >
            {#if $config?.svgLibrary && $config.svgLibrary[plat.svgIconKey]}
              <span class="tab-icon">{@html $config.svgLibrary[plat.svgIconKey]}</span>
            {:else}
              <span class="tab-icon"><iconify-icon icon={platformFallbackIcons[plat.key] ?? 'pixelarticons:device-phone'}></iconify-icon></span>
            {/if}
            <span class="tab-label">{t(plat.displayName)}</span>
          </button>
        {/each}
      </div>

      <!-- App selector (if multiple apps) -->
      {#if apps.length > 1}
        <div class="app-grid">
          {#each apps as app, i}
            <button
              class="app-btn"
              class:active={selectedAppIndex === i}
              class:featured={app.featured}
              onclick={() => selectApp(i)}
            >
              {#if app.featured}
                <span class="featured-star"><iconify-icon icon="pixelarticons:star"></iconify-icon></span>
              {/if}
              <span class="app-name">{app.name}</span>
            </button>
          {/each}
        </div>
      {/if}

      <!-- Blocks / Steps -->
      {#if selectedApp}
        <div class="blocks">
          {#each selectedApp.blocks as block, blockIdx}
            <div class="block-item">
              <h3 class="block-title">
                {#if $config?.svgLibrary && $config.svgLibrary[block.svgIconKey]}
                  <span class="block-icon">{@html $config.svgLibrary[block.svgIconKey]}</span>
                {:else}
                  <span class="quest-marker">◆</span>
                {/if}
                {t(block.title)}
              </h3>

              {#if block.description}
                <p class="block-desc">{@html t(block.description)}</p>
              {/if}

              {#if block.buttons && block.buttons.length > 0}
                <div class="block-buttons">
                  {#each block.buttons as btn, btnIdx}
                    {@const btnId = `${blockIdx}-${btnIdx}`}
                    <button
                      class="pixel-btn"
                      class:primary={btn.type === 'external' || btn.type === 'subscriptionLink'}
                      class:pink={btn.type === 'copyButton'}
                      onclick={() => handleButton(btn, btnId)}
                    >
                      {#if copied === btnId}
                        <iconify-icon icon="pixelarticons:check" style="margin-right: 4px; vertical-align: middle;"></iconify-icon> {#if $config?.baseTranslations}{t({ en: 'Copied', ru: 'Скопировано' })}{:else}Copied!{/if}
                      {:else}
                        {#if $config?.svgLibrary && $config.svgLibrary[btn.svgIconKey]}
                          <span class="btn-svg">{@html $config.svgLibrary[btn.svgIconKey]}</span>
                        {/if}
                        {t(btn.text)}
                      {/if}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .platform-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }

  .tab-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    fill: currentColor;
    font-size: 14px;
  }

  .tab-icon :global(svg), .tab-icon :global(iconify-icon) {
    width: 100%;
    height: 100%;
  }

  .tab-label {
    display: inline;
  }

  @media (max-width: 500px) {
    .tab-label {
      display: none;
    }
    .platform-tabs :global(.pixel-tab) {
      padding: 10px 12px;
    }
  }

  .app-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
  }

  .app-btn {
    font-family: var(--font-pixel);
    font-size: 9px;
    padding: 8px 14px;
    background: var(--bg-card);
    color: var(--text-secondary);
    border: 2px solid rgba(255,255,255,0.06);
    cursor: pointer;
    position: relative;
    transition: all 0.1s;
  }

  .app-btn:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }

  .app-btn.active {
    background: var(--bg-elevated);
    color: var(--accent-cyan);
    border-color: var(--accent-cyan);
  }

  .app-btn.featured {
    border-color: rgba(255, 215, 0, 0.3);
  }

  .featured-star {
    font-size: 8px;
    position: absolute;
    top: -4px;
    right: -4px;
    color: var(--accent-yellow);
    display: inline-flex;
  }

  .app-name {
    white-space: nowrap;
  }

  /* Blocks */
  .blocks {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .block-item {
    padding: 16px;
    background: rgba(255,255,255,0.01);
    border: 1px solid rgba(255,255,255,0.04);
    border-left: 3px solid var(--accent-lavender);
    position: relative;
  }

  .block-title {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--accent-lavender);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .block-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    fill: currentColor;
    color: var(--accent-pink);
  }

  .block-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .quest-marker {
    color: var(--accent-pink);
    font-size: 12px;
  }

  .block-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    line-height: 1.5;
  }

  /* Buttons */
  .block-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .btn-svg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    fill: currentColor;
    margin-right: 4px;
  }

  .btn-svg :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
