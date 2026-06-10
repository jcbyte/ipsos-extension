import { getSetting } from "@/util/storage";
import { checkUploadType, markUploadComplete, type UploadType } from "../util/mark-upload";
import "./content-upload.css";

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
		// Show ipsos extension overlay, so the user knows we are uploading
		const overlay = document.createElement("div");
		overlay.className = "jcbyte-loader-overlay";
		const spinnerIcon = document.createElement("img");
		spinnerIcon.className = "jcbyte-loader-spinner";
		spinnerIcon.src = chrome.runtime.getURL("icons/icon128.png");
		spinnerIcon.alt = "Ipsos Extension: Spinner Icon";
		overlay.appendChild(spinnerIcon);
		document.body.appendChild(overlay);

		// Convert the stored base64 image, into a blob to create a file object
		const res = await fetch(base64);
		const blob = await res.blob();
		const mime = blob.type || "image/png";
		const ext =
			{
				"image/jpeg": "jpg",
				"image/png": "png",
			}[mime] ?? "bin";
		const file = new File([blob], `uploaded_image.${ext}`, { type: mime });

		// Create a data transfer object to upload the "file" to the upload input
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(file);

		// Attach the files into the input
		fileUpload.files = dataTransfer.files;
		fileUpload.dispatchEvent(new Event("change", { bubbles: true }));

		console.log("Ipsos Extension: File injected into sub-iframe.");

		// Don't remove the overlay, as this is not when the image is actually uploaded
		// It will be removed when the upload modal closes
		// overlay.remove();
	} else {
		// If their is an error then explain to the user
		// This is unlikely unless the user has loaded the form, then proceeded to remove their image
		alert("Ipsos Extension ran into a problem finding your image. Have you cleared it?\nPlease upload manually.");
	}

	// Mark the upload as complete, which will make the main context press the close button
	markUploadComplete();
}

checkUpload();
