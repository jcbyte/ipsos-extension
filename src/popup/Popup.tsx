import { ThemeProvider } from "@/components/theme-provider";
import PopupPanel from "./PopupPanel";

export default function Popup() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<PopupPanel />
		</ThemeProvider>
	);
}
