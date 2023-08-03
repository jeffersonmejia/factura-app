const d = document,
	$aside = d.querySelector('aside'),
	$main = d.querySelector('main'),
	API = 'http://localhost:3001',
	$addProductTitle = d.querySelector('.add-products-form h3'),
	$addProductInputs = d.querySelectorAll('.add-products-form input'),
	$addProductButton = d.querySelector('#add-products-form .input-submit'),
	$addProductError = d.querySelector('.add-products-error'),
	$tableProductsBox = d.querySelector('.table-products'),
	$tableProducts = d.querySelector('.table-products tbody'),
	$productTemplate = d.querySelector('#product-template').content,
	$tableError = d.querySelector('.table-error'),
	$totalTable = d.querySelector('.total-table'),
	$tableLoader = d.querySelector('.loader-box'),
	$tableLoaderText = d.querySelector('.loader-box small'),
	$ivaCalculation = d.getElementById('product-iva'),
	$productPagination = d.querySelector('.products-pagination'),
	MAX_FETCH_TIME = 5000,
	MAX_PAGE_PRODUCTS = 8

async function saveProduct({ id = null, code, description, price, available, iva }) {
	const abortController = new AbortController(),
		signal = abortController.signal

	let url = `${API}/products`,
		body = {
			code,
			description,
			price: parseFloat(price).toFixed(1),
			available,
			iva,
		},
		fetchOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal,
		}
	setTimeout(() => abortController.abort(), MAX_FETCH_TIME)
	try {
		if (id) {
			url = `${url}/${id}`
			fetchOptions.method = 'PUT'
			let confirm = window.confirm('¿Estás seguro?')
			if (!confirm) throw new Error('Actualización cancelada, ningún cambio fue guardado')
		}
		const response = await fetch(url, fetchOptions)
		if (!response.ok) {
			throw new Error('El producto no ha sido guardado, intenta más tarde')
		}
		$addProductButton.value = 'Guardado con éxito'
	} catch (error) {
		console.log({ error }, { url })
		if (error.message.includes('fetch')) {
			error.message =
				'Servidor no disponible, el producto no ha sido guardado, intenta más tarde'
		}

		$addProductButton.value = 'Guardar'
		$addProductError.classList.remove('hidden')
		$addProductError.textContent = error.message
	}
}
function getLimitedProducts(data, max) {
	const $fragment = d.createDocumentFragment()
	for (let i = 0; i < data.length; i++) {
		const product = data[i]
		const $clone = $productTemplate.cloneNode(true),
			number = $clone.querySelector('.number'),
			code = $clone.querySelector('.code'),
			description = $clone.querySelector('.description'),
			price = $clone.querySelector('.price'),
			available = $clone.querySelector('.available'),
			iva = $clone.querySelector('.iva')

		number.textContent = i + 1
		code.textContent = product.code
		code.id = product.id
		description.textContent = product.description
		price.textContent = product.price
		available.textContent = product.available
		iva.textContent = product.iva
		$fragment.appendChild($clone)
		if (i === max) break
	}
	return $fragment
}
async function getProducts() {
	$tableLoader.classList.remove('hidden')
	$tableLoaderText.textContent = 'Obtenido productos...'

	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/products`

	const fetchOptions = {
		method: 'GET',
		signal,
	}
	setTimeout(() => abortController.abort(), MAX_FETCH_TIME)

	try {
		const response = await fetch(url, fetchOptions),
			json = await response.json()

		if (!response.ok) {
			throw new Error('No pudimos obtener los datos...')
		}
		const $paginationFragment = d.createDocumentFragment()

		let itemsPerPage = Math.floor(json.length / MAX_PAGE_PRODUCTS)

		const $fragment = getLimitedProducts(json, MAX_PAGE_PRODUCTS - 1)
		$tableProducts.appendChild($fragment)
		$tableProductsBox.classList.remove('hidden')

		for (let i = 1; i <= itemsPerPage; i++) {
			const $pageItem = d.createElement('div')
			$pageItem.textContent = i
			$pageItem.classList.add('page-item')
			$paginationFragment.appendChild($pageItem)
		}
		$productPagination.appendChild($paginationFragment)
	} catch (error) {
		$tableError.classList.remove('hidden')
		if (error.message.includes('fetch')) {
			error.message = 'Servidor no disponible. No hemos podido obtener los datos'
		}
		$tableError.textContent = error.message
	} finally {
		$tableLoader.classList.add('hidden')
		$tableLoaderText.textContent = ''
	}
}

function toggleAside(menu) {
	$aside.classList.toggle('hidden')

	if ($aside.classList.contains('hidden')) {
		menu.textContent = 'menu'
		$main.style.width = '100%'
	} else {
		menu.textContent = 'close'
		$main.style.width = '70%'
	}
}
function updateProduct(rowProduct) {
	$addProductTitle.textContent = 'Actualizar producto'
	const $td = rowProduct.querySelectorAll('td'),
		array = Array.from($td)

	let id = null
	const map = array.map((el, index) => {
		if (index === 1) id = el.id
		if (index > 0 && index < 6) {
			return [el.className, el.textContent]
		}
	})
	const filter = map.filter((el) => el !== undefined)
	const data = Object.fromEntries(filter)
	data.id = id
	const keys = Object.keys(data)
	const inputsArray = Array.from($addProductInputs)
	const inputs = inputsArray.filter((el) => {
		return el.type === 'text'
	})
	inputs.forEach((input) => {
		keys.find((el) => {
			if (input.id.includes(el)) {
				input.value = data[el] || ''
				if (input.id === 'product-code') {
					input.dataset['id'] = data.id
				}

				if (input.value.length > 0) {
					input.parentElement.classList.add('input-group-filled')
				} else {
					input.parentElement.classList.remove('input-group-filled')
				}
			}
		})
	})
	$addProductButton.value = 'Actualizar'
}
async function deleteProduct(id) {
	const abortController = new AbortController(),
		signal = abortController.signal

	let url = `${API}/products/${id}`,
		fetchOptions = { method: 'DELETE' }
	try {
		const response = await fetch(url, fetchOptions)

		if (!response.ok) {
			throw new Error('Servidor no disponible, los cambios no fueron efectuados')
		}
	} catch (error) {
		console.log(error)
	}
}

d.addEventListener('DOMContentLoaded', async (e) => {
	await getProducts()
})
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
	if (e.target.id === 'product-price') {
		const IVA = 0.12
		const productIva = (e.target.value * IVA).toFixed(1)
		$ivaCalculation.value = productIva
	}
})
d.addEventListener('click', async (e) => {
	if (e.target.matches('.aside-menu-button')) {
		toggleAside(e.target)
	}
	if (e.target.matches('.tr-edit span')) {
		const $row = e.target.parentElement.parentElement
		updateProduct($row)
	}
	if (e.target.matches('.tr-delete span')) {
		const $row = e.target.parentElement.parentElement

		const id = $row.querySelector('.code').id
		console.log(id)
		const confirm = window.confirm('¿Estás seguro?')
		if (confirm) {
			await deleteProduct(id)
		}
	}
})
d.addEventListener('submit', async (e) => {
	if (e.target.matches('#add-products-form')) {
		e.preventDefault()

		$addProductButton.value = 'Guardando...'
		const form = Array.from(e.target.elements)
		let id = null
		const inputs = form.filter((el) => {
			if (el.type === 'text') {
				if (el.dataset.id) {
					id = el.dataset.id
				}
				return el
			}
		})
		const map = inputs.map((input) => [input.name, input.value])
		const data = Object.fromEntries(map)
		if (id) {
			data.id = id
		}
		await saveProduct(data)
	}
})
