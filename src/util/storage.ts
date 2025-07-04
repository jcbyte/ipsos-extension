type StorageKey = "idLocation" | "postcode" | "address" | "dob";

export async function get<T>(key: StorageKey): Promise<T | undefined> {
	return (await chrome.storage.local.get(key))[key] as T;
}

export async function set<T>(key: StorageKey, value: T): Promise<void> {
	await chrome.storage.local.set({ [key]: value });
}
