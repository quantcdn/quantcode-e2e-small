import type { PaginatedResponse } from "../types"

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

/**
 * Coerce a value to a finite integer >= 1.
 *
 * Non-finite input (NaN, Infinity, -Infinity) falls back to `fallback` rather
 * than propagating into the result, so callers passing unvalidated input (e.g.
 * `Number(req.query.page)`) can never produce a NaN page or an unbounded slice.
 */
function toPositiveInt(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value))
}

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` array rather than throwing.
 * `page` and `size` are always normalised to finite integers >= 1.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = toPositiveInt(size, DEFAULT_PAGE_SIZE)
  const currentPage = toPositiveInt(page, DEFAULT_PAGE)
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
