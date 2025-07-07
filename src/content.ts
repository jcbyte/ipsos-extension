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

function selectCalendarDate(date: Date): boolean {
	// Get calendar DOM element
	const calendarPopup = document.querySelector<HTMLDivElement>("#DivCalendar");

	// Get the month and year DOM selects
	const calendarTopBarSelects = calendarPopup?.querySelector(".topTable")?.querySelectorAll("select");
	if (calendarTopBarSelects?.length !== 2) {
		return false;
	}
	const monthSelect = calendarTopBarSelects[0];
	const yearSelect = calendarTopBarSelects[1];

	// Set to wanted month and year and dispatch change events for the form
	monthSelect.selectedIndex = date.getMonth();
	monthSelect.dispatchEvent(new Event("change"));
	yearSelect.value = date.getFullYear().toString();
	yearSelect.dispatchEvent(new Event("change"));

	// Get the day select DOM elements
	const dateSelectArea = calendarPopup?.querySelector<HTMLTableSectionElement>("tbody[data-datepicker='true']");
	// Ensure we only pick days from this month
	const dayButtons = dateSelectArea?.querySelectorAll<HTMLTableCellElement>(
		"td:not(.notCurrentMonthWeekCell):not(.notCurrentMonthWeekEndCell)"
	);
	// Ensure we have the expected number of days
	const expectedDayAmount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	if (dayButtons?.length !== expectedDayAmount) {
		return false;
	}

	// Select the wanted day
	const wantedDayButton = dayButtons[date.getDate() - 1];
	wantedDayButton.click();

	return true;
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
	let topYearSelect: HTMLSelectElement | null = null;
	let topMonthSelect: HTMLSelectElement | null = null;
	let topDaySelect: HTMLSelectElement | null = null;
	let topHourSelect: HTMLSelectElement | null = null;
	let topMinuteSelect: HTMLSelectElement | null = null;

	if (settings["date.enabled"] || settings["syncDate.enabled"]) {
		// Get top date and time DOM selects
		topYearSelect = document.querySelector<HTMLSelectElement>("#dsYear");
		topMonthSelect = document.querySelector<HTMLSelectElement>("#dsMonth");
		topDaySelect = document.querySelector<HTMLSelectElement>("#dsDay");
		topHourSelect = document.querySelector<HTMLSelectElement>("#tsHoursHEAD_TIME");
		topMinuteSelect = document.querySelector<HTMLSelectElement>("#tsMinutesHEAD_TIME");
	}

	if (settings["date.enabled"]) {
		if (topYearSelect && topMonthSelect && topDaySelect) {
			// Only set if nothing has been previously selected
			if (
				topYearSelect.value === now.getFullYear().toString() &&
				topMonthSelect.value === "Month" &&
				topDaySelect.value === "Day"
			) {
				// Set to current date and dispatch change events for the form
				topYearSelect.value = now.getFullYear().toString();
				topYearSelect.dispatchEvent(new Event("change"));
				topMonthSelect.value = now.getMonth().toString();
				topMonthSelect.dispatchEvent(new Event("change"));
				topDaySelect.value = (now.getDate() - 1).toString();
				topDaySelect.dispatchEvent(new Event("change"));
			}
		} else {
			console.warn("Ipsos Extension: Could not find top date boxes.");
		}

		if (topHourSelect && topMinuteSelect) {
			// Only set if nothing has been previously selected
			if (!topHourSelect.value && !topMinuteSelect.value) {
				// Set to current time and dispatch change events for the form
				topHourSelect.value = now.getHours().toString();
				topHourSelect.dispatchEvent(new Event("change"));
				topMinuteSelect.value = now.getMinutes().toString();
				topMinuteSelect.dispatchEvent(new Event("change"));
			}
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
			}
		} else {
			console.warn("Ipsos Extension: Could not find accuracy statement radio buttons.");
		}
	}

	// Auto-fill main date and time with current time
	let dateInput: HTMLInputElement | null = null;
	let hourSelect: HTMLSelectElement | null = null;
	let minuteSelect: HTMLSelectElement | null = null;

	if (settings["date.enabled"] || settings["syncDate.enabled"]) {
		// Get main date DOM input
		const dateQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.2. "));
		dateInput = dateQuestion?.parentElement?.querySelector("tbody")?.querySelector<HTMLInputElement>("input") ?? null;

		// Get main time DOM input
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
			// Only set if nothing has been previously entered
			if (dateInput.value === "DD/MM/YYYY") {
				// Open the calendar input and select the current date
				dateInput.dispatchEvent(new Event("focus"));
				if (!selectCalendarDate(now)) {
					console.warn("Ipsos Extension: Could not find popup calendar elements.");
				}
			}
		} else {
			console.warn("Ipsos Extension: Could not find date input.");
		}

		if (hourSelect && minuteSelect) {
			// Only set if nothing has been previously selected
			if (hourSelect.value === "HH" && minuteSelect.value === "MM") {
				// Set to current time and dispatch change events for the form
				hourSelect.value = now.getHours().toString().padStart(2, "0");
				hourSelect.dispatchEvent(new Event("change"));
				minuteSelect.value = now.getMinutes().toString().padStart(2, "0");
				minuteSelect.dispatchEvent(new Event("change"));
			}
		} else {
			console.warn("Ipsos Extension: Could not find time inputs.");
		}
	}

	// Sync changes with top date and time
	if (settings["syncDate.enabled"]) {
		if (dateInput && topYearSelect && topMonthSelect && topDaySelect) {
			// We have to use a polling method here, as the calender selector updates `dateInput.value` silently
			// By initially setting to this then the function will always run on start (if the main date is set) therefore initially syncing the times.
			let lastDateInputValue = "DD/MM/YYYY"; // dateInput.value
			setInterval(() => {
				if (dateInput.value !== lastDateInputValue) {
					lastDateInputValue = dateInput.value;
					// ? This wont work with polling as this function runs at any time (and not as it is being changed).
					// ? This is fine as the top date inputs prevent looping. This means if the top date
					// ? is set this will update the main box, which this function will then pick up and
					// ? set the top date boxes again to what the user just set. Then the circle ends there.
					// // Do not run if this is being updated from somewhere else
					// if (isTimeSyncing) return;

					// Extract date
					const [day, month, year] = dateInput.value.split("/");

					// Set flag to true to avoid looping
					isTimeSyncing = true;
					// Set top selects to changed date and dispatch change events for the form
					topYearSelect.value = year;
					topYearSelect.dispatchEvent(new Event("change"));
					topMonthSelect.value = String(Number(month) - 1);
					topMonthSelect.dispatchEvent(new Event("change"));
					topDaySelect.value = String(Number(day) - 1);
					topDaySelect.dispatchEvent(new Event("change"));
					// Reset flag
					isTimeSyncing = false;
				}
			}, 100);

			const updateDateInput = () => {
				// Do not run if this is being updated from somewhere else
				if (isTimeSyncing) return;

				// Extract date
				const wantedDate = new Date(
					Number(topYearSelect.value),
					Number(topMonthSelect.value),
					Number(topDaySelect.value) + 1
				);

				// Do not set if it is invalid
				if (Number.isNaN(wantedDate.getTime())) return;

				// Set flag to true to avoid looping
				isTimeSyncing = true;
				// Set main date to changed date and dispatch change events for the form
				dateInput.dispatchEvent(new Event("focus"));
				if (!selectCalendarDate(wantedDate)) {
					console.warn("Ipsos Extension: Could not find popup calendar elements.");
				}
				// Reset flag
				isTimeSyncing = false;
			};

			// Add event listeners when any of the top date selects change to update the main date
			topYearSelect.addEventListener("change", updateDateInput);
			topMonthSelect.addEventListener("change", updateDateInput);
			topDaySelect.addEventListener("change", updateDateInput);
		} else {
			console.warn("Ipsos Extension: Could not find top date boxes or date input (for syncing).");
		}

		// Sync changes with top time
		if (hourSelect && minuteSelect && topHourSelect && topMinuteSelect) {
			// Add event listeners when the main hour select changes to update the top hour
			hourSelect.addEventListener("change", (e) => {
				// Do not run if this is being updated from somewhere else
				if (isTimeSyncing) return;

				// Format hour
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.replace(/^0+/, "") || "0";

				// Set flag to true to avoid looping
				isTimeSyncing = true;
				// Set top hour to changed hour and dispatch change events for the form
				topHourSelect.value = formattedValue;
				topHourSelect.dispatchEvent(new Event("change"));
				// Reset flag
				isTimeSyncing = false;
			});

			// Add event listeners when the top hour select changes to update the main hour
			topHourSelect.addEventListener("change", (e) => {
				// Do not run if this is being updated from somewhere else
				if (isTimeSyncing) return;

				// Format hour
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.padStart(2, "0");

				// Set flag to true to avoid looping
				isTimeSyncing = true;
				// Set main hour to changed hour and dispatch change events for the form
				hourSelect.value = formattedValue;
				hourSelect.dispatchEvent(new Event("change"));
				// Reset flag
				isTimeSyncing = false;
			});

			// Add event listeners when the main minute select changes to update the top minute
			minuteSelect.addEventListener("change", (e) => {
				// Do not run if this is being updated from somewhere else
				if (isTimeSyncing) return;

				// Format minute
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.replace(/^0+/, "") || "0";

				// Set flag to true to avoid looping
				isTimeSyncing = true;
				// Set top minute to changed minute and dispatch change events for the form
				topMinuteSelect.value = formattedValue;
				topMinuteSelect.dispatchEvent(new Event("change"));
				// Reset flag
				isTimeSyncing = false;
			});

			// Add event listeners when the top minute select changes to update the main minute
			topMinuteSelect.addEventListener("change", (e) => {
				// Do not run if this is being updated from somewhere else
				if (isTimeSyncing) return;

				// Format minute
				const newValue = (e.target as HTMLSelectElement).value;
				const formattedValue = newValue.padStart(2, "0");

				// Set flag to true to avoid looping
				isTimeSyncing = true;
				// Set main minute to changed minute and dispatch change events for the form
				minuteSelect.value = formattedValue;
				minuteSelect.dispatchEvent(new Event("change"));
				// Reset flag
				isTimeSyncing = false;
			});

			// Initially sync the time from the main box
			hourSelect.dispatchEvent(new Event("change"));
			minuteSelect.dispatchEvent(new Event("change"));
		} else {
			console.warn("Ipsos Extension: Could not find top time boxes or time inputs (for syncing).");
		}
	}

	// Copy ID location to clipboard when upload ID button clicked
	if (settings["idLocation.enabled"]) {
		// Get the saved id location
		const idLocation = await getSetting("idLocation.value");

		// Only copy if the setting has been set
		if (idLocation) {
			// Get the DOM postcode input field
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
