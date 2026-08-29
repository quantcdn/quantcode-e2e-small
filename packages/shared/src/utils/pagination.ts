import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number. Floored to an integer; any page below 1
 *               (or a non-finite value) yields an empty page.
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = size > 0 ? Math.ceil(total / size) : 0
  const currentPage = Math.floor(page)
  const start = (currentPage - 1) * size
  const data = size > 0 && currentPage >= 1 ? items.slice(start, start + size) : []

  return { data, page: currentPage, pageSize: size, total, totalPages }
}
