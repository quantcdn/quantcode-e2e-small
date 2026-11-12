import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 * @throws RangeError if page or size is not a positive integer
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer")
  }
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("page must be a positive integer")
  }
  const total = items.length
  const start = (page - 1) * size
  return {
    data: items.slice(start, start + size),
    page,
    pageSize: size,
    total,
    totalPages: Math.ceil(total / size),
  }
}
