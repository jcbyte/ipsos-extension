import { waitForElement } from "./util";

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

function autofill() {
	const now = new Date();
	const questions = Array.from(document.body.querySelectorAll<HTMLSpanElement>("span.surveyquestion"));

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
	const confirmationQuestion = questions.find((question) => question.textContent?.trim().startsWith("1,1"));
	const confirmationYesInput = confirmationQuestion?.parentElement?.querySelector<HTMLInputElement>('input[value="1"]');

	if (confirmationYesInput) {
		confirmationYesInput.click();
	} else {
		console.warn("Ipsos Extension: Could not confirmation yes radio button.");
	}

	// Auto-fill main date with current date
	const dateQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.2"));
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
	const timeQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.3"));
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

	// Sync changes to top date and time with main date and time
	if (topYearSelect && topMonthSelect && topDaySelect && dateInput) {
	}
}

awaitForm();

// todo
// 1.5 automatically upload id, or link to location may be easier
// 4.1 fill with stored
// 4.1a fill with stored
// 2.6.1 fill with calculated age from stored dob
// 2.6.2 fill with calculated age from stored dob
// todo create popup to store data
