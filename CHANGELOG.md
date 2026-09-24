# Changelog

## [0.3.0] - 2026-09-24

### Added
- Server (controlled) mode: pass `rows`, `total`, `totalPages`, `query` and `onQueryChange` instead of `table`; the table renders what it is given and reports what the user asked for
- Debounced search (`searchDelay`, 300 ms by default in server mode)
- Page-past-the-end correction in server mode (emits a query for the last page)
- Several filters (`filters: [ { field, label, options, multiple?, type? } ]`): any-of within a filter, all across filters, per-filter and "Clear all" controls, select fallback above 6 options, array-valued row fields
- Loading, empty and error states: `isLoading` (aria-busy, previous rows kept and dimmed, aria-hidden skeleton rows), `error` + `errorAction` (role="alert"), separate `empty` / `emptyAll` labels
- `toolbar` slot for per-screen controls (date range, export…)
- Opt-in row selection (`selection`) and `bulkActions` with eligibility, destructive styling, tri-state header checkbox, row-named checkboxes and focus handling after an action
- `perPageOptions` rows-per-page select
- Column `sortValue( row )`, `searchValue( row )` and `defaultSortDirection`
- Polite, debounced result announcements
- Size ceiling in CI (`npm run size`: fails above 20 KB JS / 5 KB CSS gzipped; 0.3.0 is ~4.6 KB / ~1.5 KB)
- Component tests with jsdom and an axe accessibility check

### Changed
- **Breaking:** one query shape for both modes. `useTableState` takes `filters` (object) instead of `filterField`; `toggleFilter( field, value )`, `setFilter`, `clearFilters( field? )` replace the single-filter setters; the `filters` prop takes filter definitions instead of a flat option list
- Locale-aware sorting (`Intl.Collator`, numeric): "Ábel" sorts before "Zoltán", "9" before "10"
- Normalized search text is cached per row instead of rebuilt per keystroke
- Accessibility: explicit table roles that survive the mobile card layout, visible cell labels instead of `::before` content, chips with a check icon and ≥ 24 px targets, 3:1 control outlines, forced-colors styles, focusable scroll region, RTL-aware alignment and pager icons

## [0.2.0] - 2026-09-24

### Added
- `pagination` prop on `DataTable`: `'bottom'` (default), `'top'` or `'both'`; the top pager sits at the right end of the toolbar with the entry count

### Changed
- Pager extracted into its own component (no visual change)

## [0.1.0] - 2026-09-24

### Added
- `DataTable` component: search, filter chips, sortable headers, paging, empty state, mobile card layout
- `useTableState` hook for client-side search, filter, sort and paging
- `filterSortPaginate` pure function
- Translatable UI strings through the `labels` prop (`DEFAULT_LABELS` fallback)
- `style.css` based on WordPress Design System tokens, `--lw-table-accent` override
