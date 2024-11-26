import { defineConfig } from 'vite'

export default defineConfig({
	base: "",
	optimizeDeps: {
		include: ["gl-matrix", "howler"],
	},
});
