import { http } from './lib/http.js'

const d = document,
	l = location,
	API = 'http://localhost:3001',
	$errorLogin = d.querySelector('#error-login'),
	$loginButton = d.querySelector('.input-submit')

async function login({ username, password }) {
	const url = `${API}/login`,
		body = { username, password }

	$loginButton.value = 'Ingresando...'
	try {
		const response = await http().post({ url, body })
		if (!response.ok) {
			throw new Error('Usuario o clave incorrecta')
		}
		await getSettings()
	} catch (error) {
		$errorLogin.textContent = error.message
		$errorLogin.classList.remove('hidden')
	} finally {
		$loginButton.value = 'Ingresar'
	}
}

async function getSettings() {
	const url = `${API}/settings`
	try {
		const response = await http().get({ url })
		if (!response.data) {
			throw new Error('Servicio no disponible, intenta más tarde')
		}
		let settings = response.data
		if (!settings) {
			throw new Error('Advertencia: Las configuraciones no cargaron correctamente')
		}
		settings = JSON.stringify(settings)
		localStorage.setItem('settings', settings)
	} catch (error) {
		$errorLogin.textContent = error.message
		if (error.message.includes('configuraciones')) {
			alert(error.message)
		}
	} finally {
		l.href = 'dashboard.html'
	}
}

d.addEventListener('click', async (e) => {
	if (e.target.matches('#login-submit')) {
		e.preventDefault()
		const parent = e.target.parentElement,
			form = parent.parentElement
		let username = form.querySelector('input[type="text"]')
		let password = form.querySelector('input[type="password"]')
		username = username.value
		password = password.value
		await login({ username, password })
	}
})
