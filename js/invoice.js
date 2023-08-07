const d = document,
	$aside = d.querySelector('aside'),
	$main = d.querySelector('main'),
	API = 'http://localhost:3001',
	$productForm = d.querySelector('.product-data'),
	$clientForm = d.querySelector('.client-data'),
	$billPrint = d.getElementById('bill-print-template').content

function toggleAside(menu) {
	$aside.classList.toggle('hidden')

	if ($aside.classList.contains('hidden')) {
		menu.textContent = 'menu'
	} else {
		menu.textContent = 'close'
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
})
