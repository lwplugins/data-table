/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { filterSortPaginate } from './filter-sort-paginate.js';
import { DEFAULT_QUERY, createTableApi } from './query.js';

/**
 * Client-side table state for <DataTable>: search, filters, sorting, paging.
 *
 * @param {Array}  rows                 All rows (null/undefined while loading).
 * @param {Object} options
 * @param {Array}  options.searchFields Row keys the search looks in.
 * @param {Array}  options.columns      Columns (for `sortValue` / `searchValue`).
 * @param {Object} options.sort         Initial sort { field, direction }.
 * @param {number} options.perPage      Initial rows per page (default 20).
 * @param {Object} options.filters      Initial filters { [field]: values }.
 * @return {Object} Table API: visible rows, totals, query and setters.
 */
export function useTableState( rows, options = {} ) {
	const { searchFields = [], columns = [], sort, perPage, filters } = options;
	const [ query, setQuery ] = useState( () => ( {
		...DEFAULT_QUERY,
		sort,
		perPage: perPage ?? DEFAULT_QUERY.perPage,
		filters: filters ?? {},
	} ) );
	// Compared by content, so inline arrays do not recompute every render.
	const searchKey = searchFields.join( '|' );

	const result = useMemo(
		() => filterSortPaginate( rows, query, { searchFields, columns } ),
		// searchFields is tracked through searchKey (by content).
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ rows, query, searchKey, columns ]
	);

	return createTableApi( query, setQuery, result );
}
