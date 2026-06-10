const uploadTypeKey = "internal_.uploadType";
export type FullUploadType = null | "id";
export type UploadType = Exclude<FullUploadType, null>;

/**
 * Retrieve the currently marked upload type, `null` for no upload.
 */
export async function checkUploadType(): Promise<FullUploadType> {
	// Fetch the value from local storage, with its default fallback
	const setting = (await chrome.storage.local.get({ [uploadTypeKey]: null }))[uploadTypeKey];
	return setting as FullUploadType;
}

/**
 * Mark the type of content to upload, in order for the content-upload to send the correct file
 *
 * @param value The type to upload
 */
export async function markUploadType(value: UploadType) {
	await chrome.storage.local.set({ [uploadTypeKey]: value });
}

/**
 * Mark the upload as complete, resetting the internal value to null
 */
export async function markUploadComplete() {
	await chrome.storage.local.set({ [uploadTypeKey]: null });
}

/**
 * Provide a callback, executed once when the upload is marked as complete.
 *
 * @param cb Callback to run once
 */
export function markCompleteCallback(cb: () => void) {
	function handle_storage_change(changes: { [key: string]: chrome.storage.StorageChange }) {
		if (changes[uploadTypeKey] && changes[uploadTypeKey].newValue === null) {
			cb();
			chrome.storage.onChanged.removeListener(handle_storage_change);
		}
	}

	chrome.storage.onChanged.addListener(handle_storage_change);
}
