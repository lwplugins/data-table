# @lwplugins/data-table

Lightweight data table for WordPress admin React screens, built only on core
`@wordpress/components`. Client-side or server-paged, with filters, row
selection and bulk actions.

**Under 5 KB gzipped** (JS, every feature included; CSS ~1.5 KB), checked in
CI. `@wordpress/dataviews` has to be bundled by plugins (core does not ship
it as a script) and weighs ~340–380 KB gzipped; this covers ordinary admin
lists (bookings, customers, orders, logs) without that cost.

- Two modes, one query shape: client (`useTableState`) or server (controlled)
- Search (accent-insensitive, every word must match; debounced in server mode)
- Several filters: toggle chips or a select, any-of within, all across
- Locale-aware sorting, per-column `sortValue` / `searchValue`
- Loading, empty and error states
- Opt-in row selection and bulk actions
- Toolbar slot for your own controls (date range, export…)
- Mobile card layout, RTL, forced colors, screen-reader announcements
- No bundled dependencies, no text domain — you pass translated labels

## Install

```bash
npm install @lwplugins/data-table
```

Peer dependencies (provided by WordPress core when built with
`@wordpress/scripts`): `@wordpress/components`, `@wordpress/element`, `react`.

```js
import { DataTable, useTableState } from '@lwplugins/data-table';
import '@lwplugins/data-table/style.css';
```

## Client mode

All rows are in memory; the hook searches, filters, sorts and pages them.

```jsx
const COLUMNS = [
	{ id: 'time', label: __( 'Time', 'my-plugin' ), sortable: true },
	{ id: 'name', label: __( 'Name', 'my-plugin' ), sortable: true, defaultSortDirection: 'asc' },
	{
		id: 'saved',
		label: __( 'Saved', 'my-plugin' ),
		sortable: true,
		align: 'end',
		render: ( row ) => formatBytes( row.saved ),
	},
];

function Log( { rows } ) {
	const table = useTableState( rows, {
		searchFields: [ 'name', 'message' ],
		columns: COLUMNS,
		sort: { field: 'time', direction: 'desc' },
		perPage: 20,
	} );

	return (
		<DataTable
			columns={ COLUMNS }
			table={ table }
			caption={ __( 'Event log', 'my-plugin' ) }
			filters={ [
				{ field: 'type', label: __( 'Event', 'my-plugin' ), options: TYPES },
				{ field: 'source', label: __( 'Source', 'my-plugin' ), options: SOURCES },
			] }
			labels={ LABELS }
		/>
	);
}
```

## Server mode

Pass the query and the current page of results instead of `table`. The table
renders what it is given and reports what the user asked for through
`onQueryChange`. Search, filter, sort and per-page changes reset `page` to 1.

```jsx
import { DEFAULT_QUERY } from '@lwplugins/data-table';

function Bookings() {
	const [ query, setQuery ] = useState( {
		...DEFAULT_QUERY,
		sort: { field: 'date', direction: 'desc' },
	} );
	const [ result, setResult ] = useState( { items: [], total: 0, totalPages: 1 } );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		// Abort the previous request: a slow response for "ab" must never
		// overwrite the result for "abc".
		const controller = new AbortController();
		setLoading( true );
		apiFetch( { path: addQueryArgs( '/my/v1/bookings', toArgs( query ) ), signal: controller.signal } )
			.then( ( data ) => {
				setResult( data );
				setError( null );
			} )
			.catch( ( e ) => e.name !== 'AbortError' && setError( e.message ) )
			.finally( () => ! controller.signal.aborted && setLoading( false ) );
		return () => controller.abort();
	}, [ query ] );

	return (
		<DataTable
			columns={ COLUMNS }
			rows={ result.items }
			total={ result.total }
			totalPages={ result.totalPages }
			query={ query }
			onQueryChange={ setQuery }
			isLoading={ loading }
			error={ error }
			errorAction={ <Button variant="secondary" onClick={ () => setQuery( { ...query } ) }>{ __( 'Retry', 'my-plugin' ) }</Button> }
		/>
	);
}
```

The query object:

```js
{
	search: '',                                  // free text
	filters: { status: [ 'pending' ], owner: [] }, // field → allowed values
	sort: { field: 'date', direction: 'desc' },
	page: 1,
	perPage: 20,
}
```

What the table handles for you:

- **Debounce:** search is reported after `searchDelay` ms (300 by default in
  server mode, 0 in client mode). Clearing the box reports immediately.
- **Page past the end:** after deleting the last row on the last page,
  `page > totalPages`; the table emits a query for the last page instead of
  showing an empty one.
- **Loading:** previous rows stay (dimmed) and the layout does not jump; with
  nothing to show yet, aria-hidden skeleton rows are drawn.

What stays your job: aborting stale requests (pattern above) — the table
never assumes the last `rows` it received belong to the latest query.

## Filters

```js
filters={ [
	{ field: 'status', label: 'Status', options: STATUSES },               // chips, multi
	{ field: 'owner', label: 'Owner', options: OWNERS, multiple: false },  // chips, single
	{ field: 'country', label: 'Country', options: COUNTRIES, type: 'select' },
] }
```

- Within a filter, any chosen value matches; across filters, all must match.
- Chips show up to 6 options; longer lists (or `type: 'select'`) become a
  single-choice select with an "All" option.
- Each chip group gets a "Clear" link; "Clear all" appears with 2+ active filters.
- Client mode matches array-valued row fields: `tags: [ 'a', 'b' ]` matches filter `a`.

## States

| Prop | Effect |
|------|--------|
| `isLoading` | `aria-busy` on the region, previous rows dimmed, or skeleton rows when empty |
| `error` | Message in a `role="alert"` box instead of the rows and the empty state |
| `errorAction` | Node rendered next to the error (e.g. a Retry button) |
| `labels.empty` | Shown when search/filters match nothing ("No matching entries.") |
| `labels.emptyAll` | Shown when there is no data at all ("Nothing here yet.") |

## Selection and bulk actions

```jsx
const [ selected, setSelected ] = useState( [] );

<DataTable
	/* … */
	getRowLabel={ ( row ) => `${ row.name }, ${ row.date }` }
	selection={ { selected, onChange: setSelected } }
	bulkActions={ [
		{
			id: 'confirm',
			label: __( 'Confirm', 'my-plugin' ),
			isEligible: ( row ) => row.status === 'pending',
			onClick: async ( rows, ids ) => { await confirm( rows ); setSelected( [] ); },
		},
		{ id: 'delete', label: __( 'Delete', 'my-plugin' ), isDestructive: true, onClick: askThenDelete },
	] }
/>
```

- **Selection is kept by id across pages and filters**, and never silently:
  the bar reads "3 selected, 1 on this page". Clear it yourself when a filter
  change should reset it (`onQueryChange` is the place).
- **"Select all" means this page only.** Selecting every result across pages
  is out of scope.
- The header checkbox is tri-state; row checkboxes are named after the row
  (`getRowLabel`, e.g. "Select: Jane Doe, 12 Oct").
- An action receives the **eligible selected rows on the current page** and
  all selected ids. Partially eligible actions show why ("applies to 2 of 3");
  an action with no eligible row is disabled but stays focusable.
- **Confirmation for destructive actions is your job** (a `ConfirmDialog`
  in `onClick`); `isDestructive` only styles the button.
- After an action, focus moves to the selection count (or the table region),
  since the button that had focus may no longer exist.

## Toolbar slot and per-page

```jsx
<DataTable
	toolbar={
		<>
			<input type="date" aria-label={ __( 'From', 'my-plugin' ) } value={ from } onChange={ … } />
			<input type="date" aria-label={ __( 'To', 'my-plugin' ) } value={ to } onChange={ … } />
		</>
	}
	perPageOptions={ [ 10, 20, 50 ] }
/>
```

Date pickers and exports stay out of the package; the slot gives them a place.

## API

### `<DataTable />`

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Array` | `{ id, label, render?( row ), sortable?, defaultSortDirection?, align?: 'start' \| 'center' \| 'end', sortValue?( row ), searchValue?( row ) }` |
| `table` | `Object` | Client mode: `useTableState()` result |
| `rows`, `total`, `totalPages`, `query`, `onQueryChange` | | Server mode (instead of `table`) |
| `filters` | `Array` | Filter definitions (see Filters) |
| `searchable` | `boolean` | Show the search box (default `true`) |
| `searchDelay` | `number` | Search debounce in ms (default 300 server / 0 client) |
| `isLoading`, `error`, `errorAction` | | See States |
| `toolbar` | `node` | Extra controls in the toolbar row |
| `selection` | `{ selected, onChange }` | Opt-in row selection (ids) |
| `bulkActions` | `Array` | `{ id, label, onClick( rows, ids ), isEligible?( row ), isDestructive? }` |
| `getRowId` | `( row ) => key` | Row key (default `row.id`) |
| `getRowLabel` | `( row ) => string` | Row name for checkbox labels |
| `pagination` | `'bottom' \| 'top' \| 'both'` | Where the pager shows (default `'bottom'`) |
| `perPageOptions` | `number[]` | Adds a rows-per-page select |
| `caption` | `string` | Table caption and region name (screen readers) |
| `labels` | `Object` | Translated strings, see `DEFAULT_LABELS` |

### `useTableState( rows, options )`

Options: `searchFields`, `columns` (for `sortValue` / `searchValue`), initial
`sort`, `perPage`, `filters`. Returns the table API: `rows`, `total`, `page`,
`totalPages`, `query`, and `setSearch`, `setFilter( field, values )`,
`toggleFilter( field, value, multiple )`, `clearFilters( field? )`,
`toggleSort( field, defaultDirection )`, `setPage`, `setPerPage`, `setQuery( patch )`.

### Utilities

`filterSortPaginate( rows, query, { searchFields, columns } )`,
`matchesFilters( row, filters )`, `compareValues( a, b )`, `normalize( text )`,
`DEFAULT_QUERY`, `patchQuery( query, patch )`, `createTableApi( query, setQuery, result )`,
`isNarrowed( query )`.

### Why labels are a prop

WordPress loads script translations per plugin, by text domain. Strings
inside a shared package would never be translated in your plugin, so the
package ships English fallbacks only and takes your `__()` strings. Function
labels (`entries`, `results`, `page`, `selectRow`, `selected`, `eligible`)
receive numbers so you can use `_n()` and `sprintf()`.

## Accessibility

- Explicit table roles, so the mobile card layout (`display: block`) keeps
  row/cell/column-header semantics; visible cell labels instead of CSS
  generated content.
- `aria-sort` only on the sorted column; header buttons are named by the label.
- Debounced polite announcement of the result count; nothing announced per
  request or while loading. Errors use `role="alert"`, empty states are plain text.
- Chips: `aria-pressed`, a check icon (not colour alone), ≥ 24 px targets.
- Forced colors: pressed chips, selected rows and focus rings use system colours.
- The scrolling table region is focusable and labelled for keyboard scrolling.
- Focus is not dropped: pager buttons stay focusable when disabled, focus
  moves to the selection count after a bulk action.
- CI runs axe on a fully featured table. Manual screen-reader passes (NVDA +
  Chrome, VoiceOver + Safari) are still to do before 1.0.

## Migrating from 0.2

| 0.2 | 0.3 |
|-----|-----|
| `useTableState( rows, { filterField: 'type' } )` | `useTableState( rows, { … } )` — filters live in the query |
| `filters={ TYPES }` | `filters={ [ { field: 'type', label: 'Event', options: TYPES } ] }` |
| `table.filter` | `table.filters.type` |
| `table.toggleFilter( value )` | `table.toggleFilter( 'type', value )` |
| `table.clearFilter()` | `table.clearFilters( 'type' )` or `table.clearFilters()` |

## Out of scope

Column hiding and reordering, grid/list layouts, saved views, DataForm,
inline editing, virtualisation, "select all across pages", built-in date
pickers. Use DataViews when you need those.

## Releasing

Bump `version` in `package.json`, add the `CHANGELOG.md` entry, push to
`main`. The Release workflow tests, checks the size budget, publishes to npm
through trusted publishing (OIDC, no token or OTP) and creates the `vX.Y.Z`
tag and GitHub release. Never tag or `npm publish` by hand.

## License

GPL-2.0-or-later
