const d = document,
	$aside = d.querySelector('aside'),
	$trimestralChart = document.getElementById('trimestral-sells'),
	$main = d.querySelector('main'),
	$errorMessage = d.querySelector('.error-message'),
	API = 'http://localhost:3001'

async function createProductsChart() {
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/dashboard`,
		fetchOptions = { signal },
		MAX_FETCH_TIME = 5000
	try {
		const response = await fetch(url, fetchOptions)
		setTimeout(() => abortController.abort(), MAX_FETCH_TIME)
		if (!response.ok) {
			throw new Error('No pudimos obtener los datos...')
		}

		const json = await response.json(),
			months = json?.products.months

		const labels = Object.keys(months),
			data = Object.values(months),
			label = json?.products.title,
			chartData = { labels, datasets: [{ label, data, borderWidth: 1 }] },
			options = {
				scales: { y: { beginAtZero: true } },
			}

		new Chart($trimestralChart, { type: 'bar', data: chartData, options })
	} catch (error) {
		$errorMessage.textContent = `${error}`
	}
}

d.addEventListener('DOMContentLoaded', async (e) => {
	await createProductsChart()
})
d.addEventListener('click', (e) => {
	if (e.target.matches('.aside-menu-button')) {
		$aside.classList.toggle('hidden')
		e.target.textContent = $aside.classList.contains('hidden') ? 'menu' : 'close'
		$main.style.width = $aside.classList.contains('hidden') ? '100%' : '70%'
	}
	if (e.target.matches('aside li')) {
	}
})
