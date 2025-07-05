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

const defaultValues: StorageValueMap = {
	"date.enabled": true,
	"agreeAccuracy.enabled": false,
	"idLocation.enabled": false,
	"idLocation.value": "",
	"address.enabled": false,
	"address.value": { postcode: "", address: "" },
	"dob.enabled": false,
	"dob.value": "",
};

export async function getSetting<T extends StorageKey>(key: T): Promise<StorageValueMap[T]> {
	const setting = (await chrome.storage.local.get({ [key]: defaultValues[key] }))[key];
	return setting as StorageValueMap[T];
}

export async function getSettings<T extends StorageKey>(keys: T[]): Promise<Pick<StorageValueMap, T>> {
	const result = await chrome.storage.local.get(Object.fromEntries(keys.map((key) => [key, defaultValues[key]])));
	return result as Pick<StorageValueMap, T>;
}

export async function setSetting<T extends StorageKey>(key: T, value: StorageValueMap[T]): Promise<void> {
	await chrome.storage.local.set({ [key]: value });
}
