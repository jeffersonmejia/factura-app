function counterMessage({ element, message, maxTime }) {
	let counter = maxTime
	const interval = setInterval(() => {
		element.textContent = `${message}(${counter}s)`
		if (counter === 0) {
			clearInterval(interval)
		}
		counter--
	}, 1000)
}
