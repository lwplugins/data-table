/**
 * WordPress dependencies
 */
import { Button, SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Check } from '../icons.js';

// Above this many options chips stop scaling; a select takes over.
const CHIP_LIMIT = 6;

/**
 * One filter: toggle chips (any-of) or, for long lists / type "select",
 * a single-choice select with an "All" option.
 *
 * @param {Object} props
 * @param {Object} props.filter { field, label, options, multiple?, type? }.
 * @param {Object} props.table  Table API.
 * @param {Object} props.labels Resolved labels.
 */
export function FilterGroup( { filter, table, labels } ) {
	const { field, label, options, multiple = true } = filter;
	const values = table.filters[ field ] || [];
	const type =
		filter.type || ( options.length > CHIP_LIMIT ? 'select' : 'chips' );

	if ( type === 'select' ) {
		return (
			<SelectControl
				__next40pxDefaultSize={ false }
				__nextHasNoMarginBottom
				size="compact"
				className="lw-table__select"
				label={ label }
				value={ values[ 0 ] ?? '' }
				options={ [
					{ value: '', label: labels.all },
					...options.map( ( o ) => ( {
						value: String( o.value ),
						label: o.label,
					} ) ),
				] }
				onChange={ ( next ) => {
					const option = options.find(
						( o ) => String( o.value ) === next
					);
					table.setFilter( field, option ? [ option.value ] : [] );
				} }
			/>
		);
	}

	return (
		<div className="lw-table__chips" role="group" aria-label={ label }>
			<span className="lw-table__chips-label" aria-hidden="true">
				{ label }
			</span>
			{ options.map( ( option ) => {
				const pressed = values.includes( option.value );
				return (
					<button
						key={ option.value }
						type="button"
						className="lw-table__chip"
						aria-pressed={ pressed }
						onClick={ () =>
							table.toggleFilter( field, option.value, multiple )
						}
					>
						{ pressed && <Check /> }
						{ option.label }
					</button>
				);
			} ) }
			{ values.length > 0 && (
				<Button
					variant="link"
					className="lw-table__clear"
					onClick={ () => table.clearFilters( field ) }
				>
					{ labels.clear }
				</Button>
			) }
		</div>
	);
}
