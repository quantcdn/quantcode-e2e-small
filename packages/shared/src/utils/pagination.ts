import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items (1-indexed page).
 * Throws RangeError unless page and size are positive integers.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError(`page must be a positive integer, got ${page}`)
  }
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`size must be a positive integer, got ${size}`)
  }
  const total = items.length
  const start = (page - 1) * size
  return {
    data: items.slice(start, start + size),
    page,
    pageSize: size,
    total,
    totalPages: Math.ceil(total / size),
  }
}
