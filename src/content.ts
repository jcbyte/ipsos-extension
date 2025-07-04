import { waitForElement } from "./util";

async function autofill() {
	// Auto-fill top date and time box with the current time
	const topYearSelect = await waitForElement<HTMLSelectElement>("#dsYear");
	const topMonthSelect = await waitForElement<HTMLSelectElement>("#dsMonth");
	const topDaySelect = await waitForElement<HTMLSelectElement>("#dsDay");
	const topHourSelect = await waitForElement<HTMLSelectElement>("#tsHoursHEAD_TIME");
	const topMinuteSelect = await waitForElement<HTMLSelectElement>("#tsMinutesHEAD_TIME");

	const now = new Date();
	topYearSelect.value = now.getFullYear().toString();
	topMonthSelect.value = now.getMonth().toString();
	topDaySelect.value = (now.getDate() - 1).toString();
	topHourSelect.value = now.getHours().toString();
	topMinuteSelect.value = now.getMinutes().toString();

	// Auto-select yes to confirm information entered is accurate
	const confirmInformationInput = await waitForElement(() => {
		const labels = document.body.querySelectorAll("span.surveyansweroption");

		const targetLabel = Array.from(labels).find(
			(span) => span.textContent?.trim() === "Yes, I understand and all information submitted is correct"
		);

		const targetInput = targetLabel?.parentElement?.querySelector("input");
		return targetInput ?? null;
	});
	confirmInformationInput.click();

	// Auto-fill main date and time box with current time
	// todo
}

autofill();

// todo
// // 0.1 fill date with current
// //; 0.2 fill time with current
// // 1.1 select yes
// 1.2 fill date with current (copy this to 0.1 or vice versa)
// 1.3 fill time with current (copy this to 0.2 or vice versa)
// 1.5 automatically upload id, or link to location may be easier
// 4.1 fill with stored
// 4.1a fill with stored
// 2.6.1 fill with calculated age from stored dob
// 2.6.2 fill with calculated age from stored dob
// todo make this better so it doesn't run sequently and only once
// todo create popup to store data
