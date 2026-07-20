import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Returns a paginated slice of the array together with total count and page metadata.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / size)
  const start = (page - 1) * size
  const data = items.slice(start, start + size)
  return { data, total, totalPages, page, pageSize: size }
}
