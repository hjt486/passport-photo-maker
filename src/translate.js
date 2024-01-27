// translate.js
import { useState } from 'react'
import translations from './ui.json'

const DEFAULT_LANGUAGE = "en"

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE)

  function setLanguage(language) {
    setCurrentLanguage(language)
  }

  function getLanguage() {
    return currentLanguage
  }

  function translate(key) {
    const languageTranslations = translations[key]

    const translatedText = languageTranslations && languageTranslations[currentLanguage]
      ? languageTranslations[currentLanguage]
      : translations[key][DEFAULT_LANGUAGE]

    return translatedText || key
  }

  function translateObject(str) {
    return str[currentLanguage]
  }

  return { currentLanguage, setLanguage, getLanguage, translate, translateObject}
}
