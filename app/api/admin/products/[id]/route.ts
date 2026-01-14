import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { withRateLimit } from '@/lib/rate-limit'
import {
  sanitizeProductName,
  sanitizeProductDescription,
  sanitizeGameName,
  sanitizePrice,
} from '@/lib/sanitize'

async function handler(
  req: NextRequest,
  context?: { params?: Promise<{ id: string }> | { id: string } }
) {
  const auth = requireAuth(req)
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Handle both Promise and direct params
  let id: string
  if (context?.params) {
    if (context.params instanceof Promise) {
      const params = await context.params
      id = params.id
    } else {
      id = context.params.id
    }
  } else {
    // Extract from URL if params not available
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    id = pathParts[pathParts.length - 1]
  }

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    )
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json()
      let { name, description, category, game, price, imageUrl, isAvailable, stock } = body

      // Sanitize all user inputs
      if (name) name = sanitizeProductName(name)
      if (description !== undefined) description = sanitizeProductDescription(description)
      if (game) game = sanitizeGameName(game)
      if (price !== undefined) price = sanitizePrice(price)
      
      // Validate category if provided
      if (category) {
        const allowedCategories = ['ult', 'ring', 'account', 'service']
        if (!allowedCategories.includes(category)) {
          return NextResponse.json(
            { error: 'Invalid category' },
            { status: 400 }
          )
        }
      }

      // Validate stock for account category
      if (category === 'account' && (stock === null || stock === undefined || stock < 0)) {
        return NextResponse.json(
          { error: 'Stock is required for account category' },
          { status: 400 }
        )
      }

      // Validate stock value
      if (stock !== null && stock !== undefined) {
        stock = parseInt(stock, 10)
        if (isNaN(stock) || stock < 0) {
          return NextResponse.json(
            { error: 'Invalid stock value' },
            { status: 400 }
          )
        }
      }

      // Log admin action
      console.info(`[ADMIN] Product updated`, {
        timestamp: new Date().toISOString(),
        admin: auth.username,
        productId: id,
        productName: name,
      })

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(category && { category }),
          ...(game && { game }),
          ...(price !== undefined && { price }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(isAvailable !== undefined && { isAvailable }),
          ...(stock !== undefined && { stock: stock !== null ? stock : null }),
        },
      })

      // Revalidate homepage to show updated product immediately
      revalidatePath('/')
      revalidatePath('/api/products')

      return NextResponse.json(product)
    } catch (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Get product info before deletion for logging
      const product = await prisma.product.findUnique({
        where: { id },
        select: { name: true },
      })

      // Log admin action
      console.info(`[ADMIN] Product deleted`, {
        timestamp: new Date().toISOString(),
        admin: auth.username,
        productId: id,
        productName: product?.name || 'Unknown',
      })

      await prisma.product.delete({
        where: { id },
      })

      // Revalidate homepage to remove deleted product immediately
      revalidatePath('/')
      revalidatePath('/api/products')

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export const PUT = withRateLimit(handler)
export const DELETE = withRateLimit(handler)

