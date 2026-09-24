/**
 * External dependencies
 */
import { describe, expect, it } from 'vitest';

/**
 * Internal dependencies
 */
import {
	compareValues,
	filterSortPaginate,
	matchesFilters,
	normalize,
} from '../src/filter-sort-paginate.js';

const ROWS = [
	{
		id: 1,
		name: 'Kép-feltöltés.jpg',
		type: 'converted',
		size: 300,
		tags: [ 'a' ],
	},
	{ id: 2, name: 'logo.png', type: 'skipped', size: 10, tags: [ 'b' ] },
	{
		id: 3,
		name: 'hero banner.jpg',
		type: 'converted',
		size: 900,
		tags: [ 'a', 'b' ],
	},
	{ id: 4, name: 'scan.tiff', type: 'failed', size: null, tags: [] },
	{
		id: 5,
		name: 'team photo.jpg',
		type: 'converted',
		size: 450,
		tags: [ 'c' ],
	},
];

const OPTIONS = { searchFields: [ 'name' ] };
const Q = ( query ) => ( { perPage: 2, ...query } );
const ids = ( result ) => result.rows.map( ( row ) => row.id );

describe( 'normalize', () => {
	it( 'lower-cases and strips accents', () => {
		expect( normalize( 'KÉP Ő' ) ).toBe( 'kep o' );
	} );

	it( 'treats null and undefined as empty text', () => {
		expect( normalize( null ) ).toBe( '' );
		expect( normalize( undefined ) ).toBe( '' );
	} );
} );

describe( 'compareValues', () => {
	it( 'sorts accented initials with their base letter', () => {
		const names = [ 'Zoltán', 'Ábel', 'Béla' ].sort( compareValues );
		expect( names ).toEqual( [ 'Ábel', 'Béla', 'Zoltán' ] );
	} );

	it( 'sorts numeric strings as numbers', () => {
		expect( [ '10', '9', '100' ].sort( compareValues ) ).toEqual( [
			'9',
			'10',
			'100',
		] );
	} );
} );

describe( 'matchesFilters', () => {
	it( 'matches any chosen value within a filter', () => {
		expect(
			matchesFilters( ROWS[ 1 ], { type: [ 'skipped', 'failed' ] } )
		).toBe( true );
	} );

	it( 'requires every filter to match', () => {
		expect(
			matchesFilters( ROWS[ 0 ], {
				type: [ 'converted' ],
				tags: [ 'b' ],
			} )
		).toBe( false );
		expect(
			matchesFilters( ROWS[ 2 ], {
				type: [ 'converted' ],
				tags: [ 'b' ],
			} )
		).toBe( true );
	} );

	it( 'matches array-valued fields that contain a chosen value', () => {
		expect( matchesFilters( ROWS[ 2 ], { tags: [ 'b' ] } ) ).toBe( true );
		expect( matchesFilters( ROWS[ 3 ], { tags: [ 'b' ] } ) ).toBe( false );
	} );

	it( 'ignores empty filters', () => {
		expect( matchesFilters( ROWS[ 3 ], { type: [] } ) ).toBe( true );
	} );
} );

describe( 'filterSortPaginate', () => {
	it( 'returns the first page of all rows by default', () => {
		const result = filterSortPaginate( ROWS, Q(), OPTIONS );

		expect( ids( result ) ).toEqual( [ 1, 2 ] );
		expect( result ).toMatchObject( { total: 5, page: 1, totalPages: 3 } );
	} );

	it( 'matches search accent-insensitively', () => {
		expect(
			ids( filterSortPaginate( ROWS, Q( { search: 'kep' } ), OPTIONS ) )
		).toEqual( [ 1 ] );
	} );

	it( 'requires every search word to match', () => {
		expect(
			ids(
				filterSortPaginate( ROWS, Q( { search: 'hero jpg' } ), OPTIONS )
			)
		).toEqual( [ 3 ] );
		expect(
			filterSortPaginate( ROWS, Q( { search: 'hero png' } ), OPTIONS )
				.total
		).toBe( 0 );
	} );

	it( 'searches column searchValue() text', () => {
		const columns = [
			{ id: 'size', searchValue: ( row ) => `${ row.size } KB` },
		];
		const result = filterSortPaginate( ROWS, Q( { search: '900 kb' } ), {
			...OPTIONS,
			columns,
		} );

		expect( ids( result ) ).toEqual( [ 3 ] );
	} );

	it( 'applies several filters together', () => {
		const result = filterSortPaginate(
			ROWS,
			Q( {
				perPage: 10,
				filters: { type: [ 'converted' ], tags: [ 'a' ] },
			} ),
			OPTIONS
		);

		expect( ids( result ) ).toEqual( [ 1, 3 ] );
	} );

	it.each( [
		[ 'desc', [ 3, 5 ] ],
		[ 'asc', [ 2, 1 ] ],
	] )( 'sorts %s by a field', ( direction, expected ) => {
		const result = filterSortPaginate(
			ROWS,
			Q( { sort: { field: 'size', direction } } ),
			OPTIONS
		);

		expect( ids( result ) ).toEqual( expected );
	} );

	it( 'puts empty values at the end in both directions', () => {
		const all = ( direction ) =>
			ids(
				filterSortPaginate(
					ROWS,
					{ perPage: 10, sort: { field: 'size', direction } },
					OPTIONS
				)
			);

		expect( all( 'asc' ).at( -1 ) ).toBe( 4 );
		expect( all( 'desc' ).at( -1 ) ).toBe( 4 );
	} );

	it( 'sorts by a column sortValue() instead of the raw field', () => {
		const columns = [
			{ id: 'name', sortValue: ( row ) => row.name.length },
		];
		const result = filterSortPaginate(
			ROWS,
			{ perPage: 1, sort: { field: 'name', direction: 'asc' } },
			{ ...OPTIONS, columns }
		);

		expect( ids( result ) ).toEqual( [ 2 ] ); // "logo.png" is the shortest.
	} );

	it( 'clamps an out-of-range page to the last page', () => {
		const result = filterSortPaginate( ROWS, Q( { page: 99 } ), OPTIONS );

		expect( result.page ).toBe( 3 );
		expect( ids( result ) ).toEqual( [ 5 ] );
	} );

	it( 'reports one empty page for no rows', () => {
		expect( filterSortPaginate( null, Q(), OPTIONS ) ).toEqual( {
			rows: [],
			total: 0,
			page: 1,
			totalPages: 1,
		} );
	} );

	it( 'does not mutate the input array', () => {
		const copy = [ ...ROWS ];
		filterSortPaginate(
			ROWS,
			Q( { sort: { field: 'size', direction: 'asc' } } ),
			OPTIONS
		);

		expect( ROWS ).toEqual( copy );
	} );
} );
