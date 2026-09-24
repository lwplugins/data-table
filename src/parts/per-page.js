/**
 * WordPress dependencies
 */
import { SelectControl } from '@wordpress/components';

/**
 * Rows-per-page select (rendered only when `perPageOptions` is given).
 *
 * @param {Object} props
 * @param {Object} props.table   Table API.
 * @param {Array}  props.options Allowed sizes, e.g. [ 10, 20, 50 ].
 * @param {string} props.label   Label.
 */
export function PerPage( { table, options, label } ) {
	return (
		<SelectControl
			__next40pxDefaultSize={ false }
			__nextHasNoMarginBottom
			size="compact"
			className="lw-table__per-page"
			label={ label }
			labelPosition="side"
			value={ String( table.perPage ) }
			options={ options.map( ( size ) => ( {
				value: String( size ),
				label: String( size ),
			} ) ) }
			onChange={ ( next ) => table.setPerPage( Number( next ) ) }
		/>
	);
}
