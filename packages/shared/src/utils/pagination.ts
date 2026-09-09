import type { PaginatedResponse } from "../types"

function toPositiveInt(value: number): number {
  if (!Number.isFinite(value)) return 1
  const floored = Math.floor(value)
  return floored < 1 ? 1 : floored
}

/**
 * Paginate an array of items.
 *
 * `page` and `size` are truncated to integers and clamped to a minimum of 1.
 * Non-finite values (`NaN`, `Infinity`, `-Infinity`) and values below 1 fall
 * back to 1, so untrusted input such as `Number(query.page)` can never leak
 * `NaN` into the response.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number; defaults to 1 if non-finite or < 1
 * @param size   Number of items per page; defaults to 1 if non-finite or < 1
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = toPositiveInt(size)
  const currentPage = toPositiveInt(page)
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
