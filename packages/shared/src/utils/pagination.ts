import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Pages outside the available range yield an empty `data` array while still
 * reporting the requested `page`/`pageSize` alongside the true totals.
 *
 * `page` and `size` are normalised to finite integers so the returned
 * `page`/`pageSize` always satisfy the declared `number` contract — a NaN or
 * Infinity would otherwise serialise to `null` through `JSON.stringify`.
 * Non-finite `size` (and any `size <= 0`) collapses to a `pageSize` of 0;
 * non-finite or sub-1 `page` clamps to the first page.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = Number.isFinite(size) ? Math.max(0, Math.floor(size)) : 0
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
  const start = (currentPage - 1) * pageSize

  return {
    data: pageSize > 0 ? items.slice(start, start + pageSize) : [],
    page: currentPage,
    pageSize,
    total,
    totalPages,
  }
}
