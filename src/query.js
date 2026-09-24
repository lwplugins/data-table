/**
 * The one state shape both modes share. Client mode keeps it in
 * useTableState(); server mode receives it as `query` / `onQueryChange`.
 */
export const DEFAULT_QUERY = {
	search: '',
	filters: {},
	sort: undefined,
	page: 1,
	perPage: 20,
};

/**
 * Merge a change into a query. Anything that changes what is shown —
 * search, filters, sort, per page — returns to page 1.
 *
 * @param {Object} query Current query.
 * @param {Object} patch Changed keys.
 * @return {Object} Next query.
 */
export function patchQuery( query, patch ) {
	const resets = [ 'search', 'filters', 'sort', 'perPage' ].some(
		( key ) => key in patch
	);
	return {
		...query,
		...patch,
		page: resets ? 1 : ( patch.page ?? query.page ),
	};
}

/**
 * The object <DataTable> drives: current rows/totals plus setters, all
 * expressed as query changes.
 *
 * @param {Object}   query    Current query.
 * @param {Function} setQuery Receives the next query.
 * @param {Object}   result   { rows, total, totalPages, page }.
 * @return {Object} Table API.
 */
export function createTableApi( query, setQuery, result ) {
	const update = ( patch ) => setQuery( patchQuery( query, patch ) );
	const filters = query.filters || {};

	return {
		...result,
		query,
		search: query.search,
		filters,
		sort: query.sort,
		perPage: query.perPage,
		setQuery: update,
		setSearch: ( search ) => update( { search } ),
		setPage: ( page ) => update( { page } ),
		setPerPage: ( perPage ) => update( { perPage } ),
		setFilter: ( field, values ) =>
			update( { filters: { ...filters, [ field ]: values } } ),
		toggleFilter: ( field, value, multiple = true ) => {
			const current = filters[ field ] || [];
			let next = [ value ];
			if ( current.includes( value ) ) {
				next = current.filter( ( item ) => item !== value );
			} else if ( multiple ) {
				next = [ ...current, value ];
			}
			update( { filters: { ...filters, [ field ]: next } } );
		},
		clearFilters: ( field ) =>
			update( {
				filters: field ? { ...filters, [ field ]: [] } : {},
			} ),
		// Same column flips; a new column starts in its default direction.
		toggleSort: ( field, defaultDirection = 'desc' ) => {
			let direction = defaultDirection;
			if ( query.sort?.field === field ) {
				direction = query.sort.direction === 'asc' ? 'desc' : 'asc';
			}
			update( { sort: { field, direction } } );
		},
	};
}

/**
 * Whether any search or filter narrows the rows.
 *
 * @param {Object} query Query.
 * @return {boolean} Narrowed.
 */
export const isNarrowed = ( query ) =>
	Boolean( query.search?.trim() ) ||
	Object.values( query.filters || {} ).some( ( values ) => values?.length );
