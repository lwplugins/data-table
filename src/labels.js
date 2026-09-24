/**
 * English fallbacks. Pass translated strings through the `labels` prop: the
 * package has no text domain of its own, so WordPress can only translate
 * strings that live in the consuming plugin.
 */
export const DEFAULT_LABELS = {
	search: 'Search',
	filter: 'Filter',
	clear: 'Clear',
	clearAll: 'Clear all filters',
	all: 'All',
	/** No rows match the current search or filters. */
	empty: 'No matching entries.',
	/** There is no data at all yet. */
	emptyAll: 'Nothing here yet.',
	loading: 'Loading…',
	previous: 'Previous page',
	next: 'Next page',
	perPage: 'Rows per page',
	selectAll: 'Select all rows on this page',
	clearSelection: 'Clear selection',
	bulkActions: 'Bulk actions',
	/** @param {number} count Number of rows. */
	entries: ( count ) => `${ count } ${ count === 1 ? 'entry' : 'entries' }`,
	/** @param {number} count Number of results (announced to screen readers). */
	results: ( count ) => `${ count } ${ count === 1 ? 'result' : 'results' }`,
	/**
	 * @param {number} page  Current page.
	 * @param {number} total Total pages.
	 */
	page: ( page, total ) => `Page ${ page } of ${ total }`,
	/** @param {string} rowLabel Row name, e.g. "Jane Doe, 12 Oct". */
	selectRow: ( rowLabel ) => `Select: ${ rowLabel }`,
	/**
	 * @param {number} count  Selected rows in total.
	 * @param {number} onPage Of those, rows on the current page.
	 */
	selected: ( count, onPage ) =>
		count === onPage
			? `${ count } selected`
			: `${ count } selected, ${ onPage } on this page`,
	/**
	 * @param {number} eligible Selected rows the action applies to.
	 * @param {number} count    Selected rows on this page.
	 */
	eligible: ( eligible, count ) => `applies to ${ eligible } of ${ count }`,
};
