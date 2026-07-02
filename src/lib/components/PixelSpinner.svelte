<script lang="ts">
  // Cute bouncing pixel cat loading spinner
</script>

<div class="spinner-container">
  <div class="pixel-cat">
    <div class="cat-body">
      <div class="ear left"></div>
      <div class="ear right"></div>
      <div class="face">
        <div class="eye left"></div>
        <div class="eye right"></div>
        <div class="mouth"></div>
      </div>
    </div>
    <div class="tail"></div>
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

  .pixel-cat {
    position: relative;
    animation: cat-bounce 0.6s ease-in-out infinite;
  }

  .cat-body {
    width: 48px;
    height: 40px;
    background: var(--accent-lavender);
    position: relative;
    image-rendering: pixelated;
    box-shadow:
      /* outline */
      -4px 0 0 #1a1d33,
      4px 0 0 #1a1d33,
      0 -4px 0 #1a1d33,
      0 4px 0 #1a1d33,
      /* belly */
      inset 0 -8px 0 rgba(255,255,255,0.15);
  }

  .ear {
    position: absolute;
    width: 12px;
    height: 16px;
    background: var(--accent-lavender);
    top: -16px;
    box-shadow:
      -4px 0 0 #1a1d33,
      4px 0 0 #1a1d33,
      0 -4px 0 #1a1d33;
  }
  .ear.left { left: 4px; }
  .ear.right { right: 4px; }

  .ear::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 8px;
    background: var(--accent-pink);
    top: 4px;
    left: 4px;
  }

  .face {
    position: absolute;
    top: 8px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .eye {
    width: 6px;
    height: 6px;
    background: #1a1d33;
    animation: blink 3s step-end infinite;
    position: relative;
  }

  .eye::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    top: 0;
    right: 0;
  }

  .mouth {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: var(--accent-pink);
    box-shadow:
      -4px 0 0 var(--accent-pink),
      4px 0 0 var(--accent-pink);
  }

  .tail {
    position: absolute;
    right: -12px;
    bottom: 0;
    width: 8px;
    height: 16px;
    background: var(--accent-lavender);
    box-shadow:
      4px 0 0 #1a1d33,
      0 4px 0 #1a1d33,
      8px -8px 0 var(--accent-lavender),
      12px -8px 0 #1a1d33,
      8px -12px 0 #1a1d33;
    animation: tail-wag 0.4s ease-in-out infinite alternate;
  }

  .loading-text {
    font-family: var(--font-pixel);
    font-size: 10px;
    color: var(--accent-mint);
    letter-spacing: 2px;
  }

  .dots::after {
    content: '';
    animation: dots 1.5s step-end infinite;
  }

  @keyframes cat-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes blink {
    0%, 90%, 100% { height: 6px; }
    95% { height: 2px; }
  }

  @keyframes tail-wag {
    from { transform: rotate(-10deg); }
    to { transform: rotate(10deg); }
  }

  @keyframes dots {
    0% { content: ''; }
    25% { content: '.'; }
    50% { content: '..'; }
    75% { content: '...'; }
  }
</style>
