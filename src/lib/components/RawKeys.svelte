<!--
  RawKeys — Connection keys list with copy + QR actions.
-->
<script lang="ts">
	import { Key, Copy, Check, QrCode } from '@lucide/svelte';
	import QrModal from './QrModal.svelte';

	interface ParsedLink {
		name: string;
		fullLink: string;
	}

	interface Props {
		links: string[];
		t: (key: string | Record<string, string>) => string;
	}

	let { links, t }: Props = $props();

	let parsedLinks: ParsedLink[] = $derived(
		links.map((link) => {
			const hashIndex = link.lastIndexOf('#');
			let name = 'Unknown';
			if (hashIndex !== -1) {
				const encoded = link.substring(hashIndex + 1);
				try { name = decodeURIComponent(encoded); }
				catch { name = encoded; }
			}
			return { name, fullLink: link };
		})
	);

	let copiedIndex = $state(-1);
	let qrModalOpen = $state(false);
	let qrModalData = $state({ title: '', data: '' });

	async function handleCopy(link: string, index: number) {
		try {
			await navigator.clipboard.writeText(link);
			copiedIndex = index;
			setTimeout(() => copiedIndex = -1, 2000);
		} catch { /* */ }
	}

	function showQr(link: ParsedLink) {
		qrModalData = { title: link.name, data: link.fullLink };
		qrModalOpen = true;
	}
</script>

{#if links.length > 0}
	<div class="raw-keys animate-in stagger-3">
		<div class="keys-header">
			<h3 class="keys-title">{t('connectionKeysHeader')}</h3>
			{#if parsedLinks.length > 1}
				<span class="keys-badge">{parsedLinks.length}</span>
			{/if}
		</div>

		<div class="keys-list">
			{#each parsedLinks as link, i (i)}
				<div class="key-item">
					<div class="key-info">
						<div class="key-icon">
							<Key size={16} />
						</div>
						<span class="key-name">{link.name}</span>
					</div>
					<div class="key-actions">
						<button
							class="icon-btn"
							class:copied={copiedIndex === i}
							onclick={() => handleCopy(link.fullLink, i)}
							title="Copy"
						>
							{#if copiedIndex === i}
								<Check size={16} />
							{:else}
								<Copy size={16} />
							{/if}
						</button>
						<button
							class="icon-btn qr"
							onclick={() => showQr(link)}
							title="QR Code"
						>
							<QrCode size={16} />
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<QrModal
		bind:open={qrModalOpen}
		title={qrModalData.title}
		data={qrModalData.data}
		description={t('scanToImport')}
		copyLabel={t('copyLink')}
		onclose={() => qrModalOpen = false}
	/>
{/if}

<style>
	.raw-keys {
		background: var(--md-sys-color-surface-container-low, #1e1e2e);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 1px solid var(--glass-border);
	}

	.keys-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-md);
	}

	.keys-title {
		font-family: var(--font-display);
		font-size: var(--text-title-lg);
		font-weight: 700;
		color: var(--md-sys-color-on-surface);
		margin: 0;
	}

	.keys-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 28px;
		padding: 0 8px;
		border-radius: var(--radius-full);
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		font-size: var(--text-label-md);
		font-weight: 700;
	}

	.keys-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		max-height: 300px;
		overflow-y: auto;
	}

	.key-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--md-sys-color-surface-container, #1a1a2e);
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		transition: all var(--transition-fast);
	}

	.key-item:hover {
		border-color: var(--glass-border);
		background: var(--md-sys-color-surface-container-high);
	}

	.key-info {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
		flex: 1;
	}

	.key-icon {
		color: var(--md-sys-color-primary);
		flex-shrink: 0;
		display: flex;
	}

	.key-name {
		font-size: var(--text-body-md);
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.key-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--radius-xs);
		background: transparent;
		color: var(--md-sys-color-on-surface-variant);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.icon-btn:hover {
		background: color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent);
		color: var(--md-sys-color-on-surface);
	}

	.icon-btn.copied {
		color: var(--color-success);
	}

	.icon-btn.qr:hover {
		color: var(--md-sys-color-primary);
	}

	@media (max-width: 480px) {
		.raw-keys {
			padding: var(--space-md);
		}

		.key-name {
			font-size: var(--text-body-sm);
		}
	}
</style>
