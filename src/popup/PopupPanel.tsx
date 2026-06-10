import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getSetting, getSettings, setSetting } from "@/util/storage";
import { fileToBase64 } from "@/util/util";
import { TriangleAlert } from "lucide-react";
import { TargetedEvent } from "preact";
import { useEffect, useState } from "preact/hooks";

export default function PopupPanel() {
	// This form is made of controlled input elements which update storage on change

	const [useDateEnabled, setUseDateEnabled] = useState<boolean>(false);

	const [syncDateEnabled, setSyncDateEnabled] = useState<boolean>(false);

	const [agreeAccuracyEnabled, setAgreeAccuracyEnabled] = useState<boolean>(false);

	const [idImage, setIdImage] = useState<string | null>(null);

	const [autofillAddressEnabled, setAutofillAddressEnabled] = useState<boolean>(false);
	const [postcode, setPostcode] = useState<string>("");
	const [address, setAddress] = useState<string>("");

	const [autofillAgeEnabled, setAutofillAgeEnabled] = useState<boolean>(false);
	const [dob, setDob] = useState<string>();

	useEffect(() => {
		// Initially load settings
		async function loadSettings() {
			const settings = await getSettings([
				"date.enabled",
				"syncDate.enabled",
				"agreeAccuracy.enabled",
				"idImage.value",
				"address.enabled",
				"address.value",
				"dob.enabled",
				"dob.value",
			]);

			setUseDateEnabled(settings["date.enabled"]);
			setSyncDateEnabled(settings["syncDate.enabled"]);
			setAgreeAccuracyEnabled(settings["agreeAccuracy.enabled"]);
			setIdImage(settings["idImage.value"]);
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

	async function handleIdImageSet(e: TargetedEvent<HTMLInputElement>) {
		const file = e.currentTarget.files?.[0];
		if (!file) return;

		// Extract the Base64 text from the uploaded image
		const b64 = await fileToBase64(file);
		setIdImage(b64);
		await setSetting("idImage.value", b64);
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
		setAutofillAddressEnabled(checked);
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
		<div className="min-w-96 p-6 flex flex-col gap-4">
			<div className="flex flex-col gap-1 items-center">
				<span className="text-xl font-bold text-center">Ipsos Extension</span>
				<span className="text-muted-foreground text-sm text-center">
					Ipsos Extension is for automating parts of form filling and streamlining survey processes for&nbsp;
					<a
						href="https://uk.ishopforipsos.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="underline underline-offset-1"
					>
						ishopforipsos
					</a>
					.
				</span>
			</div>

			<Separator />

			<div className="flex flex-col gap-4">
				{/* Auto-fill date and time toggle */}
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="auto-fill-date-toggle">Auto-fill Current Date & Time</Label>
					<Switch id="auto-fill-date-toggle" checked={useDateEnabled} onCheckedChange={handleAutofillDateToggle} />
				</div>

				{/* Sync date and time toggle */}
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="sync-date-toggle">Sync Date & Time Fields</Label>
					<Switch id="sync-date-toggle" checked={syncDateEnabled} onCheckedChange={handleSyncDateToggle} />
				</div>

				{/* Auto-confirm accuracy statement toggle */}
				<div className="flex flex-col gap-0">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="auto-agree-accuracy-toggle">Auto-agree to Accuracy Statement</Label>
						<Switch
							id="auto-agree-accuracy-toggle"
							checked={agreeAccuracyEnabled}
							onCheckedChange={handleAutoAgreeAccuracyToggle}
						/>
					</div>
					{agreeAccuracyEnabled && (
						<div className="flex items-center gap-2">
							<TriangleAlert className="text-destructive" size={28} />
							<span className="text-destructive text-xs">
								By enabling this option, you confirm that you are responsible for the accuracy of all submitted
								information.
							</span>
						</div>
					)}
				</div>

				{/* ID image upload */}
				<div className="flex flex-col gap-2">
					{/* todo remove image + better styling */}
					<Label htmlFor="id-image-upload">Easy-fill ID Image</Label>
					{!idImage ? (
						<Input
							type="file"
							id="id-image-upload"
							accept="image/png,image/jpeg,image/webp"
							onChange={handleIdImageSet}
						/>
					) : (
						<img src={idImage} alt="ID Image" />
					)}
				</div>

				{/* Address input */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor="address-toggle">Auto-fill Address</Label>
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
						<Label htmlFor="dob-toggle">Auto-fill Age</Label>
						<Switch id="dob-toggle" checked={autofillAgeEnabled} onCheckedChange={handleAutofillAgeToggle} />
					</div>
					{autofillAgeEnabled && (
						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground text-xs pl-1">Enter date of birth</span>
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

			<div className="flex flex-col gap-0 items-center">
				<span className="text-muted-foreground text-sm text-center">Version {__APP_VERSION__}</span>
				<span className="text-muted-foreground text-sm text-center">Made by Joel Cutler</span>
			</div>
		</div>
	);
}
