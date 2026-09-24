/**
 * WordPress dependencies
 */
import { SearchControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Search input that reports after a pause (`delay` ms), so a server-paged
 * table does not fire a request per keystroke. Follows outside resets.
 *
 * @param {Object}   props
 * @param {string}   props.value    Current search.
 * @param {Function} props.onChange Receives the settled value.
 * @param {number}   props.delay    Debounce in ms (0 = immediate).
 * @param {string}   props.label    Label / placeholder.
 */
export function SearchBox( { value, onChange, delay, label } ) {
	const [ text, setText ] = useState( value );
	const timer = useRef();

	useEffect( () => setText( value ), [ value ] );
	useEffect( () => () => clearTimeout( timer.current ), [] );

	const change = ( next ) => {
		setText( next );
		clearTimeout( timer.current );
		if ( ! delay || next === '' ) {
			onChange( next );
			return;
		}
		timer.current = setTimeout( () => onChange( next ), delay );
	};

	return (
		<SearchControl
			__nextHasNoMarginBottom
			size="compact"
			label={ label }
			placeholder={ label }
			value={ text }
			onChange={ change }
		/>
	);
}
