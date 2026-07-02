<!--
  QrModal — BeerCSS dialog showing a QR code with theme colors.
-->
<script lang="ts">
	import { renderSVG } from 'uqr';

	interface Props {
		open: boolean;
		title: string;
		data: string;
		description?: string;
		copyLabel?: string;
		onclose: () => void;
	}

	let { open = $bindable(), title, data, description = '', copyLabel = 'Copy', onclose }: Props = $props();

	let copied = $state(false);

	// Generate QR code
	let qrSvgReal = $derived(renderSVG(data, {
		whiteColor: '#1e1e2e',
		blackColor: '#cdb4f0'
	}));

	function handleClose() {
		open = false;
		onclose();
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(data);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch { /* */ }
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
	class:active={open}
	class="modal-qr-dialog"
	onclose={handleClose}
	onkeydown={(e) => e.key === 'Escape' && handleClose()}
	onclick={(e) => {
		if (e.target === e.currentTarget) handleClose();
	}}
>
	<header class="row">
		<h5 class="max font-display">{title}</h5>
		<button class="circle transparent" onclick={handleClose} aria-label="Close">
			<i>close</i>
		</button>
	</header>
	
	<div class="dialog-body">
		<div class="qr-container row center-align">
			<div class="qr-wrapper">
				{@html qrSvgReal}
			</div>
		</div>

		{#if description}
			<p class="modal-desc center-align">{description}</p>
		{/if}
	</div>

	<nav class="center-align">
		<button class="fill primary" class:success-button={copied} onclick={handleCopy}>
			<i>{copied ? 'check' : 'content_copy'}</i>
			<span>{copied ? '✓' : copyLabel}</span>
		</button>
	</nav>
</dialog>

<style>
	.modal-qr-dialog {
		background: var(--surface-container-high) !important;
		border-radius: var(--radius-xl) !important;
		border: 1px solid var(--glass-border) !important;
		max-width: min(380px, 90vw) !important;
		padding: var(--space-lg) !important;
	}

	.dialog-body {
		padding: var(--space-sm) 0;
	}

	.qr-container {
		margin: var(--space-md) 0;
	}

	.qr-wrapper {
		width: 100%;
		max-width: 260px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: #1e1e2e;
		border: 1px solid var(--glass-border);
	}

	.qr-wrapper :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.modal-desc {
		font-size: var(--text-body-sm);
		color: var(--on-surface-variant);
		margin-top: var(--space-sm);
	}

	.success-button {
		background: var(--color-success) !important;
		color: #1a1a2e !important;
	}
</style>
