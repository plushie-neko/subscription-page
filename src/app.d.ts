// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@kastov/cryptohapp' {
	export function createHappCryptoLink(url: string, version: string, flag: boolean): string | undefined;
}

export {};
