type StorageKey =
	| "date.enabled"
	| "agreeAccuracy.enabled"
	| "idLocation.enabled"
	| "idLocation.value"
	| "address.enabled"
	| "address.value"
	| "dob.enabled"
	| "dob.value";

type ExactStorageMap<T extends Record<StorageKey, any>> = T;

type StorageValueMap = ExactStorageMap<{
	"date.enabled": boolean;
	"agreeAccuracy.enabled": boolean;
	"idLocation.enabled": boolean;
	"idLocation.value": string;
	"address.enabled": boolean;
	"address.value": { postcode: string; address: string };
	"dob.enabled": boolean;
	"dob.value": string;
}>;

export async function getSetting<T extends StorageKey>(key: T): Promise<StorageValueMap[T] | undefined> {
	const setting = (await chrome.storage.local.get(key))[key];
	if (!setting) return undefined;
	return setting as StorageValueMap[T];
}

export async function getSettings<T extends StorageKey>(keys: T[]): Promise<Partial<Pick<StorageValueMap, T>>> {
	const result = await chrome.storage.local.get(keys);
	return result as Partial<Pick<StorageValueMap, T>>;
}

export async function setSetting<T extends StorageKey>(key: T, value: StorageValueMap[T]): Promise<void> {
	await chrome.storage.local.set({ [key]: value });
}
