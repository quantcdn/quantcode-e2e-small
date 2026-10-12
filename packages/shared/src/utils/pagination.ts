import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * `page` and `size` are normalised to positive integers so untrusted input
 * (e.g. an unvalidated query string) cannot produce a NaN or negative slice.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Number.isFinite(size) ? Math.max(1, Math.floor(size)) : 1
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1

  const total = items.length
  const start = (currentPage - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    page: currentPage,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}
