<!--
  QrModal — M3 dialog showing a QR code with theme colors.
  Uses the <dialog> element for proper accessibility.
-->
<script lang="ts">
	import { renderSVG } from 'uqr';
	import { Copy, X } from '@lucide/svelte';

	interface Props {
		open: boolean;
		title: string;
		data: string;
		description?: string;
		copyLabel?: string;
		onclose: () => void;
	}

	let { open = $bindable(), title, data, description = '', copyLabel = 'Copy', onclose }: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();
	let copied = $state(false);

	let qrSvg = $derived(renderSVG(data, {
		whiteColor: 'var(--md-sys-color-surface-container, #1e1e2e)',
		blackColor: 'var(--md-sys-color-primary, #B39DDB)'
	}));

	// Re-render QR with actual hex (renderSVG needs real hex, not CSS vars)
	let qrSvgReal = $derived(renderSVG(data, {
		whiteColor: '#1e1e2e',
		blackColor: '#cdb4f0'
	}));

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) {
			dialogEl.showModal();
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	});

	function handleClose() {
		open = false;
		onclose();
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(data);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch { /* clipboard not available */ }
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogEl}
	class="qr-modal"
	onclose={handleClose}
	onkeydown={(e) => e.key === 'Escape' && handleClose()}
	onclick={(e) => {
		if (e.target === dialogEl) handleClose();
	}}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h3 class="modal-title">{title}</h3>
			<button class="close-btn" onclick={handleClose} aria-label="Close">
				<X size={20} />
			</button>
		</div>

		<div class="qr-wrapper">
			{@html qrSvgReal}
		</div>

		{#if description}
			<p class="modal-desc">{description}</p>
		{/if}

		<button class="copy-btn" class:copied onclick={handleCopy}>
			<Copy size={16} />
			<span>{copied ? '✓' : copyLabel}</span>
		</button>
	</div>
</dialog>

<style>
	.qr-modal {
		border: none;
		background: transparent;
		padding: 0;
		max-width: min(400px, 90vw);
		width: 100%;
	}

	.qr-modal::backdrop {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		animation: backdrop-fade 200ms ease-out;
	}

	.modal-content {
		background: var(--md-sys-color-surface-container-high, #2a2a3e);
		border-radius: var(--radius-xl);
		padding: var(--space-lg);
		border: 1px solid var(--glass-border);
		animation: slide-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.modal-title {
		font-family: var(--font-display);
		font-size: var(--text-title-lg);
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
		margin: 0;
	}

	.close-btn {
		background: var(--md-sys-color-surface-container, #1e1e2e);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-full);
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--md-sys-color-on-surface-variant);
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		background: var(--md-sys-color-surface-container-highest);
		color: var(--md-sys-color-on-surface);
	}

	.qr-wrapper {
		width: 100%;
		max-width: 280px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: #1e1e2e;
	}

	.qr-wrapper :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.modal-desc {
		font-size: var(--text-body-sm);
		color: var(--md-sys-color-on-surface-variant);
		text-align: center;
		margin: 0;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		border: none;
		border-radius: var(--radius-full);
		font-family: var(--font-body);
		font-size: var(--text-label-lg);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		width: 100%;
		justify-content: center;
	}

	.copy-btn:hover {
		filter: brightness(1.1);
		transform: scale(1.02);
	}

	.copy-btn:active {
		transform: scale(0.98);
	}

	.copy-btn.copied {
		background: var(--color-success-container);
		color: var(--color-success);
	}
</style>
