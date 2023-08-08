const d = document,
	$aside = d.querySelector('aside'),
	$main = d.querySelector('main'),
	$settingError = d.querySelector('.setting-error'),
	$settingForm = d.querySelector('.setting-form'),
	$settingLoader = d.querySelector('.loader-box'),
	API = 'http://localhost:3001',
	MAX_FETCH_TIME = 5000

function toggleAside(menu) {
	$aside.classList.toggle('hidden')
	if ($aside.classList.contains('hidden')) {
		menu.textContent = 'menu'
	} else {
		menu.textContent = 'close'
	}
}

async function getSettings() {
	$settingLoader.classList.remove('hidden')
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/settings`,
		fetchOptions = { signal }
	try {
		setTimeout(() => abortController.abort(), MAX_FETCH_TIME)
		const response = await fetch(url, fetchOptions)

		if (!response.ok) {
			throw new Error('No pudimos obtener los datos...')
		}
		const json = await response.json(),
			formArray = Array.from($settingForm)
		console.log(json)
		formArray.forEach((input) => {
			if (input.type === 'text') {
				input.value = json[input.id]
				const parent = input.parentElement
				parent.classList.add('input-group-filled')
			}
		})
		$settingForm.classList.remove('hidden')
	} catch (error) {
		$settingError.textContent = `${error.message}`
		$settingError.classList.remove('hidden')
	} finally {
		$settingLoader.classList.add('hidden')
	}
}

d.addEventListener('DOMContentLoaded', async (e) => {
	await getSettings()
})

d.addEventListener('click', async (e) => {
	if (e.target.matches('.aside-menu-button')) {
		toggleAside(e.target)
	}
})
