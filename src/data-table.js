/**
 * WordPress dependencies
 */
import { Button, SearchControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from './icons.js';
import { DEFAULT_LABELS } from './labels.js';

/**
 * Sortable column header cell.
 *
 * @param {Object} props
 * @param {Object} props.column Column definition.
 * @param {Object} props.table  useTableState() result.
 */
function HeaderCell( { column, table } ) {
	const sorted = table.sort?.field === column.id;
	const asc = sorted && table.sort.direction === 'asc';
	let ariaSort;
	if ( sorted ) {
		ariaSort = asc ? 'ascending' : 'descending';
	}

	return (
		<th
			scope="col"
			aria-sort={ ariaSort }
			className={ `is-${ column.align || 'start' }` }
		>
			{ column.sortable ? (
				<button
					type="button"
					onClick={ () => table.toggleSort( column.id ) }
				>
					{ column.label }
					{ sorted && ( asc ? <ArrowUp /> : <ArrowDown /> ) }
				</button>
			) : (
				column.label
			) }
		</th>
	);
}

/**
 * Lightweight data table on core components: search, filter chips, sortable
 * headers, paging. Pair it with useTableState(); style with style.css.
 *
 * @param {Object}   props
 * @param {Array}    props.columns  { id, label, render?, sortable?, align? }.
 * @param {Object}   props.table    useTableState() result.
 * @param {Array}    props.filters  Chip options { value, label } (optional).
 * @param {string}   props.caption  Table caption (screen readers).
 * @param {Object}   props.labels   Translated UI strings (see DEFAULT_LABELS).
 * @param {Function} props.getRowId Row key (default: row.id).
 */
export function DataTable( {
	columns,
	table,
	filters = [],
	caption,
	labels: customLabels,
	getRowId = ( row ) => row.id,
} ) {
	const labels = { ...DEFAULT_LABELS, ...customLabels };

	return (
		<div className="lw-table">
			<div className="lw-table__toolbar">
				<SearchControl
					__nextHasNoMarginBottom
					size="compact"
					label={ labels.search }
					placeholder={ labels.search }
					value={ table.search }
					onChange={ table.setSearch }
				/>
				{ filters.length > 0 && (
					<div
						className="lw-table__chips"
						role="group"
						aria-label={ labels.filter }
					>
						{ filters.map( ( option ) => (
							<button
								key={ option.value }
								type="button"
								className="lw-table__chip"
								aria-pressed={ table.filter.includes(
									option.value
								) }
								onClick={ () =>
									table.toggleFilter( option.value )
								}
							>
								{ option.label }
							</button>
						) ) }
						{ table.filter.length > 0 && (
							<Button
								variant="link"
								onClick={ table.clearFilter }
							>
								{ labels.clear }
							</Button>
						) }
					</div>
				) }
			</div>

			<div className="lw-table__scroll">
				<table>
					{ caption && (
						<caption className="lw-table__caption">
							{ caption }
						</caption>
					) }
					<thead>
						<tr>
							{ columns.map( ( column ) => (
								<HeaderCell
									key={ column.id }
									column={ column }
									table={ table }
								/>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ table.rows.map( ( row ) => (
							<tr key={ getRowId( row ) }>
								{ columns.map( ( column ) => (
									<td
										key={ column.id }
										className={ `is-${
											column.align || 'start'
										}` }
										data-label={ column.label }
									>
										{ column.render
											? column.render( row )
											: row[ column.id ] }
									</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				</table>
				{ table.total === 0 && (
					<p className="lw-table__empty">{ labels.empty }</p>
				) }
			</div>

			<div className="lw-table__foot">
				<span>{ labels.entries( table.total ) }</span>
				<div className="lw-table__pager">
					<Button
						size="compact"
						icon={ <ChevronLeft /> }
						label={ labels.previous }
						disabled={ table.page <= 1 }
						accessibleWhenDisabled
						onClick={ () => table.setPage( table.page - 1 ) }
					/>
					<span>{ labels.page( table.page, table.totalPages ) }</span>
					<Button
						size="compact"
						icon={ <ChevronRight /> }
						label={ labels.next }
						disabled={ table.page >= table.totalPages }
						accessibleWhenDisabled
						onClick={ () => table.setPage( table.page + 1 ) }
					/>
				</div>
			</div>
		</div>
	);
}
