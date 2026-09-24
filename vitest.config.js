import { defineConfig } from 'vitest/config';

// Source and tests write JSX in .js files (WordPress convention); let the
// transformer treat them as JSX with the automatic React runtime.
export default defineConfig( {
	oxc: {
		include: /\.js$/,
		exclude: [],
		lang: 'jsx',
		jsx: { runtime: 'automatic' },
	},
} );
