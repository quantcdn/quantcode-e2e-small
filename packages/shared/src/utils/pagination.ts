import type { PaginatedResponse } from "../types"

const DEFAULT_PAGE_SIZE = 10

/**
 * Paginate an array of items.
 *
 * Non-finite inputs (NaN, Infinity) are rejected rather than clamped, since
 * Math.max(1, NaN) is NaN and Math.floor(Infinity) is Infinity — either would
 * break the numeric contract or return the whole dataset in one page.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = Number.isFinite(size) ? Math.max(1, Math.floor(size)) : DEFAULT_PAGE_SIZE
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const totalPages = Math.ceil(total / pageSize)
  const start = (currentPage - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    total,
    page: currentPage,
    pageSize,
    totalPages,
  }
}
