# @lwplugins/data-table

Lightweight data table for WordPress admin React screens — search, filter
chips, sortable columns and paging, built only on core
`@wordpress/components`.

**~3 KB gzipped** in your plugin bundle. `@wordpress/dataviews` has to be
bundled by plugins (core does not ship it as a script) and weighs ~380 KB
gzipped; this covers the common "list / log / report" case without that cost.

- Client-side search (every word must match, accent-insensitive)
- One "any of" filter rendered as toggle chips
- Sortable columns (`aria-sort`), paging, entry count, empty state
- Mobile: rows turn into labelled cards below 782px
- No bundled dependencies, no text domain — you pass translated labels

## Install

```bash
npm install @lwplugins/data-table
```

Peer dependencies (provided by WordPress core when built with
`@wordpress/scripts`): `@wordpress/components`, `@wordpress/element`, `react`.

## Usage

```jsx
import { __, _n, sprintf } from '@wordpress/i18n';
import { DataTable, useTableState } from '@lwplugins/data-table';
import '@lwplugins/data-table/style.css';

const TYPES = [
	{ value: 'converted', label: __( 'Converted', 'my-plugin' ) },
	{ value: 'failed', label: __( 'Failed', 'my-plugin' ) },
];

const COLUMNS = [
	{ id: 'time', label: __( 'Time', 'my-plugin' ), sortable: true },
	{ id: 'file', label: __( 'File', 'my-plugin' ) },
	{
		id: 'saved',
		label: __( 'Saved', 'my-plugin' ),
		sortable: true,
		align: 'end',
		render: ( row ) => `${ Math.round( row.saved / 1024 ) } KB`,
	},
];

export default function Log( { rows } ) {
	const table = useTableState( rows, {
		searchFields: [ 'file', 'message' ],
		filterField: 'type',
		sort: { field: 'time', direction: 'desc' },
		perPage: 20,
	} );

	return (
		<DataTable
			columns={ COLUMNS }
			table={ table }
			filters={ TYPES }
			caption={ __( 'Event log', 'my-plugin' ) }
			labels={ {
				search: __( 'Search', 'my-plugin' ),
				filter: __( 'Filter', 'my-plugin' ),
				clear: __( 'Clear', 'my-plugin' ),
				empty: __( 'No matching entries.', 'my-plugin' ),
				previous: __( 'Previous page', 'my-plugin' ),
				next: __( 'Next page', 'my-plugin' ),
				entries: ( count ) =>
					/* translators: %d: number of rows. */
					sprintf( _n( '%d entry', '%d entries', count, 'my-plugin' ), count ),
				page: ( page, total ) =>
					/* translators: 1: current page, 2: total pages. */
					sprintf( __( 'Page %1$d of %2$d', 'my-plugin' ), page, total ),
			} }
		/>
	);
}
```

### Why labels are a prop

WordPress loads script translations per plugin, by text domain. Strings
inside a shared package would never be translated in your plugin, so the
package ships English fallbacks only and takes your `__()` strings.

## API

### `useTableState( rows, options )`

| Option | Type | Description |
|--------|------|-------------|
| `searchFields` | `string[]` | Row keys the search box looks in |
| `filterField` | `string` | Row key the filter chips apply to |
| `sort` | `{ field, direction }` | Initial sort (`'asc'` / `'desc'`) |
| `perPage` | `number` | Rows per page (default `20`) |

Returns `rows` (current page), `total`, `page`, `totalPages`, `search`,
`filter`, `sort` and the setters `setSearch`, `toggleFilter`, `clearFilter`,
`toggleSort`, `setPage`. Changing search or filter returns to page 1.

### `<DataTable />`

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Array` | `{ id, label, render?( row ), sortable?, align?: 'start' \| 'center' \| 'end' }` |
| `table` | `Object` | `useTableState()` result |
| `filters` | `Array` | Chip options `{ value, label }` for `filterField` |
| `caption` | `string` | Table caption for screen readers |
| `labels` | `Object` | Translated strings, see `DEFAULT_LABELS` |
| `getRowId` | `( row ) => key` | Row key (default `row.id`) |
| `pagination` | `'bottom' \| 'top' \| 'both'` | Where the pager shows (default `'bottom'`) |

### `filterSortPaginate( rows, state, options )`

The pure function behind the hook — use it with your own markup or in tests.

## Styling

Import `@lwplugins/data-table/style.css`. Colors follow the WordPress Design
System tokens (`--wpds-*`) and the admin theme color. Override the accent:

```css
.lw-table {
	--lw-table-accent: #00a876;
}
```

## When to use DataViews instead

Grid/list layouts, column hiding and reordering, bulk actions, server-side
paging of very large datasets, or DataForm integration. This package is
intentionally small; server-side mode is on the roadmap.

## Releasing

Bump `version` in `package.json`, add the `CHANGELOG.md` entry, push to
`main`. The Release workflow publishes to npm through trusted publishing
(OIDC, no token or OTP) and creates the `vX.Y.Z` tag and GitHub release.
Never tag or `npm publish` by hand.

## License

GPL-2.0-or-later
