import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function PopupPanel() {
	return (
		<div class="min-w-80 p-6 flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-xl font-bold">Ipsos Extension</span>
				<span class="text-zinc-300 text-sm">
					Ipsos extension is for automating form filling and streamlining survey processes
				</span>
			</div>

			<Separator />

			<div class="flex flex-col gap-1">
				{/* Auto-fill date and time toggle */}
				<div className="flex items-center gap-2">
					<Label htmlFor="auto-fill-date-toggle">Auto-fill Date & Time</Label>
					<Switch id="auto-fill-date-toggle" />
				</div>

				{/* Auto-confirm accuracy statement toggle */}
				<div className="flex items-center gap-2">
					<Label htmlFor="auto-agree-accuracy-toggle">Auto-agree Accuracy Statement</Label>
					<Switch id="auto-agree-accuracy-toggle" />
				</div>

				{/* ID file location input */}
				<div className="grid w-full max-w-sm items-center gap-3">
					<Label htmlFor="id-location-input">ID Location</Label>
					<Input type="text" id="id-location-input" placeholder="C:\Docs\Id\" />
				</div>

				{/* Postcode input */}
				<div className="grid w-full max-w-sm items-center gap-3">
					<Label htmlFor="postcode-input">Email</Label>
					<Input type="text" id="postcode-input" placeholder="SW1A 1AA" />
				</div>

				{/* Address input */}
				<div className="grid w-full max-w-sm items-center gap-3">
					<Label htmlFor="address-input">Email</Label>
					<Input type="text" id="address-input" placeholder="Buckingham Palace" />
				</div>

				{/* // todo add dob selector */}
			</div>

			<Separator />

			<div class="flex flex-col gap-1">
				<span>Version X.X.X</span>
				<span>Made by Joel</span>
			</div>
		</div>
	);
}
