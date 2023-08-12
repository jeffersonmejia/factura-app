const d = document,
	l = location,
	API = 'http://localhost:3001',
	$errorLogin = d.querySelector('#error-login'),
	$loginButton = d.querySelector('.input-submit'),
	MAX_FETCH_TIME = 2000

async function login({ username, password }) {
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/login`,
		options = {
			method: 'post',
			signal,
			body: { username, password },
		}

	$loginButton.value = 'Ingresando...'
	try {
		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error(
				`Error de respuesta HTTP: ${response.status} ${response.statusText}`
			)
		}
		setTimeout(() => {
			abortController.abort()
			throw new Error('Tiempo de espera excedido')
		}, MAX_FETCH_TIME)
		l.href = 'dashboard.html'
	} catch (error) {
		if (error.message.includes('fetch')) {
			error.message = 'Servicio no disponible, intenta más tarde'
		}
		$errorLogin.textContent = `${error.message}`
		$errorLogin.classList.remove('hidden')
	} finally {
		$loginButton.value = 'Ingresar'
	}
}

d.addEventListener('submit', async (e) => {
	if (e.target.matches('#login-form')) {
		e.preventDefault()

		const inputs = Array.from(e.target.elements)
		const [username, password] = inputs.filter((input) => {
			return input.type === 'text' || input.type === 'password'
		})
		await login({ username, password })
	}
})
