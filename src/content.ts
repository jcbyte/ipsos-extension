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

	// Auto-fill top date and time box with the current time
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
			topMonthSelect.value = now.getMonth().toString();
			topDaySelect.value = (now.getDate() - 1).toString();
		} else {
			console.warn("Ipsos Extension: Could not find top date boxes.");
		}

		if (topHourSelect && topMinuteSelect) {
			topHourSelect.value = now.getHours().toString();
			topMinuteSelect.value = now.getMinutes().toString();
		} else {
			console.warn("Ipsos Extension: Could not find top time boxes.");
		}
	}

	// Auto-select yes to confirm information entered is accurate
	if (settings["agreeAccuracy.enabled"]) {
		const confirmationQuestion = questions.find((question) => question.textContent?.trim().startsWith("1,1. "));
		const confirmationYesInput =
			confirmationQuestion?.parentElement?.querySelector<HTMLInputElement>('input[value="1"]');

		if (confirmationYesInput) {
			confirmationYesInput.click();
		} else {
			console.warn("Ipsos Extension: Could not confirmation yes radio button.");
		}
	}

	// Auto-fill main date and time with current time
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

			dateInput.value = formattedDate;
		} else {
			console.warn("Ipsos Extension: Could not find date input.");
		}

		if (hourSelect && minuteSelect) {
			hourSelect.value = now.getHours().toString().padStart(2, "0");
			minuteSelect.value = now.getMinutes().toString().padStart(2, "0");
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

					topYearSelect.value = year;
					topMonthSelect.value = String(Number(month) - 1);
					topDaySelect.value = String(Number(day) - 1);
				}
			}, 100);

			const updateDateInput = () => {
				const day = String(Number(topDaySelect.value) + 1).padStart(2, "0");
				const month = String(Number(topMonthSelect.value) + 1).padStart(2, "0");
				const year = topYearSelect.value;
				const formattedDate = `${day}/${month}/${year}`;

				dateInput.value = formattedDate;
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
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.replace(/^0+/, "") || "0";
				topHourSelect.value = formattedValue;
			});

			topHourSelect.addEventListener("change", (e) => {
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.padStart(2, "0");
				hourSelect.value = formattedValue;
			});

			minuteSelect.addEventListener("change", (e) => {
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.replace(/^0+/, "") || "0";
				topMinuteSelect.value = formattedValue;
			});

			topMinuteSelect.addEventListener("change", (e) => {
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.padStart(2, "0");
				minuteSelect.value = formattedValue;
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
		const address = await getSetting("address.value");

		const postcodeQuestion = questions.find((question) => question.textContent?.trim().startsWith("4.1. "));
		const postcodeTextarea = postcodeQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

		if (postcodeTextarea) {
			postcodeTextarea.value = address.postcode;
		} else {
			console.warn("Ipsos Extension: Could not find postcode text area.");
		}

		const addressQuestion = questions.find((question) => question.textContent?.trim().startsWith("4.1a. "));
		const addressTextarea = addressQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

		if (addressTextarea) {
			addressTextarea.value = address.address;
		} else {
			console.warn("Ipsos Extension: Could not find address text area.");
		}
	}

	// Autofill age with stored information
	if (settings["dob.enabled"]) {
		const dob = new Date(await getSetting("dob.value"));

		if (!Number.isNaN(dob.getTime())) {
			const ageYearsQuestion = questionCells.find((question) => question.textContent?.trim().startsWith("2.6.1 "));
			const ageYearsTextarea = ageYearsQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");
			const ageMonthsQuestion = questionCells.find((question) => question.textContent?.trim().startsWith("2.6.2 "));
			const ageMonthsTextarea = ageMonthsQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

			if (ageYearsTextarea && ageMonthsTextarea) {
				const age = new DateDiff(now, dob);

				ageYearsTextarea.value = String(Math.floor(age.years())).padStart(2, "0");
				ageMonthsTextarea.value = String(Math.floor(age.months()) % 12).padStart(2, "0");
			} else {
				console.warn("Ipsos Extension: Could not find year and/or month age text area.");
			}
		} else {
			console.warn("Ipsos Extension: Auto-fill age is enabled, but DOB is invalid.");
		}
	}
}

awaitForm();
