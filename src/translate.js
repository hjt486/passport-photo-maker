// translate.js
import translations from './ui.json'

export function useLanguage() {
  function translate(key) {
    return translations[key] || key
  }

  function translateObject(value) {
    return value
  }

  return { translate, translateObject }
}
