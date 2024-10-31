import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: 'lib/index.ts',
			name: 'GameEngine',
			// the proper extensions will be added
			fileName: 'game-engine',
		},
	},
	optimizeDeps: {
		include: ['gl-matrix'],
	},
});
