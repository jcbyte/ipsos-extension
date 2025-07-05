type SettingKey = "date" | "agreeAccuracy" | "idLocation" | "address" | "dob";

type BaseSetting = { enabled: boolean };
type ValueSetting<T> = BaseSetting & { value: T };

type ExactSettingMap<T extends Record<SettingKey, BaseSetting>> = T;

type SettingValueMap = ExactSettingMap<{
	date: BaseSetting;
	agreeAccuracy: BaseSetting;
	idLocation: ValueSetting<string>;
	address: ValueSetting<{ postcode: string; address: string }>;
	dob: ValueSetting<string>;
}>;

export async function getSetting<T extends SettingKey>(key: T): Promise<SettingValueMap[T] | undefined> {
	const setting = (await chrome.storage.local.get(key))[key];
	if (!setting) return undefined;
	return setting as SettingValueMap[T];
}

export async function getSettings<T extends SettingKey>(keys: T[]): Promise<Partial<Pick<SettingValueMap, T>>> {
	const result = await chrome.storage.local.get(keys);
	return result as Partial<Pick<SettingValueMap, T>>;
}

export async function setSetting<T extends SettingKey>(key: T, value: SettingValueMap[T]): Promise<void> {
	await chrome.storage.local.set({ [key]: value });
}
