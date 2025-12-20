'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Upload, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  game: string
  price: string | null
  imageUrl: string | null
  isAvailable: boolean
}

interface ProductFormProps {
  token: string
  product?: Product | null
  onSuccess: () => void
  onCancel?: () => void
}

const games = ['Dungeon Quest', 'Arcane Conquest', 'Fabled Legacy', 'Pixel Blade']
const categories = [
  { value: 'item', label: 'Item' },
  { value: 'account', label: 'Account' },
]

export default function ProductForm({ token, product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'item',
    game: product?.game || 'Dungeon Quest',
    price: product?.price || '',
    isAvailable: product?.isAvailable !== undefined ? product.isAvailable : true,
  })
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload thất bại')
      }

      setImageUrl(data.url)
      toast.success('Upload ảnh thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Upload ảnh thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Thao tác thất bại')
      }

      toast.success(product ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!')
      setFormData({
        name: '',
        description: '',
        category: 'item',
        game: 'Dungeon Quest',
        price: '',
        isAvailable: true,
      })
      setImageUrl('')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Thao tác thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2">Tên sản phẩm *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Loại *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
          required
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Game *</label>
        <select
          value={formData.game}
          onChange={(e) => setFormData({ ...formData, game: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
          required
        >
          {games.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Giá</label>
        <input
          type="text"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="VD: 100k, Liên hệ, ..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Ảnh sản phẩm</label>
        {imageUrl && (
          <div className="relative mb-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded border border-gray-600"
            />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white cursor-pointer hover:bg-gray-600 transition-colors">
          <Upload className="w-5 h-5" />
          <span>{uploading ? 'Đang upload...' : imageUrl ? 'Thay đổi ảnh' : 'Chọn ảnh'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="isAvailable" className="text-gray-300">
          Sản phẩm đang có sẵn
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {submitting ? 'Đang xử lý...' : product ? 'Cập nhật' : 'Thêm sản phẩm'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}

