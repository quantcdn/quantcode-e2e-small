import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` array rather than throwing.
 * `page` and `size` are clamped to a minimum of 1 so that untrusted query
 * parameters cannot produce a negative slice offset.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : 1
  const safeSize = Number.isFinite(size) ? Math.max(1, Math.trunc(size)) : 1

  const total = items.length
  const totalPages = Math.ceil(total / safeSize)
  const start = (safePage - 1) * safeSize

  return {
    data: items.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
  }
}
