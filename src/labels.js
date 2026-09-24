/**
 * English fallbacks. Pass translated strings through the `labels` prop: the
 * package has no text domain of its own, so WordPress can only translate
 * strings that live in the consuming plugin.
 */
export const DEFAULT_LABELS = {
	search: 'Search',
	filter: 'Filter',
	clear: 'Clear',
	empty: 'No matching entries.',
	previous: 'Previous page',
	next: 'Next page',
	/** @param {number} count Number of rows. */
	entries: ( count ) => `${ count } ${ count === 1 ? 'entry' : 'entries' }`,
	/**
	 * @param {number} page  Current page.
	 * @param {number} total Total pages.
	 */
	page: ( page, total ) => `Page ${ page } of ${ total }`,
};
