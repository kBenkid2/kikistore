import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { requireAuth } from '@/lib/middleware'
import { withRateLimit } from '@/lib/rate-limit'
import { validateFileByMagicBytes, validateImageDimensions } from '@/lib/file-validation'

async function handler(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file signature (magic bytes) - SECURITY: Prevent fake file extensions
    const magicBytesValidation = validateFileByMagicBytes(buffer, file.type)
    if (!magicBytesValidation.valid) {
      console.warn(`Invalid file signature detected: ${magicBytesValidation.error}`, {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      })
      return NextResponse.json(
        { error: magicBytesValidation.error || 'Invalid file format. File may be corrupted or malicious.' },
        { status: 400 }
      )
    }

    // Validate image dimensions (max 4000x4000)
    const dimensionValidation = await validateImageDimensions(buffer, 4000, 4000)
    if (!dimensionValidation.valid) {
      return NextResponse.json(
        { error: dimensionValidation.error || 'Image dimensions exceed maximum allowed size.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Return URL
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(handler)

