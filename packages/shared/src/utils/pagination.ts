import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / size)
  const data = items.slice((page - 1) * size, page * size)
  return { data, page, pageSize: size, total, totalPages }
}
