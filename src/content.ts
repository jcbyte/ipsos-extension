import { waitForElement } from "./util";

async function autofill() {
	// Wait for the correct form to be shown
	await waitForElement(() => {
		const title = document.body.querySelector("h1.surveytitle");
		console.log(title);

		if (title?.textContent?.startsWith("Retail Home Delivery")) {
			return title;
		}

		return null;
	});

	// Once everything is loaded then fill it
	window.addEventListener("load", () => {
		const now = new Date();

		// todo null checking everywhere

		// Auto-fill top date and time box with the current time
		const topYearSelect = document.querySelector<HTMLSelectElement>("#dsYear")!;
		const topMonthSelect = document.querySelector<HTMLSelectElement>("#dsMonth")!;
		const topDaySelect = document.querySelector<HTMLSelectElement>("#dsDay")!;
		const topHourSelect = document.querySelector<HTMLSelectElement>("#tsHoursHEAD_TIME")!;
		const topMinuteSelect = document.querySelector<HTMLSelectElement>("#tsMinutesHEAD_TIME")!;

		topYearSelect.value = now.getFullYear().toString();
		topMonthSelect.value = now.getMonth().toString();
		topDaySelect.value = (now.getDate() - 1).toString();
		topHourSelect.value = now.getHours().toString();
		topMinuteSelect.value = now.getMinutes().toString();

		const questions = Array.from(document.body.querySelectorAll<HTMLSpanElement>("span.surveyquestion"));

		// Auto-select yes to confirm information entered is accurate
		const confirmationQuestion = questions.find((question) => question.textContent?.trim().startsWith("1,1"));
		const confirmationYesInput =
			confirmationQuestion?.parentElement?.querySelector<HTMLInputElement>('input[value="1"]');
		confirmationYesInput?.click();

		// Auto-fill main date with current date
		const dateQuestion = questions.find((question) => question.textContent?.trim().startsWith("1.2"));
		const dateInput = dateQuestion?.parentElement?.querySelector("tbody")?.querySelector("input");

		const day = String(now.getDate()).padStart(2, "0");
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const year = now.getFullYear();
		const formattedDate = `${day}/${month}/${year}`;

		dateInput!.value = formattedDate;
	});
}

autofill();

// todo
// 1.3 fill time with current
// copy date and times across
// 1.5 automatically upload id, or link to location may be easier
// 4.1 fill with stored
// 4.1a fill with stored
// 2.6.1 fill with calculated age from stored dob
// 2.6.2 fill with calculated age from stored dob
// todo make this better so it doesn't run sequently and only once
// todo create popup to store data
