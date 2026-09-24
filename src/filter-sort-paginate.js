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

let collator;

/**
 * Locale-aware comparison: accented initials sort with their base letter,
 * and numeric strings sort as numbers ("9" before "10").
 *
 * @param {*} a First value.
 * @param {*} b Second value.
 * @return {number} Negative, zero or positive.
 */
export function compareValues( a, b ) {
	const emptyA = a === null || a === undefined || a === '';
	const emptyB = b === null || b === undefined || b === '';
	if ( emptyA || emptyB ) {
		return Number( emptyA ) - Number( emptyB );
	}
	if ( typeof a === 'number' && typeof b === 'number' ) {
		return a - b;
	}
	if ( ! collator ) {
		const lang =
			( typeof document !== 'undefined' &&
				document.documentElement.lang ) ||
			undefined;
		collator = new Intl.Collator( lang, {
			numeric: true,
			sensitivity: 'base',
		} );
	}
	return collator.compare( String( a ), String( b ) );
}

// Normalized search text per row, computed once per row object and field set.
const haystacks = new WeakMap();

function haystackOf( row, searchFields, columns, key ) {
	let cache = haystacks.get( row );
	if ( cache?.key !== key ) {
		const parts = searchFields.map( ( field ) => row[ field ] );
		columns.forEach( ( column ) =>
			parts.push( column.searchValue( row ) )
		);
		cache = { key, text: normalize( parts.flat().join( ' ' ) ) };
		haystacks.set( row, cache );
	}
	return cache.text;
}

/**
 * Whether a row passes every active filter. Within a filter any chosen value
 * matches; array-valued row fields match when they contain one of them.
 *
 * @param {Object} row     Row.
 * @param {Object} filters { [field]: value[] }.
 * @return {boolean} Match.
 */
export function matchesFilters( row, filters = {} ) {
	return Object.entries( filters ).every( ( [ field, values ] ) => {
		if ( ! values || ! values.length ) {
			return true;
		}
		const value = row[ field ];
		return Array.isArray( value )
			? value.some( ( item ) => values.includes( item ) )
			: values.includes( value );
	} );
}

/**
 * Apply search, filters, sort and paging to a row list. Pure function — the
 * useTableState() hook wraps it; usable on its own with any markup.
 *
 * @param {Array}  rows                 All rows.
 * @param {Object} query
 * @param {string} query.search         Free text; every word must match.
 * @param {Object} query.filters        { [field]: allowed values } (empty = all).
 * @param {Object} query.sort           { field, direction: 'asc'|'desc' }.
 * @param {number} query.page           1-based page.
 * @param {number} query.perPage        Rows per page.
 * @param {Object} options
 * @param {Array}  options.searchFields Row keys the search looks in.
 * @param {Array}  options.columns      Columns; `searchValue( row )` joins the
 *                                      search text, `sortValue( row )` drives sorting.
 * @return {{rows: Array, total: number, page: number, totalPages: number}} Result.
 */
export function filterSortPaginate(
	rows,
	{ search = '', filters = {}, sort, page = 1, perPage = 20 } = {},
	{ searchFields = [], columns = [] } = {}
) {
	const words = normalize( search ).split( /\s+/ ).filter( Boolean );
	const searchColumns = columns.filter( ( column ) => column.searchValue );
	const key =
		searchFields.join( '|' ) +
		'#' +
		searchColumns.map( ( c ) => c.id ).join( '|' );

	const matched = ( rows || [] ).filter( ( row ) => {
		if ( ! matchesFilters( row, filters ) ) {
			return false;
		}
		if ( ! words.length ) {
			return true;
		}
		const text = haystackOf( row, searchFields, searchColumns, key );
		return words.every( ( word ) => text.includes( word ) );
	} );

	if ( sort?.field ) {
		const column = columns.find( ( c ) => c.id === sort.field );
		const valueOf = column?.sortValue ?? ( ( row ) => row[ sort.field ] );
		const dir = sort.direction === 'asc' ? 1 : -1;
		matched.sort( ( a, b ) => {
			const x = valueOf( a );
			const y = valueOf( b );
			const emptyX = x === null || x === undefined || x === '';
			const emptyY = y === null || y === undefined || y === '';
			// Empty values stay last in both directions.
			if ( emptyX || emptyY ) {
				return Number( emptyX ) - Number( emptyY );
			}
			return compareValues( x, y ) * dir;
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
