<script lang="ts">
  import { subscription, config, currentLang } from '$lib/stores/subscription';
  import { parseLinkName } from '$lib/utils/format';
  import { createTranslator } from '$lib/utils/i18n';

  const t = $derived(createTranslator($currentLang, $config?.baseTranslations));
  import { renderSVG } from 'uqr';

  const links = $derived($subscription?.links ?? []);
  const parsedLinks = $derived(links.map(parseLinkName));

  let copiedIndex = $state<number | null>(null);
  let qrModal = $state<{ name: string; fullLink: string } | null>(null);

  async function copyLink(link: string, index: number) {
    try {
      await navigator.clipboard.writeText(link);
      copiedIndex = index;
      setTimeout(() => { copiedIndex = null; }, 2000);
    } catch {}
  }

  function showQr(link: { name: string; fullLink: string }) {
    qrModal = link;
  }

  function closeQr() {
    qrModal = null;
  }

  const qrSvg = $derived(
    qrModal
      ? renderSVG(qrModal.fullLink, {
          whiteColor: '#141627',
          blackColor: '#67e8f9'
        })
      : ''
  );
</script>

{#if parsedLinks.length > 0}
  <section class="keys-section" style="animation: slide-up 0.3s ease both; animation-delay: 0.3s;">
    <div class="section-header">
      <h2 class="section-title">
        {#if $config?.baseTranslations}{t('connectionKeysHeader')}{:else}Connection Keys{/if}
      </h2>
      {#if parsedLinks.length > 1}
        <span class="key-count">{parsedLinks.length}</span>
      {/if}
    </div>

    <div class="pixel-card keys-card">
      <div class="keys-list">
        {#each parsedLinks as link, i}
          <div class="key-item">
            <span class="key-icon"><iconify-icon icon="pixelarticons:key"></iconify-icon></span>
            <span class="key-name">{link.name}</span>
            <div class="key-actions">
              <button
                class="icon-btn"
                class:copied={copiedIndex === i}
                onclick={() => copyLink(link.fullLink, i)}
                title="Copy key"
              >
                {#if copiedIndex === i}
                  <iconify-icon icon="pixelarticons:check"></iconify-icon>
                {:else}
                  <iconify-icon icon="pixelarticons:clipboard"></iconify-icon>
                {/if}
              </button>
              <button
                class="icon-btn"
                onclick={() => showQr(link)}
                title="Show QR"
              >
                <iconify-icon icon="pixelarticons:device-phone"></iconify-icon>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- QR Modal -->
{#if qrModal}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-overlay" onclick={closeQr}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="qr-modal-header">
        <h3 class="qr-title">
          <iconify-icon icon="pixelarticons:key" style="margin-right: 4px; vertical-align: middle;"></iconify-icon>
          {qrModal.name}
        </h3>
        <button class="close-btn" onclick={closeQr}>
          <iconify-icon icon="pixelarticons:close"></iconify-icon>
        </button>
      </div>

      {#if qrSvg}
        <div class="qr-frame">
          {@html qrSvg}
        </div>
      {/if}

      <p class="qr-hint">
        {#if $config?.baseTranslations}{t('scanToImport')}{:else}Scan to import this key, nya~{/if}
      </p>
    </div>
  </div>
{/if}

<style>
  .keys-section {
    margin: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .key-count {
    font-family: var(--font-pixel);
    font-size: 9px;
    background: rgba(103, 232, 249, 0.1);
    color: var(--accent-cyan);
    padding: 4px 10px;
    border: 1px solid rgba(103, 232, 249, 0.2);
    margin-bottom: 16px;
  }

  .keys-card {
    padding: 8px !important;
  }

  .keys-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 300px;
    overflow-y: auto;
  }

  .key-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .key-icon {
    font-size: 14px;
    flex-shrink: 0;
  }

  .key-name {
    font-family: var(--font-pixel);
    font-size: 9px;
    color: var(--text-primary);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .key-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .key-actions :global(.icon-btn) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  /* QR Modal overrides */
  .qr-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .qr-title {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--accent-cyan);
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
  .close-btn:hover { color: var(--accent-red); }

  .qr-frame {
    border: 3px solid var(--accent-cyan);
    padding: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    box-shadow: 0 0 12px rgba(103, 232, 249, 0.1);
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
    line-height: 1.6;
  }
</style>
