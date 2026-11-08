import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const safePage = Math.max(1, Math.floor(page))
  const safeSize = Math.max(1, Math.floor(size))
  const start = (safePage - 1) * safeSize
  return {
    data: items.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total: items.length,
    totalPages: Math.ceil(items.length / safeSize),
  }
}
