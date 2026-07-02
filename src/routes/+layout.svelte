<script lang="ts">
	import 'beercss/dist/cdn/beer.min.css';
	import '$lib/styles/tokens.css';
	import '$lib/styles/animations.css';
	import { onMount } from 'svelte';
	import { generateM3Tokens, tokensToCSS, DEFAULT_SEED } from '$lib/theme/palette';

	let { children } = $props();

	onMount(() => {
		// Dynamically import BeerCSS JavaScript client-side to prevent SSR window reference errors
		import('beercss');

		const tokens = generateM3Tokens(DEFAULT_SEED);
		const cssText = tokensToCSS(tokens);

		const style = document.createElement('style');
		style.id = 'm3-tokens';
		style.textContent = cssText;
		document.head.appendChild(style);

		return () => {
			document.getElementById('m3-tokens')?.remove();
		};
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

{@render children()}

<style>
	:global(body) {
		min-height: 100dvh;
		background: var(--md-sys-color-surface, #131318);
		color: var(--md-sys-color-on-surface, #e0e0e0);
	}
</style>
