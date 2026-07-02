/**
 * Mock data for development without a Remnawave panel.
 * Provides realistic subscription info + subpage config.
 */
import type { SubscriptionData, SubpageConfig } from '$lib/types';

export const MOCK_SUBSCRIPTION: SubscriptionData = {
	response: {
		isFound: true,
		user: {
			shortUuid: 'abc123',
			daysLeft: 30,
			trafficUsed: '12.4 GB',
			trafficLimit: '100 GB',
			username: 'nyauser',
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
			isActive: true,
			userStatus: 'ACTIVE'
		},
		links: [
			'vless://example-key-1@server.example.com:443?type=tcp&security=tls#🇳🇱%20Netherlands%20%231',
			'vless://example-key-2@server.example.com:443?type=tcp&security=tls#🇩🇪%20Germany%20%231',
			'vless://example-key-3@server.example.com:443?type=tcp&security=tls#🇺🇸%20United%20States%20%231',
			'vless://example-key-4@server.example.com:443?type=tcp&security=tls#🇯🇵%20Japan%20%231'
		],
		ssConfLinks: {}
	}
};

export const MOCK_CONFIG: SubpageConfig = {
	version: 1,
	baseSettings: {
		metaTitle: 'My Subscription',
		metaDescription: 'Manage your VPN subscription',
		showConnectionKeys: true,
		hideGetLinkButton: false
	},
	brandingSettings: {
		title: 'NyaVPN',
		logoUrl: '',
		supportUrl: 'https://t.me/nyavpn_support'
	},
	uiConfig: {
		subscriptionInfoBlockType: 'expanded',
		installationGuidesBlockType: 'timeline'
	},
	platforms: {
		ios: {
			displayName: { en: 'iOS', ru: 'iOS' },
			svgIconKey: 'apple',
			apps: [
				{
					name: 'Streisand',
					svgIconKey: 'streisand',
					featured: true,
					blocks: [
						{
							title: { en: '1. Download Streisand', ru: '1. Установите Streisand' },
							description: { en: 'Open the App Store on your device and search for "Streisand", then download it.', ru: 'Откройте App Store на вашем устройстве, найдите и скачайте приложение Streisand.' },
							svgIconKey: 'download',
							svgIconColor: 'cyan',
							buttons: [
								{
									text: { en: 'App Store', ru: 'App Store' },
									link: 'https://apps.apple.com/app/streisand/id6450534064',
									type: 'external',
									svgIconKey: 'apple'
								}
							]
						},
						{
							title: { en: '2. Add Subscription Link', ru: '2. Добавьте ссылку на подписку' },
							description: { en: 'Tap the button below to automatically import your subscription link.', ru: 'Нажмите кнопку ниже, чтобы автоматически импортировать вашу подписку.' },
							svgIconKey: 'link',
							svgIconColor: 'teal',
							buttons: [
								{
									text: { en: 'Add Subscription', ru: 'Добавить подписку' },
									link: '{{subscriptionUrl}}',
									type: 'subscriptionLink',
									svgIconKey: 'link'
								}
							]
						}
					]
				},
				{
					name: 'V2Box',
					svgIconKey: 'v2box',
					blocks: [
						{
							title: { en: '1. Install V2Box', ru: '1. Установите V2Box' },
							description: { en: 'Search and download V2Box from the App Store.', ru: 'Найдите и скачайте V2Box в App Store.' },
							svgIconKey: 'download',
							svgIconColor: 'blue',
							buttons: [
								{
									text: { en: 'App Store', ru: 'App Store' },
									link: 'https://apps.apple.com/app/v2box/id6446814690',
									type: 'external',
									svgIconKey: 'apple'
								}
							]
						}
					]
				}
			]
		},
		android: {
			displayName: { en: 'Android', ru: 'Android' },
			svgIconKey: 'android',
			apps: [
				{
					name: 'V2rayNG',
					svgIconKey: 'v2rayng',
					featured: true,
					blocks: [
						{
							title: { en: '1. Download V2rayNG', ru: '1. Скачайте V2rayNG' },
							description: { en: 'Get the app from the Google Play Store.', ru: 'Скачайте приложение из магазина Google Play.' },
							svgIconKey: 'download',
							svgIconColor: 'green',
							buttons: [
								{
									text: { en: 'Google Play', ru: 'Google Play' },
									link: 'https://play.google.com/store/apps/details?id=com.v2ray.ang',
									type: 'external',
									svgIconKey: 'android'
								}
							]
						},
						{
							title: { en: '2. Import Subscription', ru: '2. Импортируйте подписку' },
							description: { en: 'Open the app, tap the "+" icon, and paste your subscription URL.', ru: 'Откройте приложение, нажмите значок «+» и вставьте ссылку на подписку.' },
							svgIconKey: 'link',
							svgIconColor: 'orange',
							buttons: [
								{
									text: { en: 'Copy Link', ru: 'Копировать ссылку' },
									link: '{{subscriptionUrl}}',
									type: 'copyButton',
									svgIconKey: 'link'
								}
							]
						}
					]
				}
			]
		},
		windows: {
			displayName: { en: 'Windows', ru: 'Windows' },
			svgIconKey: 'windows',
			apps: [
				{
					name: 'Hiddify',
					svgIconKey: 'hiddify',
					featured: true,
					blocks: [
						{
							title: { en: '1. Download Hiddify', ru: '1. Скачайте Hiddify' },
							description: { en: 'Download the client installer from GitHub releases page.', ru: 'Скачайте установочный файл со страницы релизов на GitHub.' },
							svgIconKey: 'download',
							svgIconColor: 'violet',
							buttons: [
								{
									text: { en: 'GitHub Releases', ru: 'Релизы GitHub' },
									link: 'https://github.com/hiddify/hiddify-app/releases',
									type: 'external',
									svgIconKey: 'download'
								}
							]
						}
					]
				}
			]
		},
		macos: {
			displayName: { en: 'macOS', ru: 'macOS' },
			svgIconKey: 'apple',
			apps: [
				{
					name: 'Hiddify',
					svgIconKey: 'hiddify',
					featured: true,
					blocks: [
						{
							title: { en: '1. Download Hiddify', ru: '1. Скачайте Hiddify' },
							description: { en: 'Download the DMG installation package for macOS from GitHub.', ru: 'Скачайте установочный пакет DMG для macOS с GitHub.' },
							svgIconKey: 'download',
							svgIconColor: 'violet',
							buttons: [
								{
									text: { en: 'Download DMG', ru: 'Скачать DMG' },
									link: 'https://github.com/hiddify/hiddify-app/releases',
									type: 'external',
									svgIconKey: 'download'
								}
							]
						}
					]
				}
			]
		}
	},
	locales: ['en', 'ru'],
	svgLibrary: {
		apple: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>',
		android: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 16 2-6 10 0 2 6"/><path d="M19 16v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4"/><path d="m9 4 1 4"/><path d="m15 4-1 4"/><circle cx="9" cy="11" r="0.5"/><circle cx="15" cy="11" r="0.5"/></svg>',
		windows: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="9" height="9" rx="1"/><rect x="13" y="3" width="9" height="9" rx="1"/><rect x="2" y="14" width="9" height="9" rx="1"/><rect x="13" y="14" width="9" height="9" rx="1"/></svg>',
		link: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
		download: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>'
	},
	baseTranslations: {
		installationGuideHeader: { en: 'Installation Guide', ru: 'Инструкция по установке' },
		connectionKeysHeader: { en: 'Connection Keys', ru: 'Ключи подключения' },
		linkCopied: { en: 'Link Copied', ru: 'Ссылка скопирована' },
		linkCopiedToClipboard: { en: 'Subscription link copied to clipboard', ru: 'Ссылка на подписку скопирована' },
		getLink: { en: 'Get Link', ru: 'Получить ссылку' },
		scanQrCode: { en: 'Scan QR Code', ru: 'Сканируйте QR-код' },
		scanQrCodeDescription: { en: 'Scan this QR code with your VPN app to import the subscription', ru: 'Отсканируйте QR-код приложением VPN для импорта подписки' },
		copyLink: { en: 'Copy Link', ru: 'Копировать ссылку' },
		name: { en: 'Username', ru: 'Имя' },
		status: { en: 'Status', ru: 'Статус' },
		active: { en: 'Active', ru: 'Активна' },
		inactive: { en: 'Inactive', ru: 'Неактивна' },
		expires: { en: 'Expires', ru: 'Истекает' },
		bandwidth: { en: 'Bandwidth', ru: 'Трафик' },
		scanToImport: { en: 'Scan to import this key', ru: 'Сканируйте для импорта' },
		expiresIn: { en: 'Expires in', ru: 'Истекает через' },
		expired: { en: 'Expired', ru: 'Истекла' },
		unknown: { en: 'Unknown', ru: 'Неизвестно' },
		indefinitely: { en: 'Indefinitely', ru: 'Бессрочно' }
	}
};
