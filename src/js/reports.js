import { http } from './lib/http.js'

const d = document,
	$aside = d.querySelector('aside'),
	API = 'http://localhost:3001',
	$productForm = d.querySelector('.product-data'),
	$clientForm = d.querySelector('.client-data'),
	$productCodeQuery = d.getElementById('product-code-query'),
	$productDescriptionQuery = d.getElementById('product-description-query'),
	$clientDNIQuery = d.getElementById('client-dni-query'),
	$addProductButton = d.getElementById('add-product-button'),
	MAX_FETCH_TIME = 5000,
	$tableProducts = d.querySelector('.table-products'),
	$tableProductsList = d.querySelector('.table-products tbody')

let billData = null,
	listProducts = [],
	counterProducts = 0,
	queryProductsName = null

function toggleAside(menu) {
	$aside.classList.toggle('hidden')

	if ($aside.classList.contains('hidden')) {
		menu.textContent = 'menu'
	} else {
		menu.textContent = 'close'
	}
}

function removeCodeQueries() {
	const $queries = $productCodeQuery.querySelectorAll('p')
	$queries.forEach((query) => {
		$productCodeQuery.removeChild(query)
	})
	$productCodeQuery.classList.remove('hidden')
}

async function queryProductByCode(code) {
	const url = `${API}/products?code=${code}`
	removeCodeQueries()
	try {
		const response = await http().get({ url })
		if (response.data) {
			const products = response.data,
				$fragment = d.createDocumentFragment()
			if (products.length < 1) {
				throw new Error('No se encontraron coincidencias')
			}
			products.forEach((product) => {
				const item = d.createElement('p')
				item.textContent = product.code
				$fragment.appendChild(item)
			})
			$productCodeQuery.appendChild($fragment)
		}
	} catch (error) {
		removeCodeQueries()
		const $error = d.createElement('p')
		$error.dataset.notFound = 'true'
		$error.textContent = `${error.message}`
		$productCodeQuery.appendChild($error)
	}
}

function removeNameQueries() {
	const $queries = $productDescriptionQuery.querySelectorAll('p')
	$queries.forEach((query) => {
		$productDescriptionQuery.removeChild(query)
	})
	$productDescriptionQuery.classList.remove('hidden')
}

async function queryProductByName(name) {
	const url = `${API}/products`
	removeNameQueries()
	try {
		if (!queryProductsName) {
			queryProductsName = await http().get({ url })
		}
		const response = queryProductsName
		if (response.error) {
			throw new Error(response.error)
		}
		let products = response.data
		const $fragment = d.createDocumentFragment()
		products = products.filter((product) => {
			let description = product.description
			description = description.toLowerCase()
			name = name.toLowerCase()
			if (description.includes(name)) {
				return product
			}
		})
		if (!products?.length > 0) {
			throw new Error('No se encontraron coincidencias')
		}
		products = products.sort((a, b) => {
			return a.description.localeCompare(b.description)
		})
		products.forEach((product) => {
			const item = d.createElement('p')
			item.textContent = product.description
			$fragment.appendChild(item)
		})
		$productDescriptionQuery.appendChild($fragment)
	} catch (error) {
		removeNameQueries()
		const $error = d.createElement('p')
		$error.dataset.notFound = 'true'
		$error.textContent = error.message
		$productDescriptionQuery.appendChild($error)
	}
}
async function queryClientByDNI(dni) {
	const $oldQueries = $clientDNIQuery.querySelectorAll('p')
	$oldQueries.forEach((el) => {
		$clientDNIQuery.removeChild(el)
	})
	$clientDNIQuery.classList.remove('hidden')

	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/clients?dni=${dni}`,
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
			item.textContent = el.dni
			$fragment.appendChild(item)
		})
		$clientDNIQuery.appendChild($fragment)
	} catch (error) {
		if (error.message.includes('fetch')) {
			error.message = 'Servidor no disponible, intenta más tarde'
		}
		const $oldQueries = $clientDNIQuery.querySelectorAll('p')
		$oldQueries.forEach((el) => {
			$clientDNIQuery.removeChild(el)
		})
		const $error = d.createElement('p')
		$error.dataset.notFound = 'true'
		$error.textContent = `${error.message}`
		$clientDNIQuery.appendChild($error)
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
			inputs = $productForm.querySelectorAll(
				'input[type="text"]:not([id="product-amount"])'
			)

		inputs.forEach((input) => {
			const id = input.id.split('-')[1],
				parent = input.parentElement
			if (product[id]) {
				input.value = product[id]
				input.parentElement.classList.add('input-group-filled')
			}
		})
		$productCodeQuery.classList.add('hidden')
	} catch (error) {
		console.log(error)
	}
}

async function fillFormByName(name) {
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/products?description=${name}`,
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
			inputs = $productForm.querySelectorAll(
				'input[type="text"]:not([id="product-amount"])'
			)

		inputs.forEach((input) => {
			const id = input.id.split('-')[1]
			if (product[id]) {
				input.value = product[id]
				input.parentElement.classList.add('input-group-filled')
			}
		})
		$productDescriptionQuery.classList.add('hidden')
	} catch (error) {
		console.log(error)
	}
}
async function fillFormByDNI(dni) {
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/clients?dni=${dni}`,
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
			client = json[0],
			inputs = $clientForm.querySelectorAll('input[type="text"]')

		inputs.forEach((input) => {
			const id = input.id.split('-')[1]
			if (client[id]) {
				input.value = client[id]
				input.parentElement.classList.add('input-group-filled')
			}
		})
		$clientDNIQuery.classList.add('hidden')
	} catch (error) {
		console.log(error)
	}
}

function submitProduct() {
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

function cancelBill() {
	listProducts = []
	$addProductButton.textContent = 'Agregar productos'
	$clientForm.opacity = 0
	setTimeout(() => {
		$clientForm.classList.add('hidden')
	}, 200)
	setTimeout(() => {
		$productForm.classList.remove('hidden')
		$productForm.style.opacity = 1
	}, 300)
}

function addProductTable(totalProductsButton) {
	const inputs = $productForm.querySelectorAll('input[type="text"]'),
		array = Array.from(inputs)

	let products = array.map((input) => {
		const id = input.id.split('-')[1]
		return [id, input.value]
	})
	products = products.filter((el) => el !== null)

	products = Object.fromEntries(products)
	listProducts.push(products)
	const product = products

	const $row = d.createElement('tr'),
		$code = d.createElement('td'),
		$description = d.createElement('td'),
		$price = d.createElement('td'),
		$amount = d.createElement('td'),
		$delete = d.createElement('td'),
		$deleteText = d.createElement('span')

	$code.textContent = product.code
	$description.textContent = product.description
	$price.textContent = product.price
	$amount.textContent = product.amount

	$deleteText.classList.add('material-symbols-outlined')
	$delete.classList.add('delete-td')

	$deleteText.textContent = 'delete'
	$deleteText.dataset.code = product.code
	$deleteText.id = 'delete-product-table'

	$delete.appendChild($deleteText)
	$row.appendChild($code)
	$row.appendChild($description)
	$row.appendChild($price)
	$row.appendChild($amount)
	$row.appendChild($delete)
	$tableProductsList.appendChild($row)
	$tableProducts.classList.remove('hidden')
	counterProducts++
	totalProductsButton.textContent = `Agregar producto (+${listProducts.length})`
}

function deleteProductTable(code, $row) {
	const update = listProducts.filter((product) => {
		return product.code !== code
	})
	listProducts = update
	counterProducts--
	if (counterProducts > 0) {
		$addProductButton.textContent = `Agregar producto (${counterProducts})`
	} else {
		$tableProducts.classList.add('hidden')
		$addProductButton.textContent = 'Agregar producto'
	}
	$row.remove()
}

function getClientData(form) {
	const inputs = form.querySelectorAll('input[type="text"]'),
		array = Array.from(inputs)
	let client = array.map((input) => {
		const id = input.id.split('-')[1]
		return [id, input.value]
	})
	client = client.filter((el) => el !== undefined)
	client = Object.fromEntries(client)
	return client
}

function getEnterpriseData() {
	const settings = localStorage.getItem('settings')
	if (!settings) return null
	return JSON.parse(settings)
}

function fillEnterprise(itemsEnterprise) {
	itemsEnterprise.forEach((item) => {
		if (item.id.includes('ruc')) {
			item.textContent += billData.enterprise.RUC
		}
		if (item.id.includes('name')) {
			item.textContent = billData.enterprise.enterprise
		}
		if (item.id.includes('matrix')) {
			item.textContent += billData.enterprise.matrix
		}
		if (item.id.includes('phone')) {
			item.textContent += billData.enterprise.phone
		}
		if (item.id.includes('sucursal')) {
			item.textContent += billData.enterprise.sucursal_city
		}
		if (item.id.includes('address')) {
			item.textContent = billData.enterprise.sucursal_street
		}
	})
}
function fillClient(items, isFinalConsumer) {
	items.forEach((item) => {
		const id = item.id.split('-')[1]
		if (!isFinalConsumer) {
			item.textContent += ` ${billData.client[id]}`
		} else {
			if (item.id.includes('dni')) {
				item.textContent += '9999999999'
			}
			if (item.id.includes('name')) {
				item.textContent += 'CONSUMIDOR FINAL'
			}
		}
	})
}

function fillProducts(products) {
	const $fragment = d.createDocumentFragment()
	products.forEach((el) => {
		const box = d.createElement('p'),
			detail = d.createElement('span'),
			totalPrice = el.price * el.amount

		detail.textContent = `${el.description} ${el.amount} ${el.price} ${totalPrice.toFixed(
			1
		)}`
		box.appendChild(detail)
		$fragment.append(box)
	})
	return $fragment
}
function showPrinter($clone) {
	const title = 'Imprimir factura',
		url = '',
		size = 'width=800, height=800',
		printWindow = window.open(url, title, size),
		windowBody = printWindow.document.body

	windowBody.style.fontFamily = 'Arial, Helvetica, sans-serif'
	windowBody.appendChild($clone)
	printWindow.document.title = `Almacenes xxx - Factura 000 000 xxx`
	printWindow.print()
}

async function printBill(form) {
	const $clone = $billPrint.cloneNode(true),
		client = getClientData(form),
		enterprise = getEnterpriseData(),
		items = $clone.querySelectorAll('[id^="print-"]'),
		$listProductsPrint = $clone.getElementById('print-list-products'),
		$fragment = fillProducts(listProducts),
		isFinalConsumer = client.dni.length < 1

	let itemsEnterprise = $clone.querySelectorAll('[id^="enterprise-"]')
	itemsEnterprise = Array.from(itemsEnterprise)

	billData = { billNumber: 1, enterprise, client, products: listProducts }

	fillEnterprise(itemsEnterprise)
	fillClient(items, isFinalConsumer)
	$listProductsPrint.appendChild($fragment)
	const isRegistered = await registerBill()
	if (isRegistered) {
		showPrinter($clone)
	} else {
		alert('Error, la factura no se procesó correctamente')
	}
}

async function registerBill() {
	const url = `${API}/bills`,
		body = billData
	try {
		const response = await http().post({ url, body })
		return response.ok
	} catch (error) {
		return false
	} finally {
		billData = null
	}
}

d.addEventListener('click', async (e) => {
	if (e.target.matches('.aside-menu-button')) {
		toggleAside(e.target)
	}
	if (e.target.matches('#product-submit')) {
		e.preventDefault()
		submitProduct()
	}
	if (e.target.matches('#cancel-bill-button')) {
		cancelBill()
	}
	if (e.target.matches('#add-product-button')) {
		e.preventDefault()
		addProductTable(e.target)
	}
	if (e.target.matches('#print-bill-button')) {
		e.preventDefault()
		const parent = e.target.parentElement,
			form = parent.parentElement
		await printBill(form)
	}
	if (e.target.matches('#product-code-query p')) {
		const isNotFound = e.target.dataset.notFound
		if (!isNotFound) {
			await fillFormByCode(e.target.textContent)
		}
	}
	if (e.target.matches('#product-description-query p')) {
		const isNotFound = e.target.dataset.notFound
		if (!isNotFound) {
			await fillFormByName(e.target.textContent)
		}
	}
	if (e.target.matches('#client-dni-query p')) {
		const isNotFound = e.target.dataset.notFound
		if (!isNotFound) {
			await fillFormByDNI(e.target.textContent)
		}
	}
	if (e.target.matches('#delete-product-table')) {
		const code = e.target.dataset.code,
			$parent = e.target.parentElement,
			$row = $parent.parentElement
		deleteProductTable(code, $row)
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
	if (e.target.matches('#product-description')) {
		await queryProductByName(e.target.value)
		const parent = e.target.parentElement
		if (e.target.value.length > 0) {
			parent.classList.add('input-group-filled')
		} else {
			parent.classList.remove('input-group-filled')
			$productDescriptionQuery.classList.add('hidden')
		}
	}
	if (e.target.matches('#client-dni')) {
		await queryClientByDNI(e.target.value)
		const parent = e.target.parentElement
		if (e.target.value.length > 0) {
			parent.classList.add('input-group-filled')
		} else {
			parent.classList.remove('input-group-filled')
			$clientDNIQuery.classList.add('hidden')
		}
	}
	if (e.target.matches('input')) {
		if (e.target.value.length > 0) {
			const parent = e.target.parentElement
			parent.classList.add('input-group-filled')
		}
	}
})
