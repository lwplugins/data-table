/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Debounced polite announcement ("12 results") after the shown rows change —
 * never on first render, never while loading, never per keystroke.
 *
 * @param {string}  message   Text to announce.
 * @param {string}  key       Changes when the result set changes.
 * @param {boolean} isLoading Skip while a request is in flight.
 * @return {string} Current live-region text.
 */
export function useAnnounce( message, key, isLoading ) {
	const [ text, setText ] = useState( '' );
	const first = useRef( true );

	useEffect( () => {
		if ( first.current ) {
			first.current = false;
			return;
		}
		if ( isLoading ) {
			return;
		}
		const timer = setTimeout( () => setText( message ), 600 );
		return () => clearTimeout( timer );
		// Re-announce only when the result set changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ key, isLoading ] );

	return text;
}
