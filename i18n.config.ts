import { defineI18nConfig } from '#i18n'

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  warnHtmlMessage: false
}))
