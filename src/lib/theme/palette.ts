/**
 * M3 Tonal Palette Generator
 * Generates Material Design 3 color tokens from a single seed color.
 * Uses @material/material-color-utilities for proper HCT color science.
 */
import {
	argbFromHex,
	hexFromArgb,
	themeFromSourceColor,
	TonalPalette
} from '@material/material-color-utilities';

export interface M3Tokens {
	primary: Record<string, string>;
	secondary: Record<string, string>;
	tertiary: Record<string, string>;
	neutral: Record<string, string>;
	neutralVariant: Record<string, string>;
	error: Record<string, string>;
	sys: Record<string, string>;
}

const TONES = [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 100];

function paletteTones(palette: TonalPalette): Record<string, string> {
	const result: Record<string, string> = {};
	for (const tone of TONES) {
		result[`t${tone}`] = hexFromArgb(palette.tone(tone));
	}
	return result;
}

export function generateM3Tokens(seedHex: string): M3Tokens {
	const seedArgb = argbFromHex(seedHex);
	const theme = themeFromSourceColor(seedArgb);
	const dark = theme.schemes.dark;

	// Extract tonal palettes
	const primary = paletteTones(theme.palettes.primary);
	const secondary = paletteTones(theme.palettes.secondary);
	const tertiary = paletteTones(theme.palettes.tertiary);
	const neutral = paletteTones(theme.palettes.neutral);
	const neutralVariant = paletteTones(theme.palettes.neutralVariant);
	const error = paletteTones(theme.palettes.error);

	// System-level semantic tokens (dark scheme)
	const sys: Record<string, string> = {
		'primary': hexFromArgb(dark.primary),
		'on-primary': hexFromArgb(dark.onPrimary),
		'primary-container': hexFromArgb(dark.primaryContainer),
		'on-primary-container': hexFromArgb(dark.onPrimaryContainer),
		'secondary': hexFromArgb(dark.secondary),
		'on-secondary': hexFromArgb(dark.onSecondary),
		'secondary-container': hexFromArgb(dark.secondaryContainer),
		'on-secondary-container': hexFromArgb(dark.onSecondaryContainer),
		'tertiary': hexFromArgb(dark.tertiary),
		'on-tertiary': hexFromArgb(dark.onTertiary),
		'tertiary-container': hexFromArgb(dark.tertiaryContainer),
		'on-tertiary-container': hexFromArgb(dark.onTertiaryContainer),
		'error': hexFromArgb(dark.error),
		'on-error': hexFromArgb(dark.onError),
		'error-container': hexFromArgb(dark.errorContainer),
		'on-error-container': hexFromArgb(dark.onErrorContainer),
		'surface': hexFromArgb(dark.surface),
		'on-surface': hexFromArgb(dark.onSurface),
		'surface-variant': hexFromArgb(dark.surfaceVariant),
		'on-surface-variant': hexFromArgb(dark.onSurfaceVariant),
		'outline': hexFromArgb(dark.outline),
		'outline-variant': hexFromArgb(dark.outlineVariant),
		'inverse-surface': hexFromArgb(dark.inverseSurface),
		'inverse-primary': hexFromArgb(dark.inversePrimary),
		'surface-dim': neutral.t6,
		'surface-bright': neutral.t24,
		'surface-container-lowest': neutral.t4,
		'surface-container-low': neutral.t10,
		'surface-container': neutral.t12,
		'surface-container-high': neutral.t17,
		'surface-container-highest': neutral.t22,
	};

	return { primary, secondary, tertiary, neutral, neutralVariant, error, sys };
}

export function tokensToCSS(tokens: M3Tokens): string {
	const lines: string[] = [':root {'];

	// Tonal palettes
	for (const [paletteName, tones] of Object.entries(tokens)) {
		if (paletteName === 'sys') continue;
		for (const [toneKey, hex] of Object.entries(tones)) {
			lines.push(`  --md-ref-palette-${paletteName}-${toneKey}: ${hex};`);
		}
	}

	// System tokens
	for (const [key, hex] of Object.entries(tokens.sys)) {
		lines.push(`  --md-sys-color-${key}: ${hex};`);
		lines.push(`  --${key}: ${hex};`);
	}

	lines.push('}');
	return lines.join('\n');
}

/** Default seed: lavender 💜 */
export const DEFAULT_SEED = '#B39DDB';
