/**
 * Size budget: what the package adds to a consumer's bundle, minified and
 * gzipped, with WordPress/React externals (core provides them).
 * Fails when over budget. Run after `npm run build`.
 */
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const BUDGET = { js: 5 * 1024, css: 2 * 1024 };

const js = await build( {
	entryPoints: [ 'build-module/index.js' ],
	bundle: true,
	minify: true,
	format: 'esm',
	write: false,
	external: [ '@wordpress/*', 'react', 'react/*', 'react-dom' ],
} );
const css = await build( {
	entryPoints: [ 'src/data-table.css' ],
	bundle: true,
	minify: true,
	write: false,
} );

const size = ( out ) => gzipSync( out.outputFiles[ 0 ].contents, { level: 9 } ).length;
const result = { js: size( js ), css: size( css ) };
let failed = false;

for ( const [ kind, bytes ] of Object.entries( result ) ) {
	const ok = bytes <= BUDGET[ kind ];
	failed ||= ! ok;
	console.log(
		`${ kind.padEnd( 3 ) } ${ ( bytes / 1024 ).toFixed( 2 ) } KB gz  (budget ${ BUDGET[ kind ] / 1024 } KB)  ${ ok ? 'ok' : 'OVER' }`
	);
}

process.exit( failed ? 1 : 0 );
