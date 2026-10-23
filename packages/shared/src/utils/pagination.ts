import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` array rather than throwing.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length

  if (size <= 0) {
    return { data: [], page, pageSize: size, total, totalPages: 0 }
  }

  const totalPages = Math.ceil(total / size)
  const start = (Math.max(1, page) - 1) * size
  const data = items.slice(start, start + size)

  return { data, page, pageSize: size, total, totalPages }
}
