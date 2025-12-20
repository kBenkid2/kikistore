export type Language = 'vi' | 'en'

export const translations = {
  vi: {
    siteName: 'Kiki StoreGame',
    home: 'Trang chủ',
    admin: 'Admin',
    heroTitle: 'Kiki StoreGame',
    heroSubtitle: 'Bán item, account các game',
    contactDiscord: 'Liên hệ qua Discord',
    contactBuy: 'Liên hệ mua hàng qua Discord',
    noProducts: 'Chưa có sản phẩm nào. Vui lòng quay lại sau!',
    contactDiscordBtn: 'Contact',
    category: {
      item: 'Item',
      account: 'Account',
    },
    status: {
      available: 'Còn hàng',
      soldOut: 'Hết hàng',
      updated: 'Cập nhật',
    },
    footer: {
      copyright: '© 2025 Kiki StoreGame. Tất cả quyền được bảo lưu.',
      paymentNote: 'Thanh toán và giao dịch được thực hiện qua Discord để đảm bảo an toàn.',
    },
    filter: {
      all: 'Tất cả',
      game: 'Game',
    },
  },
  en: {
    siteName: 'Kiki StoreGame',
    home: 'Home',
    admin: 'Admin',
    heroTitle: 'Kiki StoreGame',
    heroSubtitle: 'Sell items, accounts for games',
    contactDiscord: 'Contact via Discord',
    contactBuy: 'Contact to buy via Discord',
    noProducts: 'No products available. Please come back later!',
    contactDiscordBtn: 'Contact',
    category: {
      item: 'Item',
      account: 'Account',
    },
    status: {
      available: 'Available',
      soldOut: 'Sold Out',
      updated: 'Updated',
    },
    footer: {
      copyright: '© 2025 Kiki StoreGame. All rights reserved.',
      paymentNote: 'Payment and transactions are handled via Discord for security.',
    },
    filter: {
      all: 'All',
      game: 'Game',
    },
  },
}

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to Vietnamese if key not found
      value = translations.vi
      for (const k2 of keys) {
        value = value?.[k2]
      }
      break
    }
  }
  
  return value || key
}

