/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { filterSortPaginate } from './filter-sort-paginate.js';

/**
 * Client-side table state for <DataTable>: search, one "any of" filter,
 * sorting and paging. Any change to what is shown returns to page 1.
 *
 * @param {Array}  rows                 All rows (null/undefined while loading).
 * @param {Object} options
 * @param {Array}  options.searchFields Row keys the search looks in.
 * @param {string} options.filterField  Row key the filter chips apply to.
 * @param {Object} options.sort         Initial { field, direction }.
 * @param {number} options.perPage      Rows per page (default 20).
 * @return {Object} Visible rows, totals and setters.
 */
export function useTableState( rows, options = {} ) {
	const { sort: initialSort, searchFields, filterField, perPage } = options;
	const [ search, setSearch ] = useState( '' );
	const [ filter, setFilter ] = useState( [] );
	const [ sort, setSort ] = useState( initialSort );
	const [ page, setPage ] = useState( 1 );
	// Compared by content, so inline arrays do not recompute every render.
	const searchKey = String( searchFields );

	const result = useMemo(
		() =>
			filterSortPaginate(
				rows,
				{ search, filter, sort, page },
				{ searchFields, filterField, perPage }
			),
		// searchFields is tracked through searchKey (by content).
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ rows, search, filter, sort, page, filterField, perPage, searchKey ]
	);

	return {
		...result,
		setPage,
		search,
		setSearch: ( value ) => {
			setSearch( value );
			setPage( 1 );
		},
		filter,
		toggleFilter: ( value ) => {
			setFilter( ( prev ) =>
				prev.includes( value )
					? prev.filter( ( item ) => item !== value )
					: [ ...prev, value ]
			);
			setPage( 1 );
		},
		clearFilter: () => {
			setFilter( [] );
			setPage( 1 );
		},
		sort,
		// Same column flips direction; a new column starts descending.
		toggleSort: ( field ) =>
			setSort( ( prev ) => ( {
				field,
				direction:
					prev?.field === field && prev.direction === 'desc'
						? 'asc'
						: 'desc',
			} ) ),
	};
}
