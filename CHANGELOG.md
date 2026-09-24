# Changelog

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
