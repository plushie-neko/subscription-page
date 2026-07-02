/**
 * Mock data for development without a Remnawave panel.
 * Provides realistic subscription info + subpage config.
 */
import type { SubscriptionData, SubpageConfig } from '$lib/types';

export const MOCK_SUBSCRIPTION: SubscriptionData = {
	response: {
		username: 'nyauser',
		shortUuid: 'abc123',
		userStatus: 'ACTIVE',
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
		daysLeft: 30,
		trafficUsed: '12.4 GB',
		trafficLimit: '100 GB',
		onlineAt: new Date().toISOString(),
		links: [
			'vless://example-key-1@server.example.com:443?type=tcp&security=tls#🇳🇱%20Netherlands%20%231',
			'vless://example-key-2@server.example.com:443?type=tcp&security=tls#🇩🇪%20Germany%20%231',
			'vless://example-key-3@server.example.com:443?type=tcp&security=tls#🇺🇸%20United%20States%20%231',
			'vless://example-key-4@server.example.com:443?type=tcp&security=tls#🇯🇵%20Japan%20%231',
		],
		ssConfLinks: {}
	}
};

export const MOCK_CONFIG: SubpageConfig = {
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
							title: { en: 'Install Streisand', ru: 'Установите Streisand' },
							description: { en: 'Get the app from App Store', ru: 'Скачайте из App Store' },
							steps: [
								{ text: { en: 'Open the App Store on your device', ru: 'Откройте App Store' } },
								{ text: { en: 'Search for "Streisand"', ru: 'Найдите «Streisand»' } },
								{ text: { en: 'Install and open the app', ru: 'Установите и откройте' } }
							],
							buttons: [
								{
									text: { en: 'App Store', ru: 'App Store' },
									link: 'https://apps.apple.com/app/streisand/id6450534064',
									type: 'external',
									svgIconKey: 'apple'
								},
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
							title: { en: 'Install V2Box', ru: 'Установите V2Box' },
							description: { en: 'Alternative client for iOS', ru: 'Альтернативный клиент' },
							steps: [
								{ text: { en: 'Download V2Box from App Store', ru: 'Скачайте V2Box' } },
								{ text: { en: 'Open the app and add subscription', ru: 'Откройте и добавьте подписку' } }
							],
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
							title: { en: 'Install V2rayNG', ru: 'Установите V2rayNG' },
							description: { en: 'Popular Android VPN client', ru: 'Популярный клиент' },
							steps: [
								{ text: { en: 'Download from Google Play', ru: 'Скачайте из Google Play' } },
								{ text: { en: 'Open and tap "+" to add subscription', ru: 'Откройте и нажмите «+»' } },
								{ text: { en: 'Paste subscription link', ru: 'Вставьте ссылку подписки' } }
							],
							buttons: [
								{
									text: { en: 'Google Play', ru: 'Google Play' },
									link: 'https://play.google.com/store/apps/details?id=com.v2ray.ang',
									type: 'external',
									svgIconKey: 'android'
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
							title: { en: 'Install Hiddify', ru: 'Установите Hiddify' },
							description: { en: 'Cross-platform VPN client', ru: 'Кроссплатформенный клиент' },
							steps: [
								{ text: { en: 'Download from GitHub releases', ru: 'Скачайте с GitHub' } },
								{ text: { en: 'Run installer and follow prompts', ru: 'Запустите установщик' } },
								{ text: { en: 'Add subscription URL in settings', ru: 'Добавьте URL подписки' } }
							],
							buttons: [
								{
									text: { en: 'Download', ru: 'Скачать' },
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
							title: { en: 'Install Hiddify', ru: 'Установите Hiddify' },
							description: { en: 'Cross-platform VPN client for macOS', ru: 'Клиент для macOS' },
							steps: [
								{ text: { en: 'Download the DMG from GitHub', ru: 'Скачайте DMG' } },
								{ text: { en: 'Drag to Applications folder', ru: 'Перетащите в Applications' } },
								{ text: { en: 'Open and add subscription', ru: 'Откройте и добавьте подписку' } }
							],
							buttons: [
								{
									text: { en: 'Download', ru: 'Скачать' },
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
	translations: {
		en: {
			name: 'Username',
			status: 'Status',
			active: 'Active',
			inactive: 'Inactive',
			expires: 'Expires',
			bandwidth: 'Bandwidth',
			installationGuideHeader: 'Installation Guide',
			connectionKeysHeader: 'Connection Keys',
			linkCopied: 'Link Copied',
			linkCopiedToClipboard: 'Subscription link copied to clipboard',
			getLink: 'Get Link',
			copyLink: 'Copy Link',
			scanQrCode: 'Scan QR Code',
			scanQrCodeDescription: 'Scan this QR code with your VPN app to import the subscription',
			scanToImport: 'Scan to import this key',
			neverExpires: 'Never',
			daysLeft: '{days} days left',
			expired: 'Expired',
			unlimited: 'Unlimited'
		},
		ru: {
			name: 'Имя',
			status: 'Статус',
			active: 'Активна',
			inactive: 'Неактивна',
			expires: 'Истекает',
			bandwidth: 'Трафик',
			installationGuideHeader: 'Инструкция по установке',
			connectionKeysHeader: 'Ключи подключения',
			linkCopied: 'Ссылка скопирована',
			linkCopiedToClipboard: 'Ссылка на подписку скопирована',
			getLink: 'Получить ссылку',
			copyLink: 'Копировать ссылку',
			scanQrCode: 'Сканируйте QR-код',
			scanQrCodeDescription: 'Отсканируйте QR-код приложением VPN для импорта подписки',
			scanToImport: 'Сканируйте для импорта',
			neverExpires: 'Бессрочно',
			daysLeft: 'Осталось {days} дн.',
			expired: 'Истекла',
			unlimited: 'Безлимит'
		}
	}
};
