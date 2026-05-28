import { crx } from "@crxjs/vite-plugin";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import manifest from "./manifest.config";
import pkg from "./package.json";

export default defineConfig({
	plugins: [crx({ manifest }), preact(), tailwindcss()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	server: {
		cors: {
			origin: [/chrome-extension:\/\//],
		},
	},
});
