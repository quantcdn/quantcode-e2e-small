import type { PaginatedResponse } from "../types"

const DEFAULT_PAGE_SIZE = 10

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Pages outside the available range yield an empty `data` array rather than
 * throwing, so callers can pass user-supplied paging params safely.
 *
 * `page` and `size` are always normalised to finite positive integers, so the
 * returned `page`/`pageSize` satisfy the numeric `PaginatedResponse` contract
 * even for non-finite input (`Number("Infinity")`), which would otherwise
 * serialise to `null` in JSON.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Number.isFinite(size) ? Math.max(1, Math.trunc(size) || 1) : DEFAULT_PAGE_SIZE
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.trunc(page) || 1) : 1

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
