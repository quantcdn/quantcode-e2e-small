import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length

  if (size <= 0) {
    return { data: [], page, pageSize: size, total, totalPages: 0 }
  }

  const totalPages = Math.ceil(total / size)
  const start = (page - 1) * size
  const data = start < 0 ? [] : items.slice(start, start + size)

  return { data, page, pageSize: size, total, totalPages }
}