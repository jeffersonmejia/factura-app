const d = document,
	$aside = d.querySelector('aside'),
	$main = d.querySelector('main'),
	API = 'http://localhost:3001',
	$productForm = d.querySelector('.product-data'),
	$clientForm = d.querySelector('.client-data'),
	$productCodeQuery = d.getElementById('product-code-query'),
	$billPrint = d.getElementById('bill-print-template').content,
	MAX_FETCH_TIME = 5000

function toggleAside(menu) {
	$aside.classList.toggle('hidden')

	if ($aside.classList.contains('hidden')) {
		menu.textContent = 'menu'
	} else {
		menu.textContent = 'close'
	}
}

async function queryProductByCode(code) {
	const $oldQueries = $productCodeQuery.querySelectorAll('p')
	$oldQueries.forEach((el) => {
		$productCodeQuery.removeChild(el)
	})
	$productCodeQuery.classList.remove('hidden')

	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/products?code=${code}`,
		fetchOptions = {
			signal,
		}
	setTimeout(() => abortController.abort(), MAX_FETCH_TIME)
	try {
		const response = await fetch(url, fetchOptions)
		if (!response.ok) {
			throw new Error('No pudimos obtener los datos...')
		}
		const json = await response.json(),
			$fragment = d.createDocumentFragment()

		if (json.length < 1) throw new Error('No se encontraron resultados')
		json.forEach((el) => {
			const item = d.createElement('p')
			item.textContent = el.code
			$fragment.appendChild(item)
		})
		$productCodeQuery.appendChild($fragment)
	} catch (error) {
		const $error = d.createElement('p')
		$error.dataset.notFound = 'true'
		$error.textContent = `${error.message}`
		$productCodeQuery.appendChild($error)
	}
}
async function fillFormByCode(code) {
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/products?code=${code}`,
		fetchOptions = {
			signal,
		}
	setTimeout(() => abortController.abort(), MAX_FETCH_TIME)
	try {
		const response = await fetch(url, fetchOptions)
		if (!response.ok) {
			throw new Error('No pudimos obtener los datos...')
		}
		const json = await response.json(),
			product = json[0],
			inputs = $productForm.querySelectorAll('input[type="text"]')

		inputs.forEach((input) => {
			console.log(input)
			const id = input.id.split('-')[1]
			console.log(id)
		})
	} catch (error) {
		console.log(error)
	}
}
d.addEventListener('click', async (e) => {
	if (e.target.matches('.aside-menu-button')) {
		toggleAside(e.target)
	}
	if (e.target.matches('#product-submit')) {
		e.preventDefault()
		$productForm.style.opacity = 0
		$clientForm.opacity = 0
		setTimeout(() => {
			$productForm.classList.add('hidden')
		}, 200)
		setTimeout(() => {
			$clientForm.classList.remove('hidden')
			$clientForm.opacity = 1
		}, 300)
	}
	if (e.target.matches('#cancel-bill-button')) {
		$clientForm.opacity = 0
		setTimeout(() => {
			$clientForm.classList.add('hidden')
		}, 200)
		setTimeout(() => {
			$productForm.classList.remove('hidden')
			$productForm.style.opacity = 1
		}, 300)
	}
	if (e.target.matches('.shopping-bill button')) {
		$shoppingBill.classList.add('hidden')
		$clientForm.classList.add('hidden')
		$productForm.classList.remove('hidden')
		$productForm.style.opacity = 1
	}
	if (e.target.matches('#print-bill-button')) {
		e.preventDefault()
		const $clone = $billPrint.cloneNode(true),
			title = 'Imprimir factura',
			url = '',
			size = 'width=800, height=800',
			printWindow = window.open(url, title, size),
			windowBody = printWindow.document.body

		windowBody.style.fontFamily = 'Arial, Helvetica, sans-serif'
		windowBody.appendChild($clone)
		printWindow.document.title = `Almacenes xxx - Factura 000 000 xxx`
		printWindow.print()
	}
	if (e.target.matches('#product-code-query p')) {
		const isNotFound = e.target.dataset.notFound
		if (!isNotFound) {
			await fillFormByCode(e.target.textContent)
		}
	}
})

d.addEventListener('keyup', async (e) => {
	if (e.target.matches('#product-code')) {
		await queryProductByCode(e.target.value)
		const parent = e.target.parentElement
		if (e.target.value.length > 0) {
			parent.classList.add('input-group-filled')
		} else {
			parent.classList.remove('input-group-filled')
			$productCodeQuery.classList.add('hidden')
		}
	}
})
