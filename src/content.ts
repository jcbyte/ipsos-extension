import { getSetting, getSettings } from "@/util/storage";
import { waitForElement } from "@/util/util";
import DateDiff from "date-diff";

async function awaitForm() {
	// Wait for the correct form to be shown
	await waitForElement(() => {
		const title = document.body.querySelector("h1.surveytitle");

		if (title?.textContent?.startsWith("Retail Home Delivery")) {
			return title;
		}

		return null;
	});

	console.log("Ipsos Extension: 'Retail Home Delivery' form found.");

	// Once everything is loaded then fill it
	window.addEventListener("load", () => {
		console.log("Ipsos Extension: DOM loaded, filling now.");
		autofill();
	});
}

async function autofill() {
	const settings = await getSettings([
		"date.enabled",
		"syncDate.enabled",
		"agreeAccuracy.enabled",
		"idLocation.enabled",
		"address.enabled",
		"dob.enabled",
	]);

	const now = new Date();
	const questions = Array.from(document.body.querySelectorAll<HTMLSpanElement>("span.surveyquestion"));
	const questionCells = Array.from(document.body.querySelectorAll<HTMLTableCellElement>("th.surveyquestioncell"));

	/** Whether we are updating the time objects, so they shouldn't update as this would create a feedback loop. */
	let isTimeSyncing = false;

	// Auto-fill top date and time box with the current time
	// todo do not set if there is already a value there
	let topYearSelect: HTMLSelectElement | null = null;
	let topMonthSelect: HTMLSelectElement | null = null;
	let topDaySelect: HTMLSelectElement | null = null;
	let topHourSelect: HTMLSelectElement | null = null;
	let topMinuteSelect: HTMLSelectElement | null = null;

	if (settings["date.enabled"] || settings["syncDate.enabled"]) {
		topYearSelect = document.querySelector<HTMLSelectElement>("#dsYear");
		topMonthSelect = document.querySelector<HTMLSelectElement>("#dsMonth");
		topDaySelect = document.querySelector<HTMLSelectElement>("#dsDay");
		topHourSelect = document.querySelector<HTMLSelectElement>("#tsHoursHEAD_TIME");
		topMinuteSelect = document.querySelector<HTMLSelectElement>("#tsMinutesHEAD_TIME");
	}

	if (settings["date.enabled"]) {
		if (topYearSelect && topMonthSelect && topDaySelect) {
			topYearSelect.value = now.getFullYear().toString();
			topYearSelect.dispatchEvent(new Event("change"));
			topMonthSelect.value = now.getMonth().toString();
			topMonthSelect.dispatchEvent(new Event("change"));
			topDaySelect.value = (now.getDate() - 1).toString();
			topDaySelect.dispatchEvent(new Event("change"));
		} else {
			console.warn("Ipsos Extension: Could not find top date boxes.");
		}

		if (topHourSelect && topMinuteSelect) {
			topHourSelect.value = now.getHours().toString();
			topHourSelect.dispatchEvent(new Event("change"));
			topMinuteSelect.value = now.getMinutes().toString();
			topMinuteSelect.dispatchEvent(new Event("change"));
		} else {
			console.warn("Ipsos Extension: Could not find top time boxes.");
		}
	}

	// Auto-select yes to confirm information entered is accurate
	if (settings["agreeAccuracy.enabled"]) {
		// Get "yes" and "no" DOM buttons
		const confirmationQuestion = questions.find((question) => question.textContent?.trim().startsWith("1,1. "));
		const confirmationYesInput =
			confirmationQuestion?.parentElement?.querySelector<HTMLInputElement>('input[value="1"]');
		const confirmationNoInput =
			confirmationQuestion?.parentElement?.querySelector<HTMLInputElement>('input[value="2"]');

		if (confirmationYesInput && confirmationNoInput) {
			// Only select if nothing has been previously selected
			if (!confirmationYesInput.checked && !confirmationNoInput.checked) {
				// Select yes
				confirmationYesInput.click();
			} else {
				console.warn("Ipsos Extension: Could not confirmation yes radio button.");
			}
		}
	}

	// Auto-fill main date and time with current time
	// todo do not set if there is already a value there
	let dateInput: HTMLInputElement | null = null;
	let hourSelect: HTMLSelectElement | null = null;
	let minuteSelect: HTMLSelectElement | null = null;

	if (settings["date.enabled"] || settings["syncDate.enabled"]) {
		const dateQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.2. "));
		dateInput = dateQuestion?.parentElement?.querySelector("tbody")?.querySelector<HTMLInputElement>("input") ?? null;

		const timeQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.3. "));
		const timeSelects = timeQuestion?.parentElement
			?.querySelector("tbody")
			?.querySelectorAll<HTMLSelectElement>("select");

		if (timeSelects && timeSelects.length === 2) {
			hourSelect = timeSelects[0];
			minuteSelect = timeSelects[1];
		}
	}

	if (settings["date.enabled"]) {
		if (dateInput) {
			const day = String(now.getDate()).padStart(2, "0");
			const month = String(now.getMonth() + 1).padStart(2, "0");
			const year = now.getFullYear();
			const formattedDate = `${day}/${month}/${year}`;

			// todo this doesn't seem to work
			dateInput.value = formattedDate;
			dateInput.dispatchEvent(new Event("change"));
		} else {
			console.warn("Ipsos Extension: Could not find date input.");
		}

		if (hourSelect && minuteSelect) {
			hourSelect.value = now.getHours().toString().padStart(2, "0");
			hourSelect.dispatchEvent(new Event("change"));
			minuteSelect.value = now.getMinutes().toString().padStart(2, "0");
			minuteSelect.dispatchEvent(new Event("change"));
		} else {
			console.warn("Ipsos Extension: Could not find time inputs.");
		}
	}

	// Sync changes with top date and time
	if (settings["syncDate.enabled"]) {
		if (dateInput && topYearSelect && topMonthSelect && topDaySelect) {
			// We have to use a polling method here, as the calender selector updates `dateInput.value` silently
			let lastDateInputValue = dateInput.value;
			setInterval(() => {
				if (dateInput.value !== lastDateInputValue) {
					lastDateInputValue = dateInput.value;
					const [day, month, year] = dateInput.value.split("/");

					isTimeSyncing = true;
					topYearSelect.value = year;
					topYearSelect.dispatchEvent(new Event("change"));
					topMonthSelect.value = String(Number(month) - 1);
					topMonthSelect.dispatchEvent(new Event("change"));
					topDaySelect.value = String(Number(day) - 1);
					topDaySelect.dispatchEvent(new Event("change"));
					isTimeSyncing = false;
				}
			}, 100);

			const updateDateInput = () => {
				const day = String(Number(topDaySelect.value) + 1).padStart(2, "0");
				const month = String(Number(topMonthSelect.value) + 1).padStart(2, "0");
				const year = topYearSelect.value;
				const formattedDate = `${day}/${month}/${year}`;

				// todo this doesn't seem to work?
				dateInput.value = formattedDate;
				isTimeSyncing = true;
				dateInput.dispatchEvent(new Event("change"));
				isTimeSyncing = false;
			};

			topYearSelect.addEventListener("change", updateDateInput);
			topMonthSelect.addEventListener("change", updateDateInput);
			topDaySelect.addEventListener("change", updateDateInput);
		} else {
			console.warn("Ipsos Extension: Could not find top date boxes or date input (for syncing).");
		}

		// Sync changes with top time
		if (hourSelect && minuteSelect && topHourSelect && topMinuteSelect) {
			hourSelect.addEventListener("change", (e) => {
				if (isTimeSyncing) return;

				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.replace(/^0+/, "") || "0";
				topHourSelect.value = formattedValue;
				isTimeSyncing = true;
				topHourSelect.dispatchEvent(new Event("change"));
				isTimeSyncing = false;
			});

			topHourSelect.addEventListener("change", (e) => {
				if (isTimeSyncing) return;

				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.padStart(2, "0");
				hourSelect.value = formattedValue;
				isTimeSyncing = true;
				hourSelect.dispatchEvent(new Event("change"));
				isTimeSyncing = false;
			});

			minuteSelect.addEventListener("change", (e) => {
				if (isTimeSyncing) return;

				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.replace(/^0+/, "") || "0";
				topMinuteSelect.value = formattedValue;
				isTimeSyncing = true;
				topMinuteSelect.dispatchEvent(new Event("change"));
				isTimeSyncing = false;
			});

			topMinuteSelect.addEventListener("change", (e) => {
				if (isTimeSyncing) return;

				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.padStart(2, "0");
				minuteSelect.value = formattedValue;
				isTimeSyncing = true;
				minuteSelect.dispatchEvent(new Event("change"));
				isTimeSyncing = false;
			});
		} else {
			console.warn("Ipsos Extension: Could not find top time boxes or time inputs (for syncing).");
		}
	}

	// Copy ID location to clipboard when upload ID button clicked
	if (settings["idLocation.enabled"]) {
		const idLocation = await getSetting("idLocation.value");

		if (idLocation) {
			const idQuestion = questions.find((question) => question.textContent?.trim().startsWith("1,5. "));
			const idUploadButton = idQuestion?.closest("td.surveyquestioncell")?.querySelector("#uploadImgBtn");

			if (idUploadButton) {
				// Copy ID location to clipboard when clicked
				idUploadButton.addEventListener("click", () => {
					navigator.clipboard.writeText(idLocation);
				});
			} else {
				console.warn("Ipsos Extension: Could not find ID upload button.");
			}
		}
	}

	// Auto-fill postcode and address with stored information
	if (settings["address.enabled"]) {
		// Get the saved address value
		const address = await getSetting("address.value");

		// Get the DOM postcode input field
		const postcodeQuestion = questions.find((question) => question.textContent?.trim().startsWith("4.1. "));
		const postcodeTextarea = postcodeQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

		if (postcodeTextarea) {
			// Only set if nothing has been previously entered
			if (!postcodeTextarea.value) postcodeTextarea.value = address.postcode;
		} else {
			console.warn("Ipsos Extension: Could not find postcode text area.");
		}

		// Get the DOM address line input field
		const addressQuestion = questions.find((question) => question.textContent?.trim().startsWith("4.1a. "));
		const addressTextarea = addressQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

		if (addressTextarea) {
			// Only set if nothing has been previously entered
			if (!addressTextarea.value) addressTextarea.value = address.address;
		} else {
			console.warn("Ipsos Extension: Could not find address text area.");
		}
	}

	// Autofill age with stored information
	if (settings["dob.enabled"]) {
		// Get the saved address value
		const dob = new Date(await getSetting("dob.value"));

		// Check the date is valid
		if (!Number.isNaN(dob.getTime())) {
			// Get the DOM age input fields
			const ageYearsQuestion = questionCells.find((question) => question.textContent?.trim().startsWith("2.6.1 "));
			const ageYearsTextarea = ageYearsQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");
			const ageMonthsQuestion = questionCells.find((question) => question.textContent?.trim().startsWith("2.6.2 "));
			const ageMonthsTextarea = ageMonthsQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

			if (ageYearsTextarea && ageMonthsTextarea) {
				// Calculate the difference between now and DOB
				const age = new DateDiff(now, dob);

				if (!ageYearsTextarea.value && !ageMonthsTextarea.value) {
					// Only set if nothing has been previously entered
					ageYearsTextarea.value = String(Math.floor(age.years())).padStart(2, "0");
					ageMonthsTextarea.value = String(Math.floor(age.months()) % 12).padStart(2, "0");
				}
			} else {
				console.warn("Ipsos Extension: Could not find year and/or month age text area.");
			}
		} else {
			console.warn("Ipsos Extension: Auto-fill age is enabled, but DOB is invalid.");
		}
	}
}

awaitForm();
