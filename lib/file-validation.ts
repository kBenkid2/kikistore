/**
 * File validation utilities with magic bytes checking
 */

// Magic bytes (file signatures) for common image formats
const MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF header, need to check further for WEBP
  gif: [0x47, 0x49, 0x46, 0x38], // GIF87a or GIF89a
} as const

const MIME_TYPES = {
  jpeg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
  webp: ['image/webp'],
  gif: ['image/gif'],
} as const

export interface FileValidationResult {
  valid: boolean
  error?: string
  detectedType?: 'jpeg' | 'png' | 'webp' | 'gif'
}

/**
 * Validate file by checking magic bytes (file signature)
 * This is more secure than just checking file extension
 */
export function validateFileByMagicBytes(
  buffer: Buffer,
  mimeType: string
): FileValidationResult {
  if (buffer.length < 8) {
    return { valid: false, error: 'File too small to validate' }
  }

  const bytes = Array.from(buffer.slice(0, 12))

  // Check JPEG
  if (
    bytes[0] === MAGIC_BYTES.jpeg[0] &&
    bytes[1] === MAGIC_BYTES.jpeg[1] &&
    bytes[2] === MAGIC_BYTES.jpeg[2]
  ) {
    if (MIME_TYPES.jpeg.includes(mimeType as 'image/jpeg' | 'image/jpg')) {
      return { valid: true, detectedType: 'jpeg' }
    }
    return { valid: false, error: 'File signature is JPEG but MIME type does not match' }
  }

  // Check PNG
  if (
    bytes[0] === MAGIC_BYTES.png[0] &&
    bytes[1] === MAGIC_BYTES.png[1] &&
    bytes[2] === MAGIC_BYTES.png[2] &&
    bytes[3] === MAGIC_BYTES.png[3]
  ) {
    if (MIME_TYPES.png.includes(mimeType as 'image/png')) {
      return { valid: true, detectedType: 'png' }
    }
    return { valid: false, error: 'File signature is PNG but MIME type does not match' }
  }

  // Check WebP (RIFF...WEBP)
  if (
    bytes[0] === MAGIC_BYTES.webp[0] &&
    bytes[1] === MAGIC_BYTES.webp[1] &&
    bytes[2] === MAGIC_BYTES.webp[2] &&
    bytes[3] === MAGIC_BYTES.webp[3]
  ) {
    // Check for WEBP string at position 8-11
    const webpString = buffer.slice(8, 12).toString('ascii')
    if (webpString === 'WEBP') {
      if (MIME_TYPES.webp.includes(mimeType as 'image/webp')) {
        return { valid: true, detectedType: 'webp' }
      }
      return { valid: false, error: 'File signature is WebP but MIME type does not match' }
    }
  }

  // Check GIF
  if (
    bytes[0] === MAGIC_BYTES.gif[0] &&
    bytes[1] === MAGIC_BYTES.gif[1] &&
    bytes[2] === MAGIC_BYTES.gif[2] &&
    (bytes[3] === 0x37 || bytes[3] === 0x39) // GIF87a or GIF89a
  ) {
    if (MIME_TYPES.gif.includes(mimeType as 'image/gif')) {
      return { valid: true, detectedType: 'gif' }
    }
    return { valid: false, error: 'File signature is GIF but MIME type does not match' }
  }

  return {
    valid: false,
    error: 'Invalid file signature. File is not a valid image (JPEG, PNG, WebP, or GIF)',
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  buffer: Buffer,
  maxWidth: number = 4000,
  maxHeight: number = 4000
): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
  // For basic validation, we can check PNG and JPEG dimensions from headers
  // For production, consider using sharp or jimp library for full validation
  
  try {
    // PNG dimensions are at bytes 16-23
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      const width = buffer.readUInt32BE(16)
      const height = buffer.readUInt32BE(20)
      
      if (width > maxWidth || height > maxHeight) {
        return {
          valid: false,
          width,
          height,
          error: `Image dimensions (${width}x${height}) exceed maximum allowed (${maxWidth}x${maxHeight})`,
        }
      }
      return { valid: true, width, height }
    }

    // JPEG dimensions require parsing SOF markers (more complex)
    // For now, we'll skip detailed JPEG dimension validation
    // In production, use sharp library for accurate validation
  } catch (error) {
    return { valid: false, error: 'Failed to read image dimensions' }
  }

  return { valid: true }
}

