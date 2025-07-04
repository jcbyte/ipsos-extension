/**
 * Waits for a DOM element to appear in the document, either by selector string or selector function.
 *
 * @template T - The type of the element we are wait for.
 * @param {string | (() => T | null)} selector - A CSS selector string or a function returning the desired element.
 *   - If a string is provided, it uses `document.querySelector` on document changes to search for the element.
 *   - If a function is provided, it will call the function on document changes until it returns a non-null element.
 * @returns {Promise<T>} A promise that resolves with the element once it is found in the DOM.
 */
export function waitForElement<T extends Element>(selector: string): Promise<T>;
export function waitForElement<T extends Element>(selectorFunc: () => T | null): Promise<T>;
export function waitForElement<T extends Element>(selector: string | (() => T | null)): Promise<T> {
	const getElement = typeof selector === "string" ? () => document.querySelector<T>(selector) : selector;

	return new Promise((resolve) => {
		// Immediate check
		const el = getElement();
		if (el) return resolve(el);

		// When the DOM is changed check for the element
		const observer = new MutationObserver(() => {
			const el = getElement();
			// If it now exists then resolve
			if (el) {
				observer.disconnect();
				resolve(el);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
