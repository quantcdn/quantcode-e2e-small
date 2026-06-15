import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number (clamped to ≥1)
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const safePage = Math.max(1, Math.floor(page))
  const total = items.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / size)
  const start = (safePage - 1) * size
  const data = start >= total ? [] : items.slice(start, start + size)
  return { data, page: safePage, pageSize: size, total, totalPages }
}
