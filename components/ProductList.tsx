'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Edit, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  game: string
  price: string | null
  imageUrl: string | null
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

interface ProductListProps {
  products: Product[]
  token: string
  onEdit: (product: Product) => void
  onDelete: () => void
}

export default function ProductList({ products, token, onEdit, onDelete }: ProductListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Xóa thất bại')
      }

      toast.success('Xóa sản phẩm thành công!')
      onDelete()
    } catch (error: any) {
      toast.error(error.message || 'Xóa sản phẩm thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Chưa có sản phẩm nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-indigo-500 transition-colors"
        >
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-24 h-24 bg-gray-600 rounded flex-shrink-0">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover rounded"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {product.name}
                    </h3>
                    {!product.isAvailable && (
                      <span className="px-2 py-1 bg-red-600/20 border border-red-500/50 rounded text-xs text-red-400">
                        Hết hàng
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-indigo-400 mb-1">{product.game}</p>
                  <p className="text-xs text-gray-400 mb-1">
                    {product.category} • {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  {product.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                  {product.price && (
                    <p className="text-sm font-semibold text-green-400 mt-1">
                      {product.price}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

