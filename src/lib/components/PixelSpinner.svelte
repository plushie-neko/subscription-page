<script lang="ts">
  // Cool rotating pixel hourglass spinner
</script>

<div class="spinner-container">
  <div class="pixel-hourglass">
    <iconify-icon icon="pixelarticons:hourglass"></iconify-icon>
  </div>
  <p class="loading-text">Loading<span class="dots"></span></p>
</div>

<style>
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 24px;
    position: relative;
    z-index: 1;
  }

  .pixel-hourglass {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-mint);
    animation: hourglass-flip 1.8s steps(6) infinite;
    filter: drop-shadow(0 0 12px rgba(126, 252, 202, 0.2));
  }

  .pixel-hourglass :global(iconify-icon) {
    font-size: 64px;
  }

  .loading-text {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--accent-mint);
    letter-spacing: 2px;
    text-shadow: 0 0 8px rgba(126, 252, 202, 0.1);
  }

  .dots::after {
    content: '';
    animation: dots 1.5s step-end infinite;
  }

  @keyframes hourglass-flip {
    0%, 75% {
      transform: rotate(0deg);
    }
    90%, 100% {
      transform: rotate(180deg);
    }
  }

  @keyframes dots {
    0% { content: ''; }
    25% { content: '.'; }
    50% { content: '..'; }
    75% { content: '...'; }
  }
</style>
