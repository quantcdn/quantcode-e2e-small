import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * `page` and `size` are clamped to a minimum of 1 and truncated to integers;
 * non-finite values (`NaN`, `Infinity`) are treated as 1. A page beyond the
 * available range returns an empty `data` array rather than throwing. An empty
 * input array yields `totalPages: 0`.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const clamp = (n: number) => (Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1)
  const pageSize = clamp(size)
  const currentPage = clamp(page)
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
