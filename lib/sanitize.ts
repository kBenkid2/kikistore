/**
 * Input sanitization utilities
 * Removes potentially dangerous HTML/JavaScript from user input
 */

/**
 * Basic HTML tag removal (for simple text sanitization)
 * For production, consider using DOMPurify library
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=

  return sanitized.trim()
}

/**
 * Sanitize HTML content (allows safe HTML tags)
 * This is a basic implementation - for production use DOMPurify
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // List of allowed HTML tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')

  // Only allow specific tags
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match
    }
    return '' // Remove disallowed tags
  })

  return sanitized.trim()
}

/**
 * Validate and sanitize product name
 */
export function sanitizeProductName(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  // Remove HTML, limit length
  let sanitized = sanitizeText(name)
  sanitized = sanitized.substring(0, 200) // Max 200 characters

  return sanitized
}

/**
 * Validate and sanitize product description
 */
export function sanitizeProductDescription(description: string | null | undefined): string {
  if (!description || typeof description !== 'string') {
    return ''
  }

  // Allow basic HTML formatting
  let sanitized = sanitizeHTML(description)
  sanitized = sanitized.substring(0, 2000) // Max 2000 characters

  return sanitized
}

/**
 * Validate and sanitize game name
 */
export function sanitizeGameName(game: string): string {
  if (!game || typeof game !== 'string') {
    return ''
  }

  let sanitized = sanitizeText(game)
  sanitized = sanitized.substring(0, 100) // Max 100 characters

  return sanitized
}

/**
 * Validate and sanitize price
 */
export function sanitizePrice(price: string | null | undefined): string | null {
  if (!price || typeof price !== 'string') {
    return null
  }

  // Allow numbers, currency symbols, and common price formats
  const sanitized = price.replace(/[^0-9.,$€£¥₫VND\s-]/g, '')
  return sanitized.substring(0, 50) || null
}

