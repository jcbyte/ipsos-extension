import { useState } from "preact/hooks";

export default function Popup() {
	const [count, setCount] = useState(0);
	return (
		<div class="p-6">
			<span class="text-red-500">Hello from Preact Popup!</span>
			<button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
		</div>
	);
}

// todo toggle autofill date and time
// todo toggle autofill confirm yes
// todo input id location
// todo input postcode
// todo input address
// todo input age
