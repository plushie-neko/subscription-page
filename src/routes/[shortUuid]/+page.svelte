<!--
  Main subscription page — [shortUuid]/+page.svelte
  Assembles all components with Pixel Art styling.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import SubscriptionInfo from '$lib/components/SubscriptionInfo.svelte';
  import InstallationGuide from '$lib/components/InstallationGuide.svelte';
  import ConnectionKeys from '$lib/components/ConnectionKeys.svelte';
  import LanguagePicker from '$lib/components/LanguagePicker.svelte';
  import PixelSpinner from '$lib/components/PixelSpinner.svelte';
  import { subscription, config, currentLang, detectLanguage } from '$lib/stores/subscription';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Populate stores from server data
  $effect(() => {
    if (data.subscription) subscription.set(data.subscription);
    if (data.config) config.set(data.config);
  });

  // Handle RTL layout for Persian language
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = $currentLang === 'fa' ? 'rtl' : 'ltr';
    }
  });

  // Check for errors
  const hasError = $derived('error' in data);

  let loaded = $state(false);

  onMount(async () => {
    if (data.config) {
      detectLanguage(data.config.locales);
    }
    // Small delay to let the cute loading animation shine
    await new Promise((r) => setTimeout(r, 1000));
    loaded = true;
  });
</script>

<svelte:head>
  <title>{$config?.baseSettings?.metaTitle ?? 'Subscription'}</title>
  <meta name="description" content={$config?.baseSettings?.metaDescription ?? 'Manage your subscription'} />
</svelte:head>

{#if !loaded}
  <PixelSpinner />
{:else if hasError}
  <main class="container main-content error-container">
    <div class="pixel-card error-card">
      <div class="error-emoji">
        <iconify-icon icon="pixelarticons:cat" style="color: var(--accent-red);"></iconify-icon>
        <iconify-icon icon="pixelarticons:heart-broken" style="color: var(--accent-red);"></iconify-icon>
      </div>
      <h2 class="error-title">Subscription not found</h2>
      <p class="error-subtitle">Please double check your link, nya~</p>
    </div>
  </main>
{:else}
  <Header />

  <main class="container main-content">
    <div class="content-stack">
      <SubscriptionInfo />
      <InstallationGuide />
      
      {#if $config?.baseSettings?.showConnectionKeys}
        <ConnectionKeys />
      {/if}

      <LanguagePicker />

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-art">
          <span class="footer-cat"><iconify-icon icon="pixelarticons:cat" style="color: var(--accent-mint);"></iconify-icon></span>
          <span class="footer-sparkle"><iconify-icon icon="pixelarticons:flash" style="color: var(--accent-yellow);"></iconify-icon></span>
        </div>
        <p class="footer-text">Powered by pixel magic, nya~</p>
        <p class="footer-sub">Built with <iconify-icon icon="pixelarticons:heart" style="color: var(--accent-pink); vertical-align: middle; font-size: 8px;"></iconify-icon> and SvelteKit</p>
      </footer>
    </div>
  </main>
{/if}

<style>
  .main-content {
    padding-top: 24px;
    padding-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .content-stack {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 80px);
  }

  .error-card {
    max-width: 400px;
    width: 100%;
    margin: 40px auto;
    text-align: center;
    padding: 32px 16px !important;
    border-color: var(--accent-red) var(--bevel-dark) var(--bevel-dark) var(--accent-red) !important;
  }

  .error-emoji {
    font-size: 40px;
    margin-bottom: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .error-title {
    font-family: var(--font-pixel);
    font-size: 12px;
    color: var(--accent-red);
    margin-bottom: 8px;
  }

  .error-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .footer {
    text-align: center;
    padding: 24px 0 8px;
    animation: slide-up 0.3s ease both;
    animation-delay: 0.5s;
  }

  .footer-art {
    font-size: 24px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .footer-cat {
    animation: pixel-bounce 1.2s ease-in-out infinite;
  }

  .footer-sparkle {
    animation: sparkle-float 2s ease-in-out infinite;
  }

  .footer-text {
    font-family: var(--font-pixel);
    font-size: 8px;
    color: var(--text-muted);
    letter-spacing: 1px;
  }

  .footer-sub {
    font-family: var(--font-pixel);
    font-size: 7px;
    color: rgba(107, 101, 137, 0.5);
    margin-top: 6px;
  }
</style>
