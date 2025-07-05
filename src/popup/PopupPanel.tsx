import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getSetting, getSettings, setSetting } from "@/util/storage";
import { useEffect, useState } from "preact/hooks";

// todo get version number

export default function PopupPanel() {
	const [useDateEnabled, setUseDateEnabled] = useState<boolean>(false);

	const [syncDateEnabled, setSyncDateEnabled] = useState<boolean>(false);

	const [agreeAccuracyEnabled, setAgreeAccuracyEnabled] = useState<boolean>(false);

	const [copyIdEnabled, setCopyIdEnabled] = useState<boolean>(false);
	const [idLocation, setIdLocation] = useState<string>("");

	const [autofillAddressEnabled, setAutofillAddressEnabled] = useState<boolean>(false);
	const [postcode, setPostcode] = useState<string>("");
	const [address, setAddress] = useState<string>("");

	const [autofillAgeEnabled, setAutofillAgeEnabled] = useState<boolean>(false);
	const [dob, setDob] = useState<string>();

	useEffect(() => {
		async function loadSettings() {
			const settings = await getSettings([
				"date.enabled",
				"syncDate.enabled",
				"agreeAccuracy.enabled",
				"idLocation.enabled",
				"idLocation.value",
				"address.enabled",
				"address.value",
				"dob.enabled",
				"dob.value",
			]);

			setUseDateEnabled(settings["date.enabled"]);
			setSyncDateEnabled(settings["syncDate.enabled"]);
			setAgreeAccuracyEnabled(settings["agreeAccuracy.enabled"]);
			setCopyIdEnabled(settings["idLocation.enabled"]);
			setIdLocation(settings["idLocation.value"]);
			setAutofillAddressEnabled(settings["address.enabled"]);
			setPostcode(settings["address.value"].postcode);
			setAddress(settings["address.value"].address);
			setAutofillAgeEnabled(settings["dob.enabled"]);
			setDob(settings["dob.value"]);
		}
		loadSettings();
	}, []);

	async function handleAutofillDateToggle(checked: boolean) {
		await setSetting("date.enabled", checked);
		setUseDateEnabled(checked);
	}

	async function handleSyncDateToggle(checked: boolean) {
		await setSetting("syncDate.enabled", checked);
		setSyncDateEnabled(checked);
	}

	async function handleAutoAgreeAccuracyToggle(checked: boolean) {
		await setSetting("agreeAccuracy.enabled", checked);
		setAgreeAccuracyEnabled(checked);
	}

	async function handleCopyIdToggle(checked: boolean) {
		if (checked) {
			const currentIdLocation = await getSetting("idLocation.value");
			if (currentIdLocation) setIdLocation(currentIdLocation);
		}

		await setSetting("idLocation.enabled", checked);
		setCopyIdEnabled(checked);
	}
	async function handleIdLocationModified(newIdLocation: string) {
		await setSetting("idLocation.value", newIdLocation);
		setIdLocation(newIdLocation);
	}

	async function handleAutofillAddressToggle(checked: boolean) {
		if (checked) {
			const currentAddress = await getSetting("address.value");
			if (currentAddress) {
				setPostcode(currentAddress.postcode);
				setAddress(currentAddress.address);
			}
		}

		await setSetting("address.enabled", checked);
		setCopyIdEnabled(checked);
	}
	async function handlePostcodeModified(newPostcode: string) {
		await setSetting("address.value", { postcode: newPostcode, address });
		setPostcode(newPostcode);
	}
	async function handleAddressModified(newAddress: string) {
		await setSetting("address.value", { postcode, address: newAddress });
		setAddress(newAddress);
	}

	async function handleAutofillAgeToggle(checked: boolean) {
		if (checked) {
			const currentDob = await getSetting("dob.value");
			if (currentDob) setDob(currentDob);
		}

		await setSetting("dob.enabled", checked);
		setAutofillAgeEnabled(checked);
	}
	async function handleDobModified(newDob: string) {
		await setSetting("dob.value", newDob);
		setDob(newDob);
	}

	return (
		<div class="min-w-80 p-6 flex flex-col gap-4">
			<div class="flex flex-col gap-1 items-center">
				<span class="text-xl font-bold text-center">Ipsos Extension</span>
				<span class="text-muted-foreground text-sm text-center">
					Ipsos extension is for automating form filling and streamlining survey processes
				</span>
			</div>

			<Separator />

			<div class="flex flex-col gap-4">
				{/* Auto-fill date and time toggle */}
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="auto-fill-date-toggle">Auto-fill Date & Time</Label>
					<Switch id="auto-fill-date-toggle" checked={useDateEnabled} onCheckedChange={handleAutofillDateToggle} />
				</div>

				{/* Sync date and time toggle */}
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="sync-date-toggle">Sync Date & Time Boxes</Label>
					<Switch id="sync-date-toggle" checked={syncDateEnabled} onCheckedChange={handleSyncDateToggle} />
				</div>

				{/* Auto-confirm accuracy statement toggle */}
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="auto-agree-accuracy-toggle">Auto-agree Accuracy Statement</Label>
					<Switch
						id="auto-agree-accuracy-toggle"
						checked={agreeAccuracyEnabled}
						onCheckedChange={handleAutoAgreeAccuracyToggle}
					/>
				</div>

				{/* ID file location input */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="id-location-toggle">Copy ID path on upload</Label>
						<Switch id="id-location-toggle" checked={copyIdEnabled} onCheckedChange={handleCopyIdToggle} />
					</div>
					{copyIdEnabled && (
						<Input
							type="text"
							id="id-location-input"
							placeholder="Enter ID file path"
							value={idLocation}
							onChange={(e) => handleIdLocationModified((e.target as HTMLInputElement).value)}
						/>
					)}
				</div>

				{/* Address input */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="address-toggle">Auto-fill address</Label>
						<Switch
							id="address-toggle"
							checked={autofillAddressEnabled}
							onCheckedChange={handleAutofillAddressToggle}
						/>
					</div>
					{autofillAddressEnabled && (
						<>
							<Input
								type="text"
								id="postcode-input"
								placeholder="Enter postcode"
								value={postcode}
								onChange={(e) => handlePostcodeModified((e.target as HTMLInputElement).value)}
							/>
							<Input
								type="text"
								id="address-input"
								placeholder="Enter address line"
								value={address}
								onChange={(e) => handleAddressModified((e.target as HTMLInputElement).value)}
							/>
						</>
					)}
				</div>

				{/* Date of birth date picker */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="dob-toggle">Auto-fill age</Label>
						<Switch id="dob-toggle" checked={autofillAgeEnabled} onCheckedChange={handleAutofillAgeToggle} />
					</div>
					{autofillAgeEnabled && (
						<div class="flex flex-col gap-1">
							<span class="text-muted-foreground text-xs pl-1">Enter date of birth</span>
							<Input
								type="date"
								id="dob-input"
								placeholder="Enter date of birth"
								value={dob}
								onChange={(e) => handleDobModified((e.target as HTMLInputElement).value)}
							/>
						</div>
					)}
				</div>
			</div>

			<Separator />

			<div class="flex flex-col gap-0 items-center">
				<span class="text-muted-foreground text-sm text-center">Version X.X.X</span>
				<span class="text-muted-foreground text-sm text-center">Made by Joel</span>
			</div>
		</div>
	);
}
