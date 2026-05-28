const uploadTypeKey = "internal_.uploadType";
type UploadType = null | "id";

/**
 * Retrieve the currently marked upload type, `null` for no upload.
 */
export async function checkUploadType(): Promise<UploadType> {
	// Fetch the value from local storage, with its default fallback
	const setting = (await chrome.storage.local.get({ [uploadTypeKey]: null }))[uploadTypeKey];
	return setting as UploadType;
}

/**
 * Mark the type of content to upload, in order for the content-upload to send the correct file
 *
 * @param value The type to upload
 */
export async function markUploadType(value: Exclude<UploadType, null>) {
	await chrome.storage.local.set({ [uploadTypeKey]: value });
}

/**
 * Mark the upload as complete, resetting the internal value to null
 */
export async function markUploadComplete() {
	await chrome.storage.local.set({ [uploadTypeKey]: null });
}
