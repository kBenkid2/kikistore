'use client'

import { useState } from 'react'
import { MessageCircle, Check } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { getTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'

export default function Footer() {
  const discordUsername = 'elainedna'
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [copied, setCopied] = useState(false)

  const handleDoubleClick = async () => {
    try {
      await navigator.clipboard.writeText(discordUsername)
      setCopied(true)
      toast.success(language === 'vi' ? 'Đã copy tên Discord!' : 'Discord name copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error(language === 'vi' ? 'Lỗi khi copy' : 'Failed to copy')
    }
  }

  return (
    <footer className="bg-gradient-to-t from-cyan-950/90 via-blue-900/80 to-cyan-800/70 backdrop-blur-sm border-t border-cyan-500/30 mt-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-blue-500/20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cyan-600/20 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center">
          <div 
            onDoubleClick={handleDoubleClick}
            className="flex items-center justify-center gap-2 mb-4 cursor-pointer"
            title={language === 'vi' ? 'Double-click để copy' : 'Double-click to copy'}
          >
            <MessageCircle className="w-5 h-5 text-cyan-300 animate-pulse" />
            <span className="text-cyan-100 select-all">
              {t('contactBuy')}: <span className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                {copied ? (
                  <span className="flex items-center gap-1 inline-flex">
                    <Check className="w-4 h-4" />
                    {discordUsername}
                  </span>
                ) : (
                  discordUsername
                )}
              </span>
            </span>
          </div>
          <p className="text-cyan-200/80 text-sm">
            {t('footer.copyright')}
          </p>
          <p className="text-cyan-300/60 text-xs mt-2">
            {t('footer.paymentNote')}
          </p>
        </div>
      </div>
    </footer>
  )
}

