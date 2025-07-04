import { useState } from "preact/hooks";

export default function Popup() {
	const [count, setCount] = useState(0);
	return (
		<div style={{ padding: 20 }}>
			<h1>Hello from Preact Popup!</h1>
			<button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
		</div>
	);
}
