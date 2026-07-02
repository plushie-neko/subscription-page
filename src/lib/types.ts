/**
 * Types for subscription page data.
 * These mirror the Remnawave backend contract types.
 */

export interface SubscriptionUser {
	shortUuid: string;
	daysLeft: number;
	trafficUsed: string;
	trafficLimit: string;
	lifetimeTrafficUsed?: string;
	trafficUsedBytes?: number;
	trafficLimitBytes?: number;
	lifetimeTrafficUsedBytes?: number;
	username: string;
	expiresAt: string | null;
	isActive: boolean;
	userStatus: 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';
	trafficLimitStrategy?: string;
}

export interface SubscriptionInfo {
	isFound: boolean;
	user: SubscriptionUser;
	links: string[];
	ssConfLinks: Record<string, string>;
	subscriptionUrl?: string;
}

export interface SubscriptionData {
	response: SubscriptionInfo;
}

export interface PlatformAppButton {
	text: Record<string, string>;
	link: string;
	type: 'external' | 'subscriptionLink' | 'copyButton';
	svgIconKey: string;
}

export interface PlatformAppBlock {
	svgIconKey: string;
	svgIconColor: string;
	title: Record<string, string>;
	description: Record<string, string>;
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
	version: string | number;
	baseSettings: BaseSettings;
	brandingSettings: BrandingSettings;
	uiConfig: UIConfig;
	platforms: Partial<Record<PlatformKey, PlatformConfig>>;
	locales: string[];
	svgLibrary: Record<string, string>;
	baseTranslations: Record<string, Record<string, string>>;
}
