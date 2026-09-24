/**
 * External dependencies
 */
import { describe, expect, it } from 'vitest';

/**
 * Internal dependencies
 */
import { filterSortPaginate, normalize } from '../src/filter-sort-paginate.js';

const ROWS = [
	{ id: 1, name: 'Kép-feltöltés.jpg', type: 'converted', size: 300 },
	{ id: 2, name: 'logo.png', type: 'skipped', size: 10 },
	{ id: 3, name: 'hero banner.jpg', type: 'converted', size: 900 },
	{ id: 4, name: 'scan.tiff', type: 'failed', size: null },
	{ id: 5, name: 'team photo.jpg', type: 'converted', size: 450 },
];

const OPTIONS = { searchFields: [ 'name' ], filterField: 'type', perPage: 2 };

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

describe( 'filterSortPaginate', () => {
	it( 'returns the first page of all rows by default', () => {
		const result = filterSortPaginate( ROWS, {}, OPTIONS );

		expect( ids( result ) ).toEqual( [ 1, 2 ] );
		expect( result ).toMatchObject( { total: 5, page: 1, totalPages: 3 } );
	} );

	it( 'matches search accent-insensitively', () => {
		const result = filterSortPaginate( ROWS, { search: 'kep' }, OPTIONS );

		expect( ids( result ) ).toEqual( [ 1 ] );
	} );

	it( 'requires every search word to match', () => {
		expect(
			ids( filterSortPaginate( ROWS, { search: 'hero jpg' }, OPTIONS ) )
		).toEqual( [ 3 ] );
		expect(
			filterSortPaginate( ROWS, { search: 'hero png' }, OPTIONS ).total
		).toBe( 0 );
	} );

	it( 'keeps only rows whose filter field is in the filter list', () => {
		const result = filterSortPaginate(
			ROWS,
			{ filter: [ 'skipped', 'failed' ] },
			OPTIONS
		);

		expect( ids( result ) ).toEqual( [ 2, 4 ] );
	} );

	it.each( [
		[ 'desc', [ 3, 5 ] ],
		[ 'asc', [ 2, 1 ] ],
	] )( 'sorts %s by a field, empty values last', ( direction, expected ) => {
		const result = filterSortPaginate(
			ROWS,
			{ sort: { field: 'size', direction } },
			OPTIONS
		);

		expect( ids( result ) ).toEqual( expected );
	} );

	it( 'puts empty values at the end in both directions', () => {
		const all = { ...OPTIONS, perPage: 10 };
		const asc = filterSortPaginate(
			ROWS,
			{ sort: { field: 'size', direction: 'asc' } },
			all
		);
		const desc = filterSortPaginate(
			ROWS,
			{ sort: { field: 'size', direction: 'desc' } },
			all
		);

		expect( ids( asc ).at( -1 ) ).toBe( 4 );
		expect( ids( desc ).at( -1 ) ).toBe( 4 );
	} );

	it( 'clamps an out-of-range page to the last page', () => {
		const result = filterSortPaginate( ROWS, { page: 99 }, OPTIONS );

		expect( result.page ).toBe( 3 );
		expect( ids( result ) ).toEqual( [ 5 ] );
	} );

	it( 'reports one empty page for no rows', () => {
		const result = filterSortPaginate( null, {}, OPTIONS );

		expect( result ).toEqual( {
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
			{ sort: { field: 'size', direction: 'asc' } },
			OPTIONS
		);

		expect( ROWS ).toEqual( copy );
	} );
} );
