/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ChevronLeft, ChevronRight } from '../icons.js';

/**
 * Previous / "Page x of y" / next. Rendered above and/or below the table.
 *
 * @param {Object} props
 * @param {Object} props.table  useTableState() result.
 * @param {Object} props.labels Resolved labels.
 */
export function Pager( { table, labels } ) {
	return (
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
	);
}
