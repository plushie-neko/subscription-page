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

  const layoutType = $derived($config?.uiConfig?.installationGuidesBlockType ?? 'accordion');
  let activeAccordionIndex = $state<number | null>(0);

  $effect(() => {
    if (selectedPlatformKey || selectedAppIndex >= 0) {
      activeAccordionIndex = 0;
    }
  });

  function getColorVar(colorName: string): string {
    const colors: Record<string, string> = {
      mint: 'var(--accent-mint)',
      pink: 'var(--accent-pink)',
      lavender: 'var(--accent-lavender)',
      peach: 'var(--accent-peach)',
      cyan: 'var(--accent-cyan)',
      yellow: 'var(--accent-yellow)',
      red: 'var(--accent-red)',
      green: 'var(--accent-green)'
    };
    return colors[colorName] ?? 'var(--accent-lavender)';
  }
</script>

{#snippet stepIcon(block: PlatformAppBlock)}
  {#if $config?.svgLibrary && $config.svgLibrary[block.svgIconKey]}
    <span class="block-icon">{@html $config.svgLibrary[block.svgIconKey]}</span>
  {:else}
    <span class="quest-marker">◆</span>
  {/if}
{/snippet}

{#snippet stepDetails(block: PlatformAppBlock, blockIdx: number)}
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
            <iconify-icon icon="pixelarticons:check" style="margin-right: 4px; vertical-align: middle;"></iconify-icon>
            {#if $config?.baseTranslations}{t({ en: 'Copied', ru: 'Скопировано' })}{:else}Copied!{/if}
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
{/snippet}

{#if $availablePlatforms.length > 0}
  <section class="install-guide" style="animation: slide-up 0.3s ease both; animation-delay: 0.2s;">
    <h2 class="section-title">
      {#if $config?.baseTranslations}{t('installationGuideHeader')}{:else}Quest Log — Setup Guide{/if}
    </h2>

    <div class="pixel-card guide-main-card">
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

      {#if selectedApp}
        <div class="blocks-container" class:cards-layout={layoutType === 'cards'} class:timeline-layout={layoutType === 'timeline'} class:accordion-layout={layoutType === 'accordion'} class:minimal-layout={layoutType === 'minimal'}>
          
          {#if layoutType === 'cards'}
            {#each selectedApp.blocks as block, blockIdx}
              <div class="block-card-item" style="--step-accent-color: {getColorVar(block.svgIconColor)}">
                <div class="block-card-header">
                  <div class="block-card-icon-circle">
                    {@render stepIcon(block)}
                  </div>
                  <h3 class="block-title">{t(block.title)}</h3>
                </div>
                <div class="block-card-body">
                  {@render stepDetails(block, blockIdx)}
                </div>
              </div>
            {/each}

          {:else if layoutType === 'timeline'}
            {#each selectedApp.blocks as block, blockIdx}
              <div class="timeline-item" style="--step-accent-color: {getColorVar(block.svgIconColor)}">
                <div class="timeline-bullet-node">
                  {@render stepIcon(block)}
                </div>
                <div class="timeline-content">
                  <h3 class="block-title">{t(block.title)}</h3>
                  {@render stepDetails(block, blockIdx)}
                </div>
              </div>
            {/each}

          {:else if layoutType === 'accordion'}
            {#each selectedApp.blocks as block, blockIdx}
              {@const isOpen = activeAccordionIndex === blockIdx}
              <div class="accordion-item" class:open={isOpen} style="--step-accent-color: {getColorVar(block.svgIconColor)}">
                <button 
                  class="accordion-header-btn" 
                  onclick={() => activeAccordionIndex = isOpen ? null : blockIdx}
                  aria-expanded={isOpen}
                >
                  <div class="header-left">
                    <div class="accordion-icon-circle">
                      {@render stepIcon(block)}
                    </div>
                    <span class="accordion-title">{t(block.title)}</span>
                  </div>
                  <iconify-icon icon="pixelarticons:chevron-down" class="chevron" class:expanded={isOpen}></iconify-icon>
                </button>
                {#if isOpen}
                  <div class="accordion-content-panel" style="animation: slide-up 0.2s ease both;">
                    {@render stepDetails(block, blockIdx)}
                  </div>
                {/if}
              </div>
            {/each}

          {:else if layoutType === 'minimal'}
            {#each selectedApp.blocks as block, blockIdx}
              <div class="minimal-step-item" style="--step-accent-color: {getColorVar(block.svgIconColor)}">
                <div class="minimal-header">
                  <div class="minimal-icon-circle">
                    {@render stepIcon(block)}
                  </div>
                  <h3 class="minimal-title">{t(block.title)}</h3>
                </div>
                <div class="minimal-content">
                  {@render stepDetails(block, blockIdx)}
                </div>
              </div>
            {/each}
          {/if}

        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .guide-main-card {
    padding: 16px !important;
  }

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

  .blocks-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .block-title {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--text-primary);
    margin: 0;
  }

  .block-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .block-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .quest-marker {
    color: var(--text-muted);
    font-size: 12px;
  }

  .block-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    line-height: 1.5;
  }

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

  .cards-layout .block-card-item {
    padding: 16px;
    background: var(--bg-elevated);
    border: 2px solid rgba(255, 255, 255, 0.05);
    border-left: 4px solid var(--step-accent-color);
    box-shadow: 0 2px 0 var(--shadow-color);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .block-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .block-card-icon-circle {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    color: var(--step-accent-color);
    font-size: 12px;
    flex-shrink: 0;
  }

  .timeline-layout {
    position: relative;
    padding-left: 36px;
    gap: 24px;
  }

  .timeline-layout::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 15px;
    bottom: 8px;
    width: 2px;
    background: rgba(255, 255, 255, 0.08);
  }

  .timeline-item {
    position: relative;
  }

  .timeline-bullet-node {
    position: absolute;
    left: -36px;
    top: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    border: 2px solid var(--step-accent-color);
    color: var(--step-accent-color);
    border-radius: 4px;
    z-index: 1;
    box-shadow: 0 2px 0 var(--shadow-color);
  }

  .timeline-content {
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .accordion-layout {
    gap: 8px;
  }

  .accordion-item {
    background: var(--bg-card);
    border: 2px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    overflow: hidden;
    transition: border-color 0.2s ease;
  }

  .accordion-item.open {
    border-color: var(--step-accent-color);
  }

  .accordion-header-btn {
    width: 100%;
    background: var(--bg-elevated);
    border: none;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    text-align: left;
    outline: none;
  }

  :global([dir="rtl"]) .accordion-header-btn {
    text-align: right;
  }

  .accordion-title {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--text-primary);
  }

  .accordion-icon-circle {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    color: var(--step-accent-color);
    font-size: 12px;
    flex-shrink: 0;
  }

  .accordion-content-panel {
    padding: 16px;
    background: rgba(255, 255, 255, 0.01);
    border-top: 2px dashed rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chevron {
    font-size: 14px;
    color: var(--text-muted);
    transition: transform 0.2s ease;
  }

  .chevron.expanded {
    transform: rotate(180deg);
  }

  .minimal-layout {
    gap: 0;
  }

  .minimal-step-item {
    padding: 16px 0;
    border-bottom: 2px dashed rgba(255, 255, 255, 0.05);
  }

  .minimal-step-item:last-child {
    border-bottom: none;
  }

  .minimal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .minimal-icon-circle {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--step-accent-color);
    font-size: 12px;
    flex-shrink: 0;
  }

  .minimal-title {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--text-primary);
  }

  .minimal-content {
    padding-left: 30px;
  }

  :global([dir="rtl"]) .minimal-content {
    padding-left: 0;
    padding-right: 30px;
  }

  :global([dir="rtl"]) .app-name,
  :global([dir="rtl"]) .block-title,
  :global([dir="rtl"]) .accordion-title,
  :global([dir="rtl"]) .minimal-title {
    font-size: 14px !important;
  }
  :global([dir="rtl"]) .block-desc {
    font-size: 13.5px !important;
  }
</style>
