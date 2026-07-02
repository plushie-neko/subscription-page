<script lang="ts">
  import { config, currentLang, setLanguage } from '$lib/stores/subscription';

  const locales = $derived($config?.locales ?? []);
  
  const localeNames: Record<string, string> = {
    en: '🇬🇧 EN',
    ru: '🇷🇺 RU',
    zh: '🇨🇳 ZH',
    ja: '🇯🇵 JA',
    ko: '🇰🇷 KO',
    de: '🇩🇪 DE',
    fr: '🇫🇷 FR',
    es: '🇪🇸 ES',
    pt: '🇧🇷 PT',
    tr: '🇹🇷 TR',
    uk: '🇺🇦 UK',
    fa: '🇮🇷 FA',
    ar: '🇸🇦 AR'
  };

  function getLocaleName(code: string): string {
    return localeNames[code] ?? code.toUpperCase();
  }
</script>

{#if locales.length > 1}
  <div class="lang-picker" style="animation: slide-up 0.3s ease both; animation-delay: 0.4s;">
    <div class="lang-buttons">
      {#each locales as locale}
        <button
          class="pixel-tab lang-btn"
          class:active={$currentLang === locale}
          onclick={() => setLanguage(locale)}
        >
          {getLocaleName(locale)}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .lang-picker {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  .lang-buttons {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .lang-btn {
    font-size: 9px;
    padding: 6px 12px;
  }
</style>
