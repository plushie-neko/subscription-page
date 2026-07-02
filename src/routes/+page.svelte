<div class="landing">
	<div class="pixel-card landing-card">
		<h1 class="landing-icon">
			<iconify-icon icon="pixelarticons:cat" style="color: var(--accent-mint);"></iconify-icon>
			<iconify-icon icon="pixelarticons:flash" style="color: var(--accent-yellow);"></iconify-icon>
		</h1>
		<h2>Subscription Portal</h2>
		<p>Please use your personal subscription link to access your portal, nya~</p>
	</div>
</div>

<style>
	.landing {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		position: relative;
		z-index: 1;
	}

	.landing-card {
		text-align: center;
		max-width: 400px;
		width: 100%;
		padding: 40px 20px !important;
	}

	.landing-icon {
		font-size: 3rem;
		margin-bottom: 16px;
		animation: pixel-bounce 1.2s ease-in-out infinite;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	h2 {
		font-family: var(--font-pixel);
		font-size: 14px;
		color: var(--accent-mint);
		margin-bottom: 12px;
		text-shadow: 0 0 8px rgba(126, 252, 202, 0.2);
	}

	p {
		font-size: 8px;
		color: var(--text-secondary);
		line-height: 1.6;
	}
</style>
