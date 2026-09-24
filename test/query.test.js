/**
 * External dependencies
 */
import { describe, expect, it, vi } from 'vitest';

/**
 * Internal dependencies
 */
import {
	DEFAULT_QUERY,
	createTableApi,
	isNarrowed,
	patchQuery,
} from '../src/query.js';

const on = ( query ) => {
	const setQuery = vi.fn();
	const api = createTableApi( { ...DEFAULT_QUERY, ...query }, setQuery, {
		rows: [],
		total: 0,
		totalPages: 1,
		page: 1,
	} );
	return { api, next: () => setQuery.mock.calls.at( -1 )[ 0 ] };
};

describe( 'patchQuery', () => {
	it.each( [
		[ 'search', 'x' ],
		[ 'filters', { a: [ 1 ] } ],
		[ 'sort', { field: 'a', direction: 'asc' } ],
		[ 'perPage', 50 ],
	] )( 'returns to page 1 when %s changes', ( key, value ) => {
		expect(
			patchQuery( { ...DEFAULT_QUERY, page: 4 }, { [ key ]: value } ).page
		).toBe( 1 );
	} );

	it( 'keeps an explicit page change', () => {
		expect(
			patchQuery( { ...DEFAULT_QUERY, page: 4 }, { page: 2 } ).page
		).toBe( 2 );
	} );
} );

describe( 'createTableApi', () => {
	it( 'adds and removes values of a multiple filter', () => {
		const { api, next } = on( { filters: { status: [ 'a' ] } } );

		api.toggleFilter( 'status', 'b' );
		expect( next().filters.status ).toEqual( [ 'a', 'b' ] );
		api.toggleFilter( 'status', 'a' );
		expect( next().filters.status ).toEqual( [] );
	} );

	it( 'replaces the value of a single-choice filter', () => {
		const { api, next } = on( { filters: { owner: [ 'x' ] } } );

		api.toggleFilter( 'owner', 'y', false );
		expect( next().filters.owner ).toEqual( [ 'y' ] );
	} );

	it( 'clears one filter or all of them', () => {
		const { api, next } = on( { filters: { a: [ 1 ], b: [ 2 ] } } );

		api.clearFilters( 'a' );
		expect( next().filters ).toEqual( { a: [], b: [ 2 ] } );
		api.clearFilters();
		expect( next().filters ).toEqual( {} );
	} );

	it( 'starts a new sort column in its default direction, then flips', () => {
		const first = on();
		first.api.toggleSort( 'name', 'asc' );
		expect( first.next().sort ).toEqual( {
			field: 'name',
			direction: 'asc',
		} );

		const again = on( { sort: { field: 'name', direction: 'asc' } } );
		again.api.toggleSort( 'name', 'asc' );
		expect( again.next().sort ).toEqual( {
			field: 'name',
			direction: 'desc',
		} );
	} );
} );

describe( 'isNarrowed', () => {
	it( 'is true with a search or an active filter only', () => {
		expect( isNarrowed( DEFAULT_QUERY ) ).toBe( false );
		expect( isNarrowed( { ...DEFAULT_QUERY, search: ' ' } ) ).toBe( false );
		expect( isNarrowed( { ...DEFAULT_QUERY, search: 'x' } ) ).toBe( true );
		expect( isNarrowed( { ...DEFAULT_QUERY, filters: { a: [] } } ) ).toBe(
			false
		);
		expect(
			isNarrowed( { ...DEFAULT_QUERY, filters: { a: [ 1 ] } } )
		).toBe( true );
	} );
} );
