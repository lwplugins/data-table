// @vitest-environment jsdom
/**
 * External dependencies
 */
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DataTable, useTableState, DEFAULT_QUERY } from '../src/index.js';

afterEach( cleanup );

const COLUMNS = [
	{ id: 'name', label: 'Name', sortable: true, defaultSortDirection: 'asc' },
	{ id: 'status', label: 'Status' },
];
const ROWS = [
	{ id: 1, name: 'Anna', status: 'pending' },
	{ id: 2, name: 'Béla', status: 'confirmed' },
	{ id: 3, name: 'Cecil', status: 'pending' },
];
const STATUS = {
	field: 'status',
	label: 'Status',
	options: [
		{ value: 'pending', label: 'Pending' },
		{ value: 'confirmed', label: 'Confirmed' },
	],
};

function ClientTable( props ) {
	const table = useTableState( ROWS, {
		searchFields: [ 'name' ],
		columns: COLUMNS,
	} );
	return (
		<DataTable
			columns={ COLUMNS }
			table={ table }
			caption="People"
			{ ...props }
		/>
	);
}

const names = () =>
	screen
		.getAllByRole( 'row' )
		.slice( 1 )
		.map(
			( row ) => row.querySelector( '.lw-table__cell-value' ).textContent
		);

describe( 'DataTable (client)', () => {
	it( 'renders every row with explicit table roles', () => {
		render( <ClientTable /> );

		expect( screen.getByRole( 'table' ) ).toBeTruthy();
		expect( names() ).toEqual( [ 'Anna', 'Béla', 'Cecil' ] );
	} );

	it( 'filters with chips and shows the pressed state with a check icon', () => {
		render( <ClientTable filters={ [ STATUS ] } /> );

		const chip = screen.getByRole( 'button', { name: 'Pending' } );
		fireEvent.click( chip );

		expect( chip.getAttribute( 'aria-pressed' ) ).toBe( 'true' );
		expect( chip.querySelector( 'svg' ) ).toBeTruthy();
		expect( names() ).toEqual( [ 'Anna', 'Cecil' ] );
	} );

	it( 'separates "no results" from "nothing here yet"', () => {
		render(
			<DataTable
				columns={ COLUMNS }
				query={ DEFAULT_QUERY }
				onQueryChange={ () => {} }
				rows={ [] }
				total={ 0 }
			/>
		);
		expect( screen.getByText( 'Nothing here yet.' ) ).toBeTruthy();
		cleanup();

		render(
			<DataTable
				columns={ COLUMNS }
				query={ { ...DEFAULT_QUERY, search: 'zzz' } }
				onQueryChange={ () => {} }
				rows={ [] }
				total={ 0 }
			/>
		);
		expect( screen.getByText( 'No matching entries.' ) ).toBeTruthy();
	} );

	it( 'starts a column in its default sort direction', () => {
		render( <ClientTable /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Name' } ) );

		expect(
			screen
				.getByRole( 'columnheader', { name: 'Name' } )
				.getAttribute( 'aria-sort' )
		).toBe( 'ascending' );
	} );
} );

describe( 'DataTable (server)', () => {
	it( 'asks for the last page when the page is past the end', () => {
		const onQueryChange = vi.fn();
		render(
			<DataTable
				columns={ COLUMNS }
				rows={ [] }
				total={ 20 }
				totalPages={ 2 }
				query={ { ...DEFAULT_QUERY, page: 3 } }
				onQueryChange={ onQueryChange }
			/>
		);

		expect( onQueryChange ).toHaveBeenCalledWith(
			expect.objectContaining( { page: 2 } )
		);
	} );

	it( 'keeps the previous rows while loading and marks the region busy', () => {
		const { container } = render(
			<DataTable
				columns={ COLUMNS }
				rows={ ROWS }
				total={ 3 }
				query={ DEFAULT_QUERY }
				onQueryChange={ () => {} }
				isLoading
			/>
		);

		expect(
			container.querySelector( '.lw-table' ).getAttribute( 'aria-busy' )
		).toBe( 'true' );
		expect( names() ).toEqual( [ 'Anna', 'Béla', 'Cecil' ] );
	} );

	it( 'shows aria-hidden skeleton rows when loading with nothing to show', () => {
		const { container } = render(
			<DataTable
				columns={ COLUMNS }
				rows={ [] }
				total={ 0 }
				query={ DEFAULT_QUERY }
				onQueryChange={ () => {} }
				isLoading
			/>
		);

		const body = container.querySelector( 'tbody' );
		expect( body.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
		expect(
			body.querySelectorAll( '.lw-table__skeleton' ).length
		).toBeGreaterThan( 0 );
	} );

	it( 'renders an error as an alert with the retry slot', () => {
		render(
			<DataTable
				columns={ COLUMNS }
				rows={ [] }
				total={ 0 }
				query={ DEFAULT_QUERY }
				onQueryChange={ () => {} }
				error="Could not load bookings."
				errorAction={ <button type="button">Retry</button> }
			/>
		);

		expect( screen.getByRole( 'alert' ).textContent ).toContain(
			'Could not load bookings.'
		);
		expect( screen.getByRole( 'button', { name: 'Retry' } ) ).toBeTruthy();
	} );

	it( 'debounces search before reporting it', () => {
		vi.useFakeTimers();
		const onQueryChange = vi.fn();
		render(
			<DataTable
				columns={ COLUMNS }
				rows={ ROWS }
				total={ 3 }
				query={ DEFAULT_QUERY }
				onQueryChange={ onQueryChange }
			/>
		);

		fireEvent.change( screen.getByRole( 'searchbox' ), {
			target: { value: 'ann' },
		} );
		expect( onQueryChange ).not.toHaveBeenCalled();
		act( () => vi.advanceTimersByTime( 300 ) );

		expect( onQueryChange ).toHaveBeenCalledWith(
			expect.objectContaining( { search: 'ann', page: 1 } )
		);
		vi.useRealTimers();
	} );
} );

describe( 'selection and bulk actions', () => {
	function Selectable( { onConfirm } ) {
		const [ selected, setSelected ] = useState( [] );
		const table = useTableState( ROWS, { searchFields: [ 'name' ] } );
		return (
			<DataTable
				columns={ COLUMNS }
				table={ table }
				getRowLabel={ ( row ) => row.name }
				selection={ { selected, onChange: setSelected } }
				bulkActions={ [
					{
						id: 'confirm',
						label: 'Confirm',
						onClick: onConfirm,
						isEligible: ( row ) => row.status === 'pending',
					},
				] }
			/>
		);
	}

	it( 'names row checkboxes after the row and runs actions on eligible rows', async () => {
		const onConfirm = vi.fn();
		render( <Selectable onConfirm={ onConfirm } /> );

		fireEvent.click(
			screen.getByRole( 'checkbox', { name: 'Select: Anna' } )
		);
		fireEvent.click(
			screen.getByRole( 'checkbox', { name: 'Select: Béla' } )
		);
		expect( screen.getByText( '2 selected' ) ).toBeTruthy();

		await act( async () =>
			fireEvent.click( screen.getByRole( 'button', { name: /Confirm/ } ) )
		);

		expect(
			onConfirm.mock.calls[ 0 ][ 0 ].map( ( row ) => row.id )
		).toEqual( [ 1 ] );
	} );

	it( 'makes the header checkbox indeterminate for a partial selection', () => {
		render( <Selectable onConfirm={ () => {} } /> );

		fireEvent.click(
			screen.getByRole( 'checkbox', { name: 'Select: Anna' } )
		);
		const header = screen.getByRole( 'checkbox', {
			name: 'Select all rows on this page',
		} );

		expect( header.indeterminate ).toBe( true );
		fireEvent.click( header );
		expect( screen.getByText( '3 selected' ) ).toBeTruthy();
	} );
} );

describe( 'accessibility', () => {
	it( 'has no axe violations with filters, selection and pager', async () => {
		function Full() {
			const [ selected, setSelected ] = useState( [ 1 ] );
			const table = useTableState( ROWS, { searchFields: [ 'name' ] } );
			return (
				<DataTable
					columns={ COLUMNS }
					table={ table }
					caption="People"
					filters={ [ STATUS ] }
					pagination="both"
					getRowLabel={ ( row ) => row.name }
					selection={ { selected, onChange: setSelected } }
					bulkActions={ [
						{
							id: 'delete',
							label: 'Delete',
							onClick: () => {},
							isDestructive: true,
						},
					] }
				/>
			);
		}
		const { container } = render( <Full /> );

		const results = await axe.run( container, {
			rules: { region: { enabled: false } },
		} );

		expect(
			results.violations.map( ( v ) => `${ v.id }: ${ v.help }` )
		).toEqual( [] );
	} );
} );
