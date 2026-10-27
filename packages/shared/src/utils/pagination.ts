import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * @throws RangeError if page or size is not an integer >= 1
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("page must be an integer >= 1")
  }
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be an integer >= 1")
  }
  const total = items.length
  const totalPages = Math.ceil(total / size)
  const start = (page - 1) * size
  const data = items.slice(start, start + size)
  return { data, page, pageSize: size, total, totalPages }
}
