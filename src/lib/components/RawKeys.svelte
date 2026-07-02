<!--
  RawKeys — Connection keys list with copy + QR actions.
  Rebuilt with BeerCSS article.card and row list classes.
-->
<script lang="ts">
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
	<article class="card elevated raw-keys-card animate-in stagger-3 no-margin">
		<div class="row align-center keys-card-header">
			<h5 class="max font-display no-margin">{t('connectionKeysHeader')}</h5>
			{#if parsedLinks.length > 1}
				<span class="chip primary-container label small-round">{parsedLinks.length}</span>
			{/if}
		</div>

		<div class="space"></div>

		<div class="keys-list-scroll">
			{#each parsedLinks as link, i (i)}
				<div class="row align-center key-list-row border-bottom">
					<i class="primary-text">vpn_key</i>
					<div class="max truncate key-name font-body">{link.name}</div>
					
					<nav class="row no-space key-item-actions">
						<button
							class="circle transparent"
							class:success-text={copiedIndex === i}
							onclick={() => handleCopy(link.fullLink, i)}
							title="Copy"
						>
							<i>{copiedIndex === i ? 'check' : 'content_copy'}</i>
						</button>
						<button
							class="circle transparent"
							onclick={() => showQr(link)}
							title="QR Code"
						>
							<i>qr_code</i>
						</button>
					</nav>
				</div>
			{/each}
		</div>
	</article>

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
	.raw-keys-card {
		background: var(--surface-container-low) !important;
		border-radius: var(--radius-lg) !important;
		border: 1px solid var(--glass-border) !important;
		padding: var(--space-lg) !important;
	}

	.keys-card-header {
		margin-bottom: var(--space-xs);
	}

	.keys-list-scroll {
		display: flex;
		flex-direction: column;
		max-height: 280px;
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.key-list-row {
		padding: var(--space-xs) var(--space-sm) !important;
		transition: background var(--transition-fast);
		border-bottom-color: var(--glass-border) !important;
	}

	.key-list-row:hover {
		background: color-mix(in srgb, var(--on-surface) 4%, transparent);
	}

	.key-name {
		font-size: var(--text-body-md);
		font-weight: 500;
		color: var(--on-surface);
	}

	.key-item-actions button {
		color: var(--on-surface-variant);
	}

	.key-item-actions button:hover {
		color: var(--on-surface);
	}

	.success-text {
		color: var(--color-success) !important;
	}

	@media (max-width: 480px) {
		.raw-keys-card {
			padding: var(--space-md) !important;
		}

		.key-name {
			font-size: var(--text-body-sm);
		}
	}
</style>
