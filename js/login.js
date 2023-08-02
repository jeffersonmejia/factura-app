const d = document,
	l = location,
	API = 'http://localhost:3001',
	$errorLogin = d.querySelector('#error-login'),
	$loginButton = d.querySelector('.input-submit')

async function login({ username, password }) {
	const abortController = new AbortController(),
		signal = abortController.signal,
		url = `${API}/login`,
		options = {
			method: 'post',
			signal,
			body: { username, password },
		},
		DEFAULT_BUTTON = $loginButton.value,
		$loader = $loginButton.nextElementSibling,
		$errorMessage = $errorLogin.querySelector('p'),
		MAX_FETCH_TIME = 2000

	$loginButton.value = 'Cargando'
	$loginButton.style.paddingRight = `16px`
	$loader.classList.remove('hidden')
	$loader.classList.add('button-loader')
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
		$loginButton.value = DEFAULT_BUTTON
		$loader.classList.remove('button-loader')
		$errorLogin.classList.remove('hidden')
		$errorMessage.textContent = `${error}`
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
