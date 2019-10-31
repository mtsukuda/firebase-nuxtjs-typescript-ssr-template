import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { nuxtI18nSeo } from './seo-head'

Vue.use(VueI18n)

export default async ({ app, route, store, req }) => {
  // Options
  const lazy = false
  const vuex = {"moduleName":"i18n","mutations":{"setLocale":"I18N_SET_LOCALE","setMessages":"I18N_SET_MESSAGES"},"preserveState":false}

  // Helpers
  const LOCALE_CODE_KEY = 'code'
  const LOCALE_DOMAIN_KEY = 'domain'
  const getLocaleCodes = (locales = []) => {
  if (locales.length) {
    // If first item is a sting, assume locales is a list of codes already
    if (typeof locales[0] === 'string') {
      return locales
    }
    // Attempt to get codes from a list of objects
    if (typeof locales[0][LOCALE_CODE_KEY] === 'string') {
      return locales.map(locale => locale[LOCALE_CODE_KEY])
    }
  }
  return []
}
  const getLocaleFromRoute = (route = {}, routesNameSeparator = '', defaultLocaleRouteNameSuffix = '', locales = []) => {
  const codes = getLocaleCodes(locales)
  const localesPattern = `(${codes.join('|')})`
  const defaultSuffixPattern = `(?:${routesNameSeparator}${defaultLocaleRouteNameSuffix})?`
  // Extract from route name
  if (route.name) {
    const regexp = new RegExp(`${routesNameSeparator}${localesPattern}${defaultSuffixPattern}$`, 'i')
    const matches = route.name.match(regexp)
    if (matches && matches.length > 1) {
      return matches[1]
    }
  } else if (route.path) {
    // Extract from path
    const regexp = new RegExp(`^/${localesPattern}/`, 'i')
    const matches = route.path.match(regexp)
    if (matches && matches.length > 1) {
      return matches[1]
    }
  }
  return null
}
  const getHostname = () => (
  process.browser ? window.location.href.split('/')[2] : req.headers.host // eslint-disable-line
)
  const getForwarded = () => (
  process.browser ? window.location.href.split('/')[2] : (req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host)
)
  const getLocaleDomain = () => {
  const hostname = app.i18n.forwardedHost ? getForwarded() : getHostname()
  if (hostname) {
    const localeDomain = app.i18n.locales.find(l => l[LOCALE_DOMAIN_KEY] === hostname) // eslint-disable-line
    if (localeDomain) {
      return localeDomain[LOCALE_CODE_KEY]
    }
  }
  return null
}
  const syncVuex = (locale = null, messages = null) => {
  if (vuex && store) {
    if (locale !== null && vuex.mutations.setLocale) {
      store.dispatch(vuex.moduleName + '/setLocale', locale)
    }
    if (messages !== null && vuex.mutations.setMessages) {
      store.dispatch(vuex.moduleName + '/setMessages', messages)
    }
  }
}

  // Register Vuex module
  if (store) {
    store.registerModule(vuex.moduleName, {
      namespaced: true,
      state: () => ({
        locale: '',
        messages: {}
      }),
      actions: {
        setLocale ({ commit }, locale) {
          commit(vuex.mutations.setLocale, locale)
        },
        setMessages ({ commit }, messages) {
          commit(vuex.mutations.setMessages, messages)
        }
      },
      mutations: {
        [vuex.mutations.setLocale] (state, locale) {
          state.locale = locale
        },
        [vuex.mutations.setMessages] (state, messages) {
          state.messages = messages
        }
      }
    }, { preserveState: vuex.preserveState })
  }

  // Set instance options
  app.i18n = new VueI18n({"fallbackLocale":"en","messages":{"ja":{"home_title":"ホーム","inspire_title":"インスパイヤ","home_card_1_title":"フリー","home_card_1_body":"<a href=\"https://github.com/buefy/buefy\"> GitHub</a>のオープンソース","home_card_2_title":"レスポンシブ","home_card_2_body":"<b class=\"has-text-grey\">全</b>コンポーネントがレスポンシブ","home_card_3_title":"モダン","home_card_3_body":"<a href=\"https://vuejs.org/\">Vue.js</a>と<a href=\"http://bulma.io/\">Bulma</a>で構成","home_card_4_title":"軽量","home_card_4_body":"他の内部依存関係はありません","inspire_heading":"はじめよう","inspire_subheading":"作ったひと: <a href=\"https://github.com/memory-lovers\">めもらば</a>","site_name":"Nuxtテンプレート(TypeScript+Buefy+Sass+SEO+i18n)","site_description":"TypeScript, Sass、Firebase Cloud FunctionsでのSSRを使ったNuxt.jsのテンプレート","home_details":"ホームのディスクリプション","inspire_details":"インスパイヤのディスクリプション"},"en":{"home_title":"Home","inspire_title":"Inspire","home_card_1_title":"Free","home_card_1_body":"Open source on <a href=\"https://github.com/buefy/buefy\"> GitHub</a>","home_card_2_title":"Responsive","home_card_2_body":"<b class=\"has-text-grey\">Every</b> component is responsive","home_card_3_title":"Modern","home_card_3_body":"Built with <a href=\"https://vuejs.org/\">Vue.js</a> and <a href=\"http://bulma.io/\">Bulma</a>","home_card_4_title":"Lightweight","home_card_4_body":"No other internal dependency","inspire_heading":"Just start","inspire_subheading":"Author: <a href=\"https://github.com/memory-lovers\">Memory Lovers</a>","site_name":"Nuxt Template (TypeScript+Buefy+Sass+SEO+i18n)","site_description":"Nuxt.js Template using TypeScript, Sass and SSR on Firebase Cloud Functions","home_details":"Description of Home Page","inspire_details":"Description of Inspire Page"}}})
  app.i18n.locales = [{"code":"en","iso":"en_US"},{"code":"ja","iso":"ja_JP"}]
  app.i18n.defaultLocale = 'en'
  app.i18n.differentDomains = false
  app.i18n.forwardedHost = false
  app.i18n.beforeLanguageSwitch = () => null
  app.i18n.onLanguageSwitched = () => null
  // Extension of Vue
  if (!app.$t) {
    app.$t = app.i18n.t
  }

  // Inject seo function
  Vue.prototype.$nuxtI18nSeo = nuxtI18nSeo

  if (store && store.state.localeDomains) {
    app.i18n.locales.forEach(locale => {
      locale.domain = store.state.localeDomains[locale.code];
    })
  }

  let locale = app.i18n.defaultLocale || null

  if (app.i18n.differentDomains) {
    const domainLocale = getLocaleDomain()
    locale = domainLocale ? domainLocale : locale
  } else {
    const routesNameSeparator = '___'
    const defaultLocaleRouteNameSuffix = 'default'

    const routeLocale = getLocaleFromRoute(route, routesNameSeparator, defaultLocaleRouteNameSuffix, app.i18n.locales)
    locale = routeLocale ? routeLocale : locale
  }

  app.i18n.locale = locale

  // Lazy-load translations
  if (lazy) {
    const { loadLanguageAsync } = require('./utils')
    const messages = await loadLanguageAsync(app.i18n, app.i18n.locale)
    syncVuex(locale, messages)
    return messages
  } else {
    // Sync Vuex
    syncVuex(locale, app.i18n.getLocaleMessage(locale))
  }
}
