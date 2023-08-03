const d = document,
	$aside = d.querySelector('aside'),
	$main = d.querySelector('main'),
	API = 'http://localhost:3001',
	$addProductButton = d.querySelector('#add-products-form .input-submit'),
	$addProductError = d.querySelector('.add-products-error')

async function saveProduct({ code, description, price, available, iva }) {
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/add-products`,
		body = {
			code,
			description,
			price,
			available,
			iva,
		},
		fetchOptions = {
			method: 'POST',
			signal,
			body,
		},
		MAX_FETCH_TIME = 5000
	try {
		const response = await fetch(url, fetchOptions)
		setTimeout(() => abortController.abort(), MAX_FETCH_TIME)
		if (!response.ok) {
			throw new Error('No pudimos obtener los datos...')
		}
	} catch (error) {
		$addProductButton.value = 'Guardar'
		$addProductError.classList.remove('hidden')
		$addProductError.textContent = `${error}`
	}
}

d.addEventListener('keyup', (e) => {
	if (e.target.matches('input')) {
		const $inputGroup = e.target.parentElement,
			input = e.target.value
		if (input.length > 0) {
			$inputGroup.classList.add('input-group-filled')
		} else {
			$inputGroup.classList.remove('input-group-filled')
		}
	}
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

d.addEventListener('submit', async (e) => {
	if (e.target.matches('#add-products-form')) {
		e.preventDefault()
		$addProductButton.value = 'Guardando...'

		const form = Array.from(e.target.elements)
		const inputs = form.filter((el) => el.type === 'text')
		const map = inputs.map((input) => [input.name, input.value])
		const data = Object.fromEntries(map)
		await saveProduct(data)
	}
})
