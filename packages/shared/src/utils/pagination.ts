import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * `page` and `pageSize` are echoed back as supplied; an out-of-range page
 * yields an empty `data` array rather than being clamped.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const start = (page - 1) * size

  return {
    data: items.slice(start, start + size),
    page,
    pageSize: size,
    total: items.length,
    totalPages: Math.ceil(items.length / size),
  }
}
