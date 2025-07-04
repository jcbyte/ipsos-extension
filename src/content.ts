import { waitForElement } from "./util";

async function autofill() {
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
		const confirmationYesInput =
			confirmationQuestion?.parentElement?.querySelector<HTMLInputElement>('input[value="1"]');

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
		} else {
			console.warn("Ipsos Extension: Could not find date input.");
		}

		// Auto-fill main time with current time
		const timeQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.3"));
		const timeInputs = timeQuestion?.parentElement
			?.querySelector("tbody")
			?.querySelectorAll<HTMLSelectElement>("select");

		if (timeInputs && timeInputs.length === 2) {
			const hourInput = timeInputs[0];
			const minuteInput = timeInputs[1];

			hourInput.value = now.getHours().toString().padStart(2, "0");
			minuteInput.value = now.getMinutes().toString().padStart(2, "0");
		} else {
			console.warn("Ipsos Extension: Could not find time inputs.");
		}
	});
}

autofill();

// todo
// copy date and times across
// 1.5 automatically upload id, or link to location may be easier
// 4.1 fill with stored
// 4.1a fill with stored
// 2.6.1 fill with calculated age from stored dob
// 2.6.2 fill with calculated age from stored dob
// todo make this better so it doesn't run sequently and only once
// todo create popup to store data
