export function http() {
	const abortController = new AbortController(),
		signal = abortController.signal,
		MAX_FETCH_TIME = 3000

	const get = async ({ url = '', maxFetchTime = MAX_FETCH_TIME }) => {
		setTimeout(() => abortController.abort(), maxFetchTime)
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			signal,
		}
		try {
			const response = await fetch(url, options)
			if (!response.ok) {
				throw new Error('El servidor no ha respondido, vuelve a intentarlo')
			}
			const json = await response.json()
			return { data: json }
		} catch (error) {
			if (error.message.includes('fetch')) {
				error.message = 'Servicio no disponible, intenta más tarde'
			}
			return { error: error.message }
		}
	}
	return { get }
}
