export const i18n = {
    locales : ['en', 'fa', 'kur'],
    defaultLocale : 'en'
} as const

// module.exports = i18nConfig;
export type Locale = (typeof i18n)['locales'][number]