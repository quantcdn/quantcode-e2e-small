import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` array. Non-positive or non-finite
 * `page`/`size` values are normalised so an untrusted query parameter can never
 * produce a negative slice offset (which would return unintended items).
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 0
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
  const start = (currentPage - 1) * pageSize
  const data = pageSize > 0 ? items.slice(start, start + pageSize) : []

  return { data, page: currentPage, pageSize, total, totalPages }
}
