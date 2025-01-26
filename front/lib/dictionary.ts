import 'server-only'
import type { Locale } from '@/i18n.config'

const dictionaries = {
    en: () => import('@/locales/en/all.json').then(module => module.default),
    fa: () => import('@/locales/fa/all.json').then(module => module.default),
    kur: () => import('@/locales/kur/all.json').then(module => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()

const dictionaries_user = {
    en: () => import('@/locales/en/user.json').then(module => module.default),
    fa: () => import('@/locales/fa/user.json').then(module => module.default),
    kur: () => import('@/locales/kur/user.json').then(module => module.default),
}

export const getDictionary_user = async (locale: Locale) => dictionaries_user[locale]()

const dictionaries_menu = {
    en: () => import('@/locales/en/menu.json').then(module => module.default),
    fa: () => import('@/locales/fa/menu.json').then(module => module.default),
    kur: () => import('@/locales/kur/menu.json').then(module => module.default),
}

export const getDictionary_menu = async (locale: Locale) => dictionaries_menu[locale]()


const dictionaries_payment = {
    en: () => import('@/locales/en/payment.json').then(module => module.default),
    fa: () => import('@/locales/fa/payment.json').then(module => module.default),
    kur: () => import('@/locales/kur/payment.json').then(module => module.default),
}

export const getDictionary_payment = async (locale: Locale) => dictionaries_payment[locale]()


const dictionaries_form = {
    en: () => import('@/locales/en/form.json').then(module => module.default),
    fa: () => import('@/locales/fa/form.json').then(module => module.default),
    kur: () => import('@/locales/kur/form.json').then(module => module.default),
}

export const getDictionary_form = async (locale: Locale) => dictionaries_form[locale]()


const dictionaries_terms = {
    en: () => import('@/locales/en/terms.json').then(module => module.default),
    fa: () => import('@/locales/fa/terms.json').then(module => module.default),
    kur: () => import('@/locales/kur/terms.json').then(module => module.default),
}

export const getDictionary_terms = async (locale: Locale) => dictionaries_terms[locale]()

const dictionaries_message = {
    en: () => import('@/locales/en/message.json').then(module => module.default),
    fa: () => import('@/locales/fa/message.json').then(module => module.default),
    kur: () => import('@/locales/kur/message.json').then(module => module.default),
}

export const getDictionary_message = async (locale: Locale) => dictionaries_message[locale]()