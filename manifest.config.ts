import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
	manifest_version: 3,
	name: "Ipsos Extension",
	description:
		"Ipsos Extension provides quality of life features and automates parts of form filling for ishopforipsos.",
	version: pkg.version,
	action: {
		default_icon: {
			16: "icons/icon16.png",
			48: "icons/icon48.png",
			128: "icons/icon128.png",
		},
		default_popup: "src/popup/popup.html",
	},
	content_scripts: [
		{
			matches: ["https://uk.ishopforipsos.com/*"],
			js: ["src/content/content.ts"],
			run_at: "document_idle",
			all_frames: true,
		},
		// {
		// 	matches: ["https://Media08.research-cloud.com/Upload/*"],
		// 	js: ["src/content/content-upload.ts"],
		// 	run_at: "document_idle",
		// 	all_frames: true,
		// },
	],
	permissions: ["storage"],
});
