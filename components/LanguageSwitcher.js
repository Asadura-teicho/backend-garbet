'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-white text-xs font-medium hover:text-primary transition-colors"
      >
        <span className="truncate">{currentLanguage.code.toUpperCase()}</span>
        <span className="material-symbols-outlined text-sm">expand_more</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 rounded-lg bg-surface-dark border border-border-dark shadow-lg z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-primary/20 text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

