import type { StrapiApp } from '@strapi/strapi/admin';
import extra from './translations/uk-extra.json';
import code from './translations/uk-code.json';
import seo from './translations/uk-seo.json';
import logo from './extensions/logo.png';

/**
 * Admin in Ukrainian: Strapi's own Ukrainian plus the strings it lacks (uk-extra.json: newer admin screens, media
 * library), labels that exist only as English defaults in the code (uk-code.json: list "status", version history…)
 * and the SEO plugin, which ships without Ukrainian (uk-seo.json; keys get the "seo." plugin prefix).
 * Ukrainian is the default; a user can still switch to English in the profile (the choice is kept in the browser).
 */
const LANGUAGE_KEY = 'strapi-admin-language';
try {
  if (!window.localStorage.getItem(LANGUAGE_KEY)) window.localStorage.setItem(LANGUAGE_KEY, 'uk');
} catch {
  // Storage blocked: Strapi falls back to English.
}

export default {
  config: {
    locales: ['uk'],
    translations: {
      uk: {
        ...extra,
        ...code,
        ...Object.fromEntries(Object.entries(seo).map(([key, value]) => [`seo.${key}`, value])),
        'Auth.form.welcome.title': 'Нова Підлога та Двері',
        'Auth.form.welcome.subtitle': 'Увійдіть до панелі керування',
        'Auth.form.rememberMe.label': "Запам'ятати мене",
        'Auth.form.email.placeholder': 'Напр. manager@example.com',
      },
    },
    auth: { logo },
    menu: { logo },
    // The site's red (#e53935) instead of Strapi's purple; "primary" drives links, tabs, focus and active items.
    theme: {
      light: { colors: {
        primary100: '#fdecea', primary200: '#f8c9c5', primary500: '#ef5350', primary600: '#e53935', primary700: '#c62828',
        buttonPrimary500: '#ef5350', buttonPrimary600: '#e53935',
      } },
      dark: { colors: {
        primary100: '#2b1716', primary200: '#6b3431', primary500: '#ff7773', primary600: '#ff7773', primary700: '#ff7773',
        buttonPrimary500: '#ef5350', buttonPrimary600: '#e53935',
      } },
    },
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap(_app: StrapiApp) {},
};
