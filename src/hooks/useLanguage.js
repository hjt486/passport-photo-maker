import { useState } from 'react'
import translations from '../translations/ui.json'

const DEFAULT_LANGUAGE = "zh"

export const useLanguage = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || DEFAULT_LANGUAGE
  )

  const translate = (key) => {
    try {
      return translations[key][language]
    } catch (error) {
      console.error(`Translation missing for key: ${key} in language: ${language}`)
      return key
    }
  }

  const translateObject = (obj) => {
    try {
      return obj[language]
    } catch (error) {
      console.error(`Translation missing for object in language: ${language}`)
      return JSON.stringify(obj)
    }
  }

  const getLanguage = () => language

  const handleSetLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  return {
    translate,
    translateObject,
    setLanguage: handleSetLanguage,
    getLanguage
  }
}