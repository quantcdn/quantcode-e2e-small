import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Page and size are normalised to positive integers so that caller-supplied
 * values (often derived from untrusted query strings) cannot produce a
 * negative slice offset or a non-finite page count.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Math.max(1, Math.trunc(size) || 1)
  const currentPage = Math.max(1, Math.trunc(page) || 1)

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
