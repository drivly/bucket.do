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
    const { user, origin, requestId, method, body, time, pathSegments, query } = await env.CTX.fetch(req).then(res => res.json())
    let [action, ...target] = pathSegments
    let data, url, length = undefined
    if (action == 'import') {
      url = 'https://' + (!target || target[0] == ':url' ? 'json.fyi/northwind.json' : target.join('/'))
      const res = await fetch(url)
      length = res.headers.get('content-length')
      if (length) {
        data = await env.MY_BUCKET.put(target, res.body, { httpMetadata: res.headers })
      } else {
        const text = await res.text()
        await env.BUCKET.put(target, text)
      }
    } else {
      data = await env.BUCKET.list()
    }
    // await env.BUCKET.put(target, res.body, { httpMetadata: res.headers })
    return new Response(JSON.stringify({ api, method, url, data, length, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  }
}
