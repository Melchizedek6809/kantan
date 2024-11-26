import { defineConfig } from 'vite'

export default defineConfig({
	optimizeDeps: {
		include: ["gl-matrix", "howler"],
	},
});
