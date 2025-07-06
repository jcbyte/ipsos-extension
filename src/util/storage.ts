/** All keys to store settings in extension localstorage */
type StorageKey =
	| "date.enabled"
	| "syncDate.enabled"
	| "agreeAccuracy.enabled"
	| "idLocation.enabled"
	| "idLocation.value"
	| "address.enabled"
	| "address.value"
	| "dob.enabled"
	| "dob.value";

type ExactStorageMap<T extends Record<StorageKey, any>> = T;

/** All types of stored settings */
type StorageValueMap = ExactStorageMap<{
	"date.enabled": boolean;
	"syncDate.enabled": boolean;
	"agreeAccuracy.enabled": boolean;
	"idLocation.enabled": boolean;
	"idLocation.value": string;
	"address.enabled": boolean;
	"address.value": { postcode: string; address: string };
	"dob.enabled": boolean;
	"dob.value": string;
}>;

/** Default values of settings if they do not exist yet */
const defaultValues: StorageValueMap = {
	"date.enabled": true,
	"syncDate.enabled": true,
	"agreeAccuracy.enabled": false,
	"idLocation.enabled": false,
	"idLocation.value": "",
	"address.enabled": false,
	"address.value": { postcode: "", address: "" },
	"dob.enabled": false,
	"dob.value": "",
};

/**
 * Retrieves a single setting value from Chrome's local storage.
 *
 * @param {T} key The setting key to retrieve.
 */
export async function getSetting<T extends StorageKey>(key: T): Promise<StorageValueMap[T]> {
	// Fetch the value from local storage, with its default fallback
	const setting = (await chrome.storage.local.get({ [key]: defaultValues[key] }))[key];
	return setting as StorageValueMap[T];
}

/**
 * Retrieves multiple setting values from Chrome's local storage.
 *
 * @param {T[]} keys An array of keys to retrieve.
 */
export async function getSettings<T extends StorageKey>(keys: T[]): Promise<Pick<StorageValueMap, T>> {
	// Map each wanted key to its default value, for the storage API fallback
	const a = Object.fromEntries(keys.map((key) => [key, defaultValues[key]]));

	// Fetch values from local storage, using the defaults as fallback
	const result = await chrome.storage.local.get(a);
	return result as Pick<StorageValueMap, T>;
}

/**
 * Saves a setting value to Chrome's local storage.
 *
 * @param {T} key The key under which to store the value.
 * @param {StorageValueMap[T]} value The value to store.
 */
export async function setSetting<T extends StorageKey>(key: T, value: StorageValueMap[T]): Promise<void> {
	await chrome.storage.local.set({ [key]: value });
}
