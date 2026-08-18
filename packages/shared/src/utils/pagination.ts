import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Returns the requested slice along with the page metadata. An out-of-range page
 * yields an empty `data` array.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
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
