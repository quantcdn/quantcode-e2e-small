import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Both `page` and `size` are normalised before use: non-finite or
 * non-positive values are coerced to a safe default (page 1, size 0)
 * and fractional values are floored. This prevents a negative `size`
 * from being passed through to `Array.prototype.slice`, where a
 * negative end index would be treated as an offset from the end of the
 * array and over-fetch items.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 0
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1

  const total = items.length
  const totalPages = safeSize > 0 ? Math.ceil(total / safeSize) : 0
  const start = (safePage - 1) * safeSize
  const data = safeSize > 0 && start < total ? items.slice(start, start + safeSize) : []

  return {
    data,
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
  }
}
