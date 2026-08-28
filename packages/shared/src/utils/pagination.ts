import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Inputs are clamped rather than throwing, so every field of the returned
 * `PaginatedResponse` is always a finite, JSON-serialisable number:
 *
 * - `page` is truncated to an integer and clamped to a minimum of 1. Values
 *   below 1 are treated as page 1, so the slice start can never go negative — a
 *   negative start would otherwise be reinterpreted by `Array.slice` as an
 *   offset from the end and return a bogus mid-array window.
 * - A non-finite `page` (`NaN` / `±Infinity`) is *not* treated as page 1, which
 *   would return real first-page data indistinguishable from a genuine
 *   first-page request. It is instead normalised to `totalPages + 1`, the first
 *   page past the end of `items`, so the request is reported as out-of-range and
 *   `data` comes back empty — consistent with a finite too-large `page`.
 * - `size` is truncated to an integer and clamped to a minimum of 1. This keeps
 *   `totalPages` a valid non-negative integer; an unclamped `size <= 0`, `NaN`,
 *   or fractional size would produce `Infinity` / `NaN` / a negative count,
 *   which serialises to JSON `null` and violates the declared `number` type.
 *
 * The clamped values are what get reported back in `page` and `pageSize`, so
 * the response always describes the window actually returned.
 *
 * Pages past the end of `items` yield an empty `data` array rather than throwing.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const safeSize = Number.isFinite(size) ? Math.max(1, Math.trunc(size)) : 1
  const totalPages = Math.ceil(items.length / safeSize)
  const safePage = Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : totalPages + 1
  const start = (safePage - 1) * safeSize
  return {
    data: items.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total: items.length,
    totalPages,
  }
}
