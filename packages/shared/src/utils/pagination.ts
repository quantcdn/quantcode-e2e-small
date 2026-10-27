import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Number.isFinite(size) ? Math.max(1, Math.floor(size)) : 1
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1

  const total = items.length
  const totalPages = Math.ceil(total / pageSize)

  const start = (currentPage - 1) * pageSize
  const data = items.slice(start, start + pageSize)

  return {
    data,
    page: currentPage,
    pageSize,
    total,
    totalPages,
  }
}
