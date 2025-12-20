'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { getTranslation } from '@/lib/i18n'

export default function Header() {
  const { language, setLanguage } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  return (
    <header className="bg-gradient-to-r from-cyan-950/90 via-blue-900/80 to-cyan-800/90 backdrop-blur-md border-b border-cyan-400/30 sticky top-0 z-50 shadow-lg shadow-cyan-900/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ShoppingBag className="w-8 h-8 text-cyan-200 group-hover:text-cyan-100 transition-colors animate-float drop-shadow-lg" />
            <span className="text-2xl font-bold text-white drop-shadow-lg group-hover:text-cyan-100 transition-colors">
              Kiki StoreGame
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-cyan-50 hover:text-white transition-colors relative group font-medium"
            >
              {t('home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {/* Admin link đã bị ẩn - chỉ truy cập trực tiếp qua URL bí mật */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 rounded text-sm transition-all ${
                  language === 'vi'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/50'
                }`}
              >
                VI
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-sm transition-all ${
                  language === 'en'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/50'
                }`}
              >
                EN
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

