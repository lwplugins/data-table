/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';

/**
 * Tri-state "select all rows on this page" checkbox (native, so the
 * indeterminate state is announced by assistive tech).
 *
 * @param {Object}   props
 * @param {number}   props.checked  Selected rows on this page.
 * @param {number}   props.total    Selectable rows on this page.
 * @param {Function} props.onChange Receives true (select all) / false.
 * @param {string}   props.label    Accessible name.
 */
export function HeaderCheckbox( { checked, total, onChange, label } ) {
	const ref = useRef();
	const all = total > 0 && checked === total;

	useEffect( () => {
		ref.current.indeterminate = checked > 0 && ! all;
	}, [ checked, all ] );

	return (
		<input
			ref={ ref }
			type="checkbox"
			className="lw-table__check"
			aria-label={ label }
			checked={ all }
			disabled={ ! total }
			onChange={ () => onChange( ! all ) }
		/>
	);
}
