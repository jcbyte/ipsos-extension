import { getSetting } from "@/util/storage";
import { checkUploadType, markUploadComplete, type UploadType } from "../util/mark-upload";

async function checkUpload() {
	const uploadType = await checkUploadType();
	if (!uploadType) {
		return;
	}

	console.log(`Ipsos Extension: Upload form found, whilst requesting '${uploadType}'.`);

	// Extract base64 string to use
	const b64Handler: Record<Exclude<UploadType, null>, () => Promise<string | null>> = {
		id: () => getSetting("idImage.value"),
	};
	const base64 = await b64Handler[uploadType]();

	const fileUpload = document.querySelector<HTMLInputElement>('input[type="file"]');
	if (fileUpload && base64) {
		// Convert the stored base64 image, into a blob to create a file object
		const res = await fetch(base64);
		const blob = await res.blob();
		const mime = blob.type || "image/png";
		const ext =
			{
				"image/jpeg": "jpg",
				"image/png": "png",
				"image/webp": "webp",
			}[mime] ?? "bin";
		const file = new File([blob], `uploaded_image.${ext}`, { type: mime });

		// Create a data transfer object to upload the "file" to the upload input
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(file);

		// Attach the files into the input
		fileUpload.files = dataTransfer.files;
		fileUpload.dispatchEvent(new Event("change", { bubbles: true }));

		console.log("Ipsos Extension: File injected into sub-iframe.");
	}

	// Mark the upload as complete, which will make the main context press the close button
	markUploadComplete();
}

checkUpload();
