export const api = {
  	icon: '凵',
	name: 'bucket.do',
	description: 'Cloud Bucket API',
	url: 'https://bucket.do/api',
	type: 'https://apis.do/storage',
	endpoints: {
		list: 'https://bucket.do/list/:prefix',
		read: 'https://bucket.do/read/:idPath',
		write: 'https://bucket.do/write/:url',
		delete: 'https://bucket.do/delete/:idPath',
	},
	site: 'https://bucket.do',
	login: 'https://bucket.do/login',
	signup: 'https://bucket.do/signup',
	repo: 'https://github.com/drivly/bucket.do',
}

export default {
	fetch: async (req, env, ctx) => {
		try {
			// Cant use CTX in local dev, disabling for now
			const { user, origin, requestId, method, body, time, pathSegments, query, hostname } = await env.CTX.fetch(req).then(res => res.json())
			let [action, ...target] = new URL(req.url).pathname.split('/').slice(1)
			let data, length = undefined
			if (action == 'write') {
				// URL is in the format of /write/url.com/to/fetch/filename.mp4
				// We need to extract the URL
				// Remove any query params too
				let url = 'https://' + (!target || target[0] == ':url' ? 'json.fyi/northwind.json' : target.join('/'))
				url = url.split('?')[0]

				const res = await fetch(url)
				length = res.headers.get('content-length')

				// Create our key name from the URL
				const key = query.filename || url.split('//').pop()

				if (length) {
					ctx.waitUntil(env.BUCKET.put(key, res.body, { httpMetadata: res.headers }))
				} else {
					const text = await res.text()
					await env.BUCKET.put(key, text, { httpMetadata: res.headers })
				}

				data = { key, url, length, writen: true }
			}

			if (action == 'read') {
				let url = decodeURI(!target || target[0] == ':url' ? 'json.fyi/northwind.json' : target.join('/'))

				// URL make contain string replacements with a target HTTP URL to fetch.
				// The first segment of the replacement is the field we want to get from the HTTP body.
				// In the example, we want to get `id` from pluck.do
				// e.g. /read/json.fyi/${ data.results.0.id: pluck.do/id/db.do/Customers/0 }

				const matches = url.match(/\$\{(.+?)\}/g)
				if (matches) {
					for (let match of matches) {
						const [key, subreq] = match.replace(/\$\{|\}/g, '').split(':')
						const res = await fetch(`https://` + subreq.trim())
						const json = await res.json()
						const value = key.trim().split('.').reduce((o, i) => o[i], json)
						url = url.replace(match, value)
					}
				}

				const res = await env.BUCKET.get(url)

				if (!res) {
					return new Response(`Not found:\nKey: ${url}`, { status: 404 })
				}

				const headers = new Headers(res.httpMetadata)

				return new Response(res.body, {
					status: 200,
					headers: headers
				})
			}

			if (action == 'list') {
				const res = await env.BUCKET.list({
					prefix: target.join('/'),
					limit: 1000,
					cursor: query.cursor,
				})

				const results = [...res.objects.map(obj => {
					return {key: obj.key, size: obj.size, uploaded: obj.uploaded}
				})]

				data = {
					results,
					has_more: res.truncated,
					links: {
						'next': `https://${hostname}/list/${target.join('/')}?cursor=${res.cursor}`
					}
				}
			}

			if (action == 'delete') {
				data = await env.BUCKET.delete((!target || target[0] == ':url' ? 'json.fyi/northwind.json' : target.join('/')))
			}

			// await env.BUCKET.put(target, res.body, { httpMetadata: res.headers })
			return new Response(JSON.stringify({ api, data, length, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
		} catch (e) {
			return new Response(JSON.stringify({ api, error: e.message, stack: e.stack }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
		}
		
	},
}
