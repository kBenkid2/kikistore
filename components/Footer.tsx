'use client'

import { useState } from 'react'
import { MessageCircle, Check } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { getTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export default function Footer() {
  const discordUsername = 'elainedna'
  const facebookUrl = 'https://www.facebook.com/van.vu.58402'
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
          {/* Contact Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {/* Discord Contact */}
            <div 
              onDoubleClick={handleDoubleClick}
              className="flex items-center justify-center gap-2 cursor-pointer group"
              title={language === 'vi' ? 'Double-click để copy' : 'Double-click to copy'}
            >
              <MessageCircle className="w-5 h-5 text-cyan-300 animate-pulse group-hover:text-cyan-200 transition-colors" />
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

            {/* Facebook Contact */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 cursor-pointer group hover:scale-105 transition-transform"
              title={t('contactFacebook')}
            >
              <FacebookIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-cyan-100">
                {t('contactFacebook')}: <span className="font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">
                  Van Vu
                </span>
              </span>
            </a>
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

