/**
 * Types for subscription page data.
 * These mirror the Remnawave backend contract types.
 */

export interface SubscriptionUser {
	username: string;
	shortUuid: string;
	userStatus: 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';
	expiresAt: string | null;
	daysLeft: number;
	trafficUsed: string;
	trafficLimit: string;
	onlineAt: string | null;
	links: string[];
	ssConfLinks: Record<string, string>;
}

export interface SubscriptionData {
	response: SubscriptionUser;
}

export interface PlatformAppButton {
	text: Record<string, string>;
	link: string;
	type: 'external' | 'subscriptionLink' | 'copyButton';
	svgIconKey: string;
}

export interface PlatformAppBlock {
	title: Record<string, string>;
	description: Record<string, string>;
	steps: Array<{
		text: Record<string, string>;
	}>;
	buttons: PlatformAppButton[];
}

export interface PlatformApp {
	name: string;
	svgIconKey?: string;
	featured?: boolean;
	blocks: PlatformAppBlock[];
}

export interface PlatformConfig {
	displayName: Record<string, string>;
	svgIconKey: string;
	apps: PlatformApp[];
}

export type PlatformKey = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'androidTV' | 'appleTV';

export interface BrandingSettings {
	title: string;
	logoUrl: string;
	supportUrl: string;
}

export interface BaseSettings {
	metaTitle: string;
	metaDescription: string;
	showConnectionKeys: boolean;
	hideGetLinkButton: boolean;
}

export interface UIConfig {
	subscriptionInfoBlockType: 'cards' | 'collapsed' | 'expanded' | 'hidden';
	installationGuidesBlockType: 'cards' | 'timeline' | 'accordion' | 'minimal';
}

export interface SubpageConfig {
	baseSettings: BaseSettings;
	brandingSettings: BrandingSettings;
	uiConfig: UIConfig;
	platforms: Partial<Record<PlatformKey, PlatformConfig>>;
	locales: string[];
	svgLibrary: Record<string, string>;
	translations: Record<string, Record<string, string>>;
}
