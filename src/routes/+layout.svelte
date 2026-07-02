<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { initTheme } from '$lib/stores/theme';

  let { children } = $props();

  onMount(() => {
    initTheme();
  });
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="#0d0f1a" />
</svelte:head>

<!-- Scanline overlay -->
<div class="scanlines"></div>

<!-- Floating pixel sparkles -->
<div class="sparkles-container">
  <div class="sparkle" style="left: 12%; animation-delay: 0.1s; animation-duration: 4.2s;">✦</div>
  <div class="sparkle" style="left: 28%; animation-delay: 0.7s; animation-duration: 3.5s;">✦</div>
  <div class="sparkle" style="left: 45%; animation-delay: 1.4s; animation-duration: 5.1s;">✦</div>
  <div class="sparkle" style="left: 62%; animation-delay: 2.1s; animation-duration: 4.8s;">✦</div>
  <div class="sparkle" style="left: 78%; animation-delay: 2.8s; animation-duration: 3.9s;">✦</div>
  <div class="sparkle" style="left: 90%; animation-delay: 3.5s; animation-duration: 4.5s;">✦</div>
  <div class="sparkle" style="left: 35%; animation-delay: 4.2s; animation-duration: 5.5s;">✦</div>
  <div class="sparkle" style="left: 55%; animation-delay: 4.9s; animation-duration: 3.2s;">✦</div>
</div>

{@render children()}

<style>
  .sparkles-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .sparkle {
    position: absolute;
    font-size: 8px;
    color: var(--accent-mint);
    opacity: 0;
    animation: sparkle-drift linear infinite;
  }

  .sparkle:nth-child(odd) {
    color: var(--accent-pink);
  }

  .sparkle:nth-child(3n) {
    color: var(--accent-lavender);
    font-size: 6px;
  }

  @keyframes sparkle-drift {
    0% {
      opacity: 0;
      transform: translateY(100vh) scale(0.5);
    }
    10% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
    90% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
      transform: translateY(-20px) scale(1);
    }
  }
</style>
