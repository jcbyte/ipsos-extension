import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { defineConfig, UserConfig } from "vite";

const baseConfig: UserConfig = {
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
};

export default defineConfig(({ mode }) => ({
	...baseConfig,
	...(mode === "content"
		? {
				// Content script build - IIFE format
				build: {
					outDir: "dist/content",
					copyPublicDir: false, // As this would place it within dist/content
					rollupOptions: {
						input: "src/content.ts",
						output: {
							entryFileNames: "[name].js",
							format: "iife", // For injected content script
						},
					},
					emptyOutDir: false,
				},
		  }
		: {
				// Popup build - ES module format
				build: {
					outDir: "dist",
					rollupOptions: {
						input: "popup.html",
						output: {
							entryFileNames: "[name].js",
							format: "es",
						},
					},
					emptyOutDir: false,
				},
				plugins: [preact(), tailwindcss()],
		  }),
}));
