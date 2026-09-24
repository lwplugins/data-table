/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useRef } from '@wordpress/element';

/**
 * Selection count + bulk action buttons. Shown while something is selected.
 * After an action runs, focus moves to the count: the button that had focus
 * may be gone (the rows it acted on were deleted, the bar hides…).
 *
 * @param {Object}   props
 * @param {Array}    props.actions     { id, label, onClick, isEligible?, isDestructive? }.
 * @param {Array}    props.selected    Selected ids (all pages).
 * @param {Array}    props.pageRows    Selected rows on the current page.
 * @param {Function} props.onClear     Clear the selection.
 * @param {Object}   props.labels      Resolved labels.
 * @param {Object}   props.focusTarget Ref of the element to focus afterwards.
 */
export function BulkBar( {
	actions,
	selected,
	pageRows,
	onClear,
	labels,
	focusTarget,
} ) {
	const status = useRef();

	const run = async ( action, rows ) => {
		await action.onClick( rows, selected );
		( status.current || focusTarget?.current )?.focus();
	};

	return (
		<div
			className="lw-table__bulk"
			role="group"
			aria-label={ labels.bulkActions }
		>
			<span
				className="lw-table__bulk-count"
				ref={ status }
				tabIndex={ -1 }
			>
				{ labels.selected( selected.length, pageRows.length ) }
			</span>
			{ actions.map( ( action ) => {
				const rows = action.isEligible
					? pageRows.filter( action.isEligible )
					: pageRows;
				const partial = rows.length < pageRows.length;
				const note = partial
					? labels.eligible( rows.length, pageRows.length )
					: '';
				return (
					<Button
						key={ action.id }
						size="compact"
						variant="secondary"
						isDestructive={ action.isDestructive }
						disabled={ ! rows.length }
						accessibleWhenDisabled
						description={ note || undefined }
						onClick={ () => run( action, rows ) }
					>
						{ action.label }
						{ partial && (
							<span className="lw-table__bulk-note">
								({ note })
							</span>
						) }
					</Button>
				);
			} ) }
			<Button size="compact" variant="link" onClick={ onClear }>
				{ labels.clearSelection }
			</Button>
		</div>
	);
}
