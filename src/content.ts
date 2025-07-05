import { waitForElement } from "@/util/util";
import { getSettings } from "./util/storage";

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
		"agreeAccuracy.enabled",
		"idLocation.enabled",
		"address.enabled",
		"dob.enabled",
	]);

	const now = new Date();
	const questions = Array.from(document.body.querySelectorAll<HTMLSpanElement>("span.surveyquestion"));
	const questionCells = Array.from(document.body.querySelectorAll<HTMLTableCellElement>("th.surveyquestioncell"));

	// Auto-fill top date and time box with the current time
	const topYearSelect = document.querySelector<HTMLSelectElement>("#dsYear");
	const topMonthSelect = document.querySelector<HTMLSelectElement>("#dsMonth");
	const topDaySelect = document.querySelector<HTMLSelectElement>("#dsDay");
	const topHourSelect = document.querySelector<HTMLSelectElement>("#tsHoursHEAD_TIME");
	const topMinuteSelect = document.querySelector<HTMLSelectElement>("#tsMinutesHEAD_TIME");

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

	// Auto-select yes to confirm information entered is accurate
	const confirmationQuestion = questions.find((question) => question.textContent?.trim().startsWith("1,1. "));
	const confirmationYesInput = confirmationQuestion?.parentElement?.querySelector<HTMLInputElement>('input[value="1"]');

	if (confirmationYesInput) {
		confirmationYesInput.click();
	} else {
		console.warn("Ipsos Extension: Could not confirmation yes radio button.");
	}

	// Auto-fill main date with current date
	const dateQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.2. "));
	const dateInput = dateQuestion?.parentElement?.querySelector("tbody")?.querySelector<HTMLInputElement>("input");

	if (dateInput) {
		const day = String(now.getDate()).padStart(2, "0");
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const year = now.getFullYear();
		const formattedDate = `${day}/${month}/${year}`;

		dateInput.value = formattedDate;

		// Sync changes with top date
		if (topYearSelect && topMonthSelect && topDaySelect) {
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
		}
	} else {
		console.warn("Ipsos Extension: Could not find date input.");
	}

	// Auto-fill main time with current time
	const timeQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.3. "));
	const timeSelects = timeQuestion?.parentElement
		?.querySelector("tbody")
		?.querySelectorAll<HTMLSelectElement>("select");

	if (timeSelects && timeSelects.length === 2) {
		const hourSelect = timeSelects[0];
		const minuteSelect = timeSelects[1];

		hourSelect.value = now.getHours().toString().padStart(2, "0");
		minuteSelect.value = now.getMinutes().toString().padStart(2, "0");

		// Sync changes with top time
		if (topHourSelect && topMinuteSelect) {
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
		}
	} else {
		console.warn("Ipsos Extension: Could not find time inputs.");
	}

	// Copy ID location to clipboard when upload ID button clicked
	const idLocation = "// todo"; // await get<string>("idLocation");

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

	// Auto-fill postcode with stored information
	const postcode = "// todo"; // await get<string>("postcode");

	if (postcode) {
		const postcodeQuestion = questions.find((question) => question.textContent?.trim().startsWith("4.1. "));
		const postcodeTextarea = postcodeQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

		if (postcodeTextarea) {
			postcodeTextarea.value = postcode;
		} else {
			console.warn("Ipsos Extension: Could not find postcode text area.");
		}
	}

	// Auto-fill address with stored information
	const address = "// todo"; // await get<string>("address");

	if (address) {
		const addressQuestion = questions.find((question) => question.textContent?.trim().startsWith("4.1a. "));
		const addressTextarea = addressQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

		if (addressTextarea) {
			addressTextarea.value = address;
		} else {
			console.warn("Ipsos Extension: Could not find address text area.");
		}
	}

	// Autofill age with stored information
	const dob = new Date(2000, 0, 1); // todo // await get<Date>("dob");

	if (dob) {
		const ageYearsQuestion = questionCells.find((question) => question.textContent?.trim().startsWith("2.6.1 "));
		const ageYearsTextarea = ageYearsQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");
		const ageMonthsQuestion = questionCells.find((question) => question.textContent?.trim().startsWith("2.6.2 "));
		const ageMonthsTextarea = ageMonthsQuestion?.parentElement?.querySelector<HTMLTextAreaElement>("textarea");

		if (ageYearsTextarea && ageMonthsTextarea) {
			let ageYears = now.getFullYear() - dob.getFullYear();
			let ageMonths = now.getMonth() - dob.getMonth();
			if (ageMonths < 0) {
				ageYears--;
				ageMonths += 12;
			}

			ageYearsTextarea.value = String(ageYears).padStart(2, "0");
			ageMonthsTextarea.value = String(ageMonths).padStart(2, "0");
		} else {
			console.warn("Ipsos Extension: Could not find year and/or month age text area.");
		}
	}
}

awaitForm();
