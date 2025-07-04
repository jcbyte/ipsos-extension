import preact from "@preact/preset-vite";
import { resolve } from "path";

import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "dist",
		rollupOptions: {
			input: {
				content: "src/content.ts",
				popup: "popup.html",
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
	},
	plugins: [preact()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
});
