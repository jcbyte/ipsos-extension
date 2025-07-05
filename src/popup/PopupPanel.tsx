import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "preact/hooks";

export default function PopupPanel() {
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [dob, setDob] = useState<Date | undefined>(undefined);

	useEffect(() => {
		console.log(calendarOpen);
	}, [calendarOpen]);

	return (
		<div class="min-w-80 p-6 flex flex-col gap-4">
			<div class="flex flex-col gap-1 items-center">
				<span class="text-xl font-bold text-center">Ipsos Extension</span>
				<span class="text-zinc-300 text-sm text-center">
					Ipsos extension is for automating form filling and streamlining survey processes
				</span>
			</div>

			<Separator />

			<div class="flex flex-col gap-4">
				{/* Auto-fill date and time toggle */}
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="auto-fill-date-toggle">Auto-fill Date & Time</Label>
					<Switch id="auto-fill-date-toggle" />
				</div>

				{/* Auto-confirm accuracy statement toggle */}
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="auto-agree-accuracy-toggle">Auto-agree Accuracy Statement</Label>
					<Switch id="auto-agree-accuracy-toggle" />
				</div>

				{/* ID file location input */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="id-location-toggle">Copy ID path on upload</Label>
						<Switch id="id-location-toggle" />
					</div>
					<Input type="text" id="id-location-input" placeholder="Enter ID file path" />
				</div>

				{/* Address input */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="address-toggle">Auto-fill address</Label>
						<Switch id="address-toggle" />
					</div>
					<Input type="text" id="postcode-input" placeholder="Enter postcode" />
					<Input type="text" id="address-input" placeholder="Enter address line" />
				</div>

				{/* Date of birth date picker */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="dob-toggle">Auto-fill age</Label>
						<Switch id="dob-toggle" />
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-zinc-300 text-xs pl-1">Enter date of birth</span>
						<Input type="date" id="dob-input" placeholder="Enter date of birth" />
					</div>
				</div>
			</div>

			<Separator />

			<div class="flex flex-col gap-0 items-center">
				<span class="text-zinc-300 text-sm text-center">Version X.X.X</span>
				<span class="text-zinc-300 text-sm text-center">Made by Joel</span>
			</div>
		</div>
	);
}
