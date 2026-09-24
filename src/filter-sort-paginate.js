/**
 * Lower-case and strip accents, so "Kep" matches "Kép".
 *
 * @param {*} value Any value.
 * @return {string} Normalized text.
 */
export const normalize = ( value ) =>
	String( value ?? '' )
		.toLowerCase()
		.normalize( 'NFD' )
		.replace( /[̀-ͯ]/g, '' );

/**
 * Apply search, filter, sort and paging to a row list. Pure function — the
 * useTableState() hook wraps it, and it is usable on its own (e.g. in tests
 * or with a different UI).
 *
 * @param {Array}  rows                 All rows.
 * @param {Object} state
 * @param {string} state.search         Free text; every word must match.
 * @param {Array}  state.filter         Allowed values of `filterField` (empty = all).
 * @param {Object} state.sort           { field, direction: 'asc'|'desc' }.
 * @param {number} state.page           1-based page.
 * @param {Object} options
 * @param {Array}  options.searchFields Row keys the search looks in.
 * @param {string} options.filterField  Row key the filter applies to.
 * @param {number} options.perPage      Rows per page.
 * @return {{rows: Array, total: number, page: number, totalPages: number}} Result.
 */
export function filterSortPaginate(
	rows,
	{ search = '', filter = [], sort, page = 1 } = {},
	{ searchFields = [], filterField, perPage = 20 } = {}
) {
	const words = normalize( search ).split( /\s+/ ).filter( Boolean );

	const matched = ( rows || [] ).filter( ( row ) => {
		if ( filter.length && ! filter.includes( row[ filterField ] ) ) {
			return false;
		}
		if ( ! words.length ) {
			return true;
		}
		const haystack = searchFields
			.map( ( key ) => normalize( row[ key ] ) )
			.join( ' ' );
		return words.every( ( word ) => haystack.includes( word ) );
	} );

	if ( sort?.field ) {
		const dir = sort.direction === 'asc' ? 1 : -1;
		matched.sort( ( a, b ) => {
			const x = a[ sort.field ];
			const y = b[ sort.field ];
			if ( x === y ) {
				return 0;
			}
			if ( x === null || x === undefined ) {
				return 1;
			}
			if ( y === null || y === undefined ) {
				return -1;
			}
			return ( x > y ? 1 : -1 ) * dir;
		} );
	}

	const size = Math.max( 1, perPage );
	const totalPages = Math.max( 1, Math.ceil( matched.length / size ) );
	const current = Math.min( Math.max( 1, page ), totalPages );

	return {
		rows: matched.slice( ( current - 1 ) * size, current * size ),
		total: matched.length,
		page: current,
		totalPages,
	};
}
