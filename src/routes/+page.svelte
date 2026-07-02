<div class="landing">
	<div class="landing-card">
		<h1 class="landing-icon">✦</h1>
		<h2>Subscription Page</h2>
		<p>Access your subscription using your personal link.</p>
	</div>
</div>

<style>
	.landing {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display, 'Nunito', sans-serif);
	}

	.landing-card {
		text-align: center;
		padding: 48px;
		background: var(--md-sys-color-surface-container-low, #1e1e2e);
		border-radius: var(--radius-xl, 28px);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.landing-icon {
		font-size: 3rem;
		color: var(--md-sys-color-primary, #B39DDB);
		margin-bottom: 16px;
	}

	h2 {
		color: var(--md-sys-color-on-surface, #e0e0e0);
		font-weight: 700;
		margin: 0 0 8px;
	}

	p {
		color: var(--md-sys-color-on-surface-variant, #999);
		margin: 0;
	}
</style>
