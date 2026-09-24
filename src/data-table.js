/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DEFAULT_LABELS } from './labels.js';
import { DEFAULT_QUERY, createTableApi, isNarrowed } from './query.js';
import { BulkBar } from './parts/bulk-bar.js';
import { FilterGroup } from './parts/filter-group.js';
import { Pager } from './parts/pager.js';
import { PerPage } from './parts/per-page.js';
import { SearchBox } from './parts/search-box.js';
import { TableBody } from './parts/table-body.js';
import { TableHead } from './parts/table-head.js';
import { useAnnounce } from './parts/use-announce.js';

/**
 * Lightweight data table on core components. Two modes, one state shape:
 *
 * - Client: pass `table` from useTableState( rows ).
 * - Server (controlled): pass `rows`, `total`, `totalPages`, `query`,
 *   `onQueryChange` — fetch whatever `query` asks for.
 *
 * Every other feature (filters, toolbar, selection, bulk actions, per-page
 * select, states) is opt-in.
 *
 * @param {Object} props See README for the full prop list.
 */
export function DataTable( props ) {
	const {
		columns,
		filters = [],
		toolbar,
		caption,
		getRowId = ( row ) => row.id,
		getRowLabel,
		pagination = 'bottom',
		perPageOptions,
		searchable = true,
		isLoading = false,
		error,
		errorAction,
		selection,
		bulkActions = [],
	} = props;
	const labels = { ...DEFAULT_LABELS, ...props.labels };
	const server = ! props.table;
	const table =
		props.table ||
		createTableApi( props.query || DEFAULT_QUERY, props.onQueryChange, {
			rows: props.rows || [],
			total: props.total || 0,
			totalPages: Math.max( 1, props.totalPages || 1 ),
			page: ( props.query || DEFAULT_QUERY ).page,
		} );
	const searchDelay = props.searchDelay ?? ( server ? 300 : 0 );
	const focusTarget = useRef();

	// Page past the end (e.g. the last row of the last page was deleted):
	// ask for the last page instead of showing an empty one.
	const { page, totalPages } = table;
	useEffect( () => {
		if ( server && ! isLoading && page > totalPages ) {
			table.setPage( totalPages );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ server, isLoading, page, totalPages ] );

	const announced = useAnnounce(
		labels.results( table.total ),
		`${ table.total }|${ table.page }|${ JSON.stringify( table.query ) }`,
		isLoading
	);

	const showSkeleton = isLoading && ! table.rows.length;
	const selectionApi = selection && {
		isSelected: ( id ) => selection.selected.includes( id ),
		toggle: ( id ) =>
			selection.onChange(
				selection.selected.includes( id )
					? selection.selected.filter( ( item ) => item !== id )
					: [ ...selection.selected, id ]
			),
		label: ( row ) =>
			labels.selectRow(
				getRowLabel ? getRowLabel( row ) : String( getRowId( row ) )
			),
	};
	const pageIds = table.rows.map( getRowId );
	const pageSelected = selection
		? table.rows.filter( ( row ) =>
				selection.selected.includes( getRowId( row ) )
			)
		: [];
	const activeFilters = filters.filter(
		( f ) => table.filters[ f.field ]?.length
	);

	const pager = (
		<div className="lw-table__paging">
			<span>{ labels.entries( table.total ) }</span>
			{ perPageOptions && (
				<PerPage
					table={ table }
					options={ perPageOptions }
					label={ labels.perPage }
				/>
			) }
			<Pager table={ table } labels={ labels } />
		</div>
	);

	let empty = null;
	if ( error ) {
		empty = (
			<div className="lw-table__error" role="alert">
				<p>{ error }</p>
				{ errorAction }
			</div>
		);
	} else if ( ! isLoading && table.total === 0 ) {
		empty = (
			<p className="lw-table__empty">
				{ isNarrowed( table.query ) ? labels.empty : labels.emptyAll }
			</p>
		);
	}

	return (
		<div className="lw-table" aria-busy={ isLoading || undefined }>
			<div className="lw-table__toolbar">
				{ searchable && (
					<SearchBox
						value={ table.search }
						onChange={ table.setSearch }
						delay={ searchDelay }
						label={ labels.search }
					/>
				) }
				{ filters.map( ( filter ) => (
					<FilterGroup
						key={ filter.field }
						filter={ filter }
						table={ table }
						labels={ labels }
					/>
				) ) }
				{ activeFilters.length > 1 && (
					<Button
						variant="link"
						className="lw-table__clear"
						onClick={ () => table.clearFilters() }
					>
						{ labels.clearAll }
					</Button>
				) }
				{ toolbar && <div className="lw-table__slot">{ toolbar }</div> }
				{ ( pagination === 'top' || pagination === 'both' ) && pager }
			</div>

			{ selection && selection.selected.length > 0 && (
				<BulkBar
					actions={ bulkActions }
					selected={ selection.selected }
					pageRows={ pageSelected }
					onClear={ () => selection.onChange( [] ) }
					labels={ labels }
					focusTarget={ focusTarget }
				/>
			) }

			{ /* Scrollable region: focusable so keyboard users can scroll it. */ }
			<div
				className={ `lw-table__scroll${ isLoading && ! showSkeleton ? ' is-loading' : '' }` }
				role="region"
				aria-label={ caption || labels.search }
				tabIndex={ 0 }
				ref={ focusTarget }
			>
				<table role="table">
					{ caption && (
						<caption className="lw-table__caption">
							{ caption }
						</caption>
					) }
					<TableHead
						columns={ columns }
						table={ table }
						selectAll={
							selection && {
								checked: pageSelected.length,
								total: pageIds.length,
								label: labels.selectAll,
								onChange: ( all ) =>
									selection.onChange(
										all
											? [
													...new Set( [
														...selection.selected,
														...pageIds,
													] ),
												]
											: selection.selected.filter(
													( id ) =>
														! pageIds.includes( id )
												)
									),
							}
						}
					/>
					{ ! error && (
						<TableBody
							columns={ columns }
							rows={ table.rows }
							getRowId={ getRowId }
							showSkeleton={ showSkeleton }
							skeletonRows={ Math.min( table.perPage || 5, 5 ) }
							selection={ selectionApi }
						/>
					) }
				</table>
				{ empty }
			</div>

			{ pagination !== 'top' && (
				<div className="lw-table__foot">{ pager }</div>
			) }

			<div
				className="lw-table__live"
				aria-live="polite"
				aria-atomic="true"
			>
				{ announced }
			</div>
		</div>
	);
}
