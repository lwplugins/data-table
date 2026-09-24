/**
 * Inline stroke icons (paths from `@wordpress/icons` 17, GPL-2.0-or-later),
 * kept inline so the package has no bundled dependency.
 *
 * @param {string} d    Path data.
 * @param {number} size Pixel size.
 */
const icon = ( d, size ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		aria-hidden="true"
		focusable="false"
	>
		<path d={ d } vectorEffect="non-scaling-stroke" />
	</svg>
);

export const ArrowUp = ( { size = 16 } ) =>
	icon( 'M12 20L12 5M17 10L12 5L7 10', size );

export const ArrowDown = ( { size = 16 } ) =>
	icon( 'M12 4V19M7 14L12 19L17 14', size );

export const ChevronLeft = ( { size = 24 } ) =>
	icon( 'M14 6.5L9 12L14 17.5', size );

export const ChevronRight = ( { size = 24 } ) =>
	icon( 'M10 6.5L15 12L10 17.5', size );
