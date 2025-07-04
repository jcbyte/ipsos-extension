import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "dist",
		rollupOptions: {
			input: {
				background: "src/background.ts",
				content: "src/content.ts",
				popup: "popup.html",
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
	},
	plugins: [preact()],
});
