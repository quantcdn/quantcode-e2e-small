import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` slice rather than throwing. Non-finite
 * inputs (NaN, ±Infinity) fall back to 1 — callers commonly derive these from
 * `Number(query("page"))` on an absent or malformed query param, and letting them
 * through would emit NaN/Infinity that `JSON.stringify` serialises to `null`.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Number.isFinite(size) ? Math.max(1, Math.floor(size)) : 1
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (currentPage - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    page: currentPage,
    pageSize,
    total,
    totalPages,
  }
}
