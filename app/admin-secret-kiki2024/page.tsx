'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ProductForm from '@/components/ProductForm'
import ProductList from '@/components/ProductList'
import Header from '@/components/Header'
import LanguageProvider from '@/components/LanguageProvider'

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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
      fetchProducts(savedToken)
    }
  }, [])

  const fetchProducts = async (authToken: string) => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        setIsAuthenticated(false)
        setToken(null)
        return
      }

      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Lỗi khi tải danh sách sản phẩm')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại')
      }

      setToken(data.token)
      localStorage.setItem('admin_token', data.token)
      setIsAuthenticated(true)
      toast.success('Đăng nhập thành công!')
      fetchProducts(data.token)
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setIsAuthenticated(false)
    setProducts([])
    toast.success('Đã đăng xuất')
  }

  const handleProductCreated = () => {
    if (token) {
      fetchProducts(token)
    }
    setEditingProduct(null)
  }

  const handleProductUpdated = () => {
    if (token) {
      fetchProducts(token)
    }
    setEditingProduct(null)
  }

  const handleProductDeleted = () => {
    if (token) {
      fetchProducts(token)
    }
  }

  const handleProductReorder = (reorderedProducts: Product[]) => {
    setProducts(reorderedProducts)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  if (!isAuthenticated) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Header />
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">
                Admin Login
              </h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Đăng xuất
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <ProductForm
                  token={token!}
                  product={editingProduct}
                  onSuccess={editingProduct ? handleProductUpdated : handleProductCreated}
                  onCancel={() => setEditingProduct(null)}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Danh sách sản phẩm</h2>
                <ProductList
                  products={products}
                  token={token!}
                  onEdit={handleEdit}
                  onDelete={handleProductDeleted}
                  onReorder={handleProductReorder}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LanguageProvider>
  )
}
