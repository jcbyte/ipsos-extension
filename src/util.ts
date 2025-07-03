/**
 * Returns the first element that matches selectors once it appears in the DOM.
 */
export function waitForElement<T extends Element>(selectorFunc: () => T | null): Promise<T> {
	return new Promise((resolve) => {
		// Immediate check
		const el = selectorFunc();
		if (el) return resolve(el);

		// When the DOM is changed check for the element
		const observer = new MutationObserver(() => {
			const el = selectorFunc();
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
