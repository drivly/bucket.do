export const api = {
  	icon: '凵',
	name: 'bucket.do',
	description: 'Cloud Bucket API',
	url: 'https://bucket.do/api',
	type: 'https://apis.do/storage',
	endpoints: {
		list: 'https://bucket.do/list',
		get: 'https://bucket.do/:id',
		import: 'https://bucket.do/import/:url',
		export: 'https://bucket.do/export/:url',
	},
	site: 'https://bucket.do',
	login: 'https://bucket.do/login',
	signup: 'https://bucket.do/signup',
	repo: 'https://github.com/drivly/bucket.do',
}

export default {
	fetch: async (req, env, ctx) => {
		// Cant use CTX in local dev, disabling for now
		const { user, origin, requestId, method, body, time, pathSegments, query, hostname } = await env.CTX.fetch(req).then(res => res.json())
		let [action, ...target] = new URL(req.url).pathname.split('/').slice(1)
		let data, url, length = undefined
		if (action == 'write') {
			// URL is in the format of /import/url.com/to/fetch/filename.mp4
			// We need to extract the URL
			// Remove any query params too
			url = 'https://' + (!target || target[0] == ':url' ? 'json.fyi/northwind.json' : target.join('/'))
			url = url.split('?')[0]

			const res = await fetch(url)
			length = res.headers.get('content-length')

			// Create our key name from the URL
			const key = query.filename || url.split('//').pop()

			if (length) {
				ctx.waitUntil(env.BUCKET.put(key, res.body, { httpMetadata: res.headers }))
				//data = await env.BUCKET.put(target.join('/'), res.body, { httpMetadata: res.headers })
			} else {
				const text = await res.text()
				await env.BUCKET.put(key, text, { httpMetadata: res.headers })
			}

			data = { key, url, length, writen: true }
		}

		if (action == 'read') {
			url = (!target || target[0] == ':url' ? 'json.fyi/northwind.json' : target.join('/'))
			const res = await env.BUCKET.get(url)
			const headers = new Headers(res.httpMetadata)
		
			return new Response(res.body, {
				status: 200,
				headers: headers
			})
		}

		if (action == 'list') {
			const res = await env.BUCKET.list({
				prefix: target.join('/'),
				cursor: query.cursor,
			})

			const results = [...res.objects.map(obj => {
				return {key: obj.key, size: obj.size, uploaded: obj.uploaded}
			})]

			data = {
				results,
				has_more: res.has_more,
				links: {
					'next': `https://${hostname}/list/${target.join('/')}?cursor=${res.nextCursor}`
				}
			}
		}

		if (action == 'delete') {
			data = await env.BUCKET.delete((!target || target[0] == ':url' ? 'json.fyi/northwind.json' : target.join('/')))
		}

		// await env.BUCKET.put(target, res.body, { httpMetadata: res.headers })
		return new Response(JSON.stringify({ api, method, url, data, length, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
	}
}
