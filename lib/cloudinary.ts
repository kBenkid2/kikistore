/**
 * Cloudinary upload utility
 * Alternative to local file storage for Vercel deployment
 */

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  secureUrl: string
}

/**
 * Upload image to Cloudinary
 */
export async function uploadToCloudinary(
  file: File | Buffer,
  folder: string = 'kikistore'
): Promise<CloudinaryUploadResult> {
  const cloudinaryUrl = process.env.CLOUDINARY_URL
  
  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL not configured')
  }

  // Parse Cloudinary URL: cloudinary://api_key:api_secret@cloud_name
  const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/)
  if (!urlMatch) {
    throw new Error('Invalid CLOUDINARY_URL format')
  }

  const [, apiKey, apiSecret, cloudName] = urlMatch

  // Convert File to base64 if needed
  let base64Data: string
  if (file instanceof File) {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    base64Data = `data:${file.type};base64,${base64}`
  } else {
    base64Data = `data:image/png;base64,${file.toString('base64')}`
  }

  // Create form data
  const formData = new FormData()
  formData.append('file', base64Data)
  formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'kikistore')
  formData.append('folder', folder)

  // Upload to Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to upload to Cloudinary')
  }

  const data = await response.json()

  return {
    url: data.secure_url,
    publicId: data.public_id,
    secureUrl: data.secure_url,
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloudinaryUrl = process.env.CLOUDINARY_URL
  
  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL not configured')
  }

  const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/)
  if (!urlMatch) {
    throw new Error('Invalid CLOUDINARY_URL format')
  }

  const [, apiKey, apiSecret, cloudName] = urlMatch
  const timestamp = Math.round(new Date().getTime() / 1000)
  
  // Generate signature
  const crypto = require('crypto')
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex')

  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('timestamp', timestamp.toString())
  formData.append('api_key', apiKey)
  formData.append('signature', signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to delete from Cloudinary')
  }
}

