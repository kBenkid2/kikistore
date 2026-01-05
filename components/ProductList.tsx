'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Edit, Trash2, GripVertical, Search, ChevronDown, ChevronUp } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  game: string
  price: string | null
  imageUrl: string | null
  isAvailable: boolean
  stock: number | null
  order: number
  createdAt: string
  updatedAt: string
}

interface ProductListProps {
  products: Product[]
  token: string
  onEdit: (product: Product) => void
  onDelete: () => void
  onReorder?: (products: Product[]) => void
}

function SortableItem({ product, token, onEdit, onDelete, deletingId, setDeletingId }: {
  product: Product
  token: string
  onEdit: (product: Product) => void
  onDelete: () => void
  deletingId: string | null
  setDeletingId: (id: string | null) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-indigo-500 transition-colors ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-indigo-400 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

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
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-400">
                  {product.category} • {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                </p>
                {product.stock !== null && (
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    product.stock > 0 
                      ? 'bg-green-600/20 text-green-400 border border-green-500/50' 
                      : 'bg-red-600/20 text-red-400 border border-red-500/50'
                  }`}>
                    Stock: {product.stock}
                  </span>
                )}
              </div>
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
  )
}

const games = ['Dungeon Quest', 'Arcane Conquest', 'Fabled Legacy', 'Pixel Blade']

export default function ProductList({ products, token, onEdit, onDelete, onReorder }: ProductListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sortedProducts, setSortedProducts] = useState<Product[]>(products)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set(games))

  // Update local state when products prop changes
  useEffect(() => {
    setSortedProducts(products)
  }, [products])

  // Filter products based on search query
  const filteredProducts = sortedProducts.filter((product) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.game.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.price?.toLowerCase().includes(query)
    )
  })

  // Group products by game
  const productsByGame = games.reduce((acc, game) => {
    acc[game] = filteredProducts.filter(p => p.game === game)
    return acc
  }, {} as Record<string, Product[]>)

  const toggleGame = (game: string) => {
    const newExpanded = new Set(expandedGames)
    if (newExpanded.has(game)) {
      newExpanded.delete(game)
    } else {
      newExpanded.add(game)
    }
    setExpandedGames(newExpanded)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || searchQuery) {
      // Don't allow drag when searching
      return
    }

    const oldIndex = sortedProducts.findIndex((p) => p.id === active.id)
    const newIndex = sortedProducts.findIndex((p) => p.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newProducts = arrayMove(sortedProducts, oldIndex, newIndex)
    setSortedProducts(newProducts)

    // Update order values
    const updatedProducts = newProducts.map((product, index) => ({
      ...product,
      order: index,
    }))

    try {
      const response = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: updatedProducts.map((p) => ({ id: p.id, order: p.order })),
        }),
      })

      if (!response.ok) {
        throw new Error('Cập nhật thứ tự thất bại')
      }

      toast.success('Đã cập nhật thứ tự sản phẩm!')
      if (onReorder) {
        onReorder(updatedProducts)
      }
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thứ tự thất bại')
      // Revert on error
      setSortedProducts(products)
    }
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Chưa có sản phẩm nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm, mô tả, game, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Không tìm thấy sản phẩm nào với từ khóa "{searchQuery}"</p>
        </div>
      ) : searchQuery ? (
        // When searching, show all results without grouping
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={[]}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <SortableItem
                  key={product.id}
                  product={product}
                  token={token}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  deletingId={deletingId}
                  setDeletingId={setDeletingId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        // Group by game when not searching
        <div className="space-y-4">
          {games.map((game) => {
            const gameProducts = productsByGame[game] || []
            if (gameProducts.length === 0) return null

            const isExpanded = expandedGames.has(game)

            return (
              <div key={game} className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleGame(game)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{game}</h3>
                    <span className="px-2 py-1 bg-indigo-600/20 border border-indigo-500/50 rounded text-xs text-indigo-400">
                      {gameProducts.length} sản phẩm
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={gameProducts.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {gameProducts.map((product) => (
                            <SortableItem
                              key={product.id}
                              product={product}
                              token={token}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              deletingId={deletingId}
                              setDeletingId={setDeletingId}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {searchQuery && (
        <div className="text-sm text-gray-400 text-center">
          Hiển thị {filteredProducts.length} / {sortedProducts.length} sản phẩm
        </div>
      )}
    </div>
  )
}

