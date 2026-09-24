/* eslint-disable jsx-a11y/no-redundant-roles, jsx-a11y/no-interactive-element-to-noninteractive-role -- explicit table roles on purpose: the mobile card layout sets display:block on table/tr/td, which drops the native semantics in some browsers (Safari/VoiceOver); the roles restore them. */
/**
 * Rows, skeleton rows (loading with nothing to show yet) and the cell labels
 * the mobile card layout displays. The labels are aria-hidden: the explicit
 * table roles keep the column-header relationship in every layout.
 *
 * @param {Object}   props
 * @param {Array}    props.columns      Columns.
 * @param {Array}    props.rows         Rows to render.
 * @param {Function} props.getRowId     Row key.
 * @param {boolean}  props.showSkeleton Render placeholder rows.
 * @param {number}   props.skeletonRows How many.
 * @param {Object}   props.selection    { isSelected( id ), toggle( id ), label( row ) } or null.
 */
export function TableBody( {
	columns,
	rows,
	getRowId,
	showSkeleton,
	skeletonRows,
	selection,
} ) {
	if ( showSkeleton ) {
		return (
			<tbody role="rowgroup" aria-hidden="true">
				{ Array.from( { length: skeletonRows }, ( _, index ) => (
					<tr key={ index } className="lw-table__skeleton">
						{ selection && <td /> }
						{ columns.map( ( column ) => (
							<td key={ column.id }>
								<span />
							</td>
						) ) }
					</tr>
				) ) }
			</tbody>
		);
	}

	return (
		<tbody role="rowgroup">
			{ rows.map( ( row ) => {
				const id = getRowId( row );
				const selected = selection?.isSelected( id );
				return (
					<tr
						key={ id }
						role="row"
						className={ selected ? 'is-selected' : undefined }
					>
						{ selection && (
							<td role="cell" className="lw-table__select-cell">
								<input
									type="checkbox"
									className="lw-table__check"
									aria-label={ selection.label( row ) }
									checked={ !! selected }
									onChange={ () => selection.toggle( id ) }
								/>
							</td>
						) }
						{ columns.map( ( column ) => (
							<td
								key={ column.id }
								role="cell"
								className={ `is-${ column.align || 'start' }` }
							>
								<span
									className="lw-table__cell-label"
									aria-hidden="true"
								>
									{ column.label }
								</span>
								<span className="lw-table__cell-value">
									{ column.render
										? column.render( row )
										: row[ column.id ] }
								</span>
							</td>
						) ) }
					</tr>
				);
			} ) }
		</tbody>
	);
}
