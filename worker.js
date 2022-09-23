export const api = {
  icon: '凵',
  name: 'bucket.do',
  description: 'Cloud Bucket API',
  url: 'https://bucket.do/api',
  type: 'https://apis.do/storage',
  endpoints: {
    import: 'https://bucket.do/import/:url',
    export: 'https://bucket.do/export/:url',
  },
  site: 'https://bucket.do',
  login: 'https://bucket.do/login',
  signup: 'https://bucket.do/signup',
  repo: 'https://github.com/drivly/bucket.do',
}

export default {
  fetch: async (req, env) => {
    const { user, origin, requestId, method, body, time, pathSegments, query } = await env.CTX.fetch(req).then(res => res.json())
    let [action, target] = pathSegments
    let url = 'https://' + (!target || target == ':url' ? 'json.fyi/northwind.json' : target)
    const res = await fetch(url)
    await env.BUCKET.put(target, res.body)
    return new Response(JSON.stringify({ api, method, url, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  }
}
