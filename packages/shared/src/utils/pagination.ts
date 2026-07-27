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
  const pageSize = size
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
  const start = (page - 1) * pageSize
  const data = start >= 0 && start < total ? items.slice(start, start + pageSize) : []

  return { data, page, pageSize, total, totalPages }
}
