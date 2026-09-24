/* eslint-disable jsx-a11y/no-redundant-roles -- explicit table roles on purpose: the mobile card layout sets display:block on table/tr/td, which drops the native semantics in some browsers (Safari/VoiceOver); the roles restore them. */
/**
 * Internal dependencies
 */
import { ArrowDown, ArrowUp } from '../icons.js';
import { HeaderCheckbox } from './header-checkbox.js';

/**
 * Column headers. `aria-sort` sits only on the sorted column; the button's
 * name is just the column label (no "sortable" noise).
 *
 * @param {Object} props
 * @param {Array}  props.columns   Columns.
 * @param {Object} props.table     Table API.
 * @param {Object} props.selectAll Header checkbox props, or null.
 */
export function TableHead( { columns, table, selectAll } ) {
	return (
		<thead role="rowgroup">
			<tr role="row">
				{ selectAll && (
					<th
						scope="col"
						role="columnheader"
						className="lw-table__select-cell"
					>
						<HeaderCheckbox { ...selectAll } />
					</th>
				) }
				{ columns.map( ( column ) => {
					const sorted = table.sort?.field === column.id;
					const asc = sorted && table.sort.direction === 'asc';
					let ariaSort;
					if ( sorted ) {
						ariaSort = asc ? 'ascending' : 'descending';
					}
					return (
						<th
							key={ column.id }
							scope="col"
							role="columnheader"
							aria-sort={ ariaSort }
							className={ `is-${ column.align || 'start' }` }
						>
							{ column.sortable ? (
								<button
									type="button"
									onClick={ () =>
										table.toggleSort(
											column.id,
											column.defaultSortDirection
										)
									}
								>
									{ column.label }
									{ sorted &&
										( asc ? <ArrowUp /> : <ArrowDown /> ) }
								</button>
							) : (
								column.label
							) }
						</th>
					);
				} ) }
			</tr>
		</thead>
	);
}
