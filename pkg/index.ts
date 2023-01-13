
// Path: index.ts
// Generated @ 2023-01-13T18:19:58.825Z

export interface API {
  icon?: string
  name?: string
  description?: string
  url?: string
  type?: string
  endpoints?: object
  site?: string
  login?: string
  signup?: string
  repo?: string
}

export interface User {
  authenticated?: boolean
  plan?: string
  ip?: string
  isp?: string
  flag?: string
  zipcode?: string
  city?: string
  region?: string
  country?: string
  continent?: string
  requestId?: string
  localTime?: string
  timezone?: string
  edgeLocation?: string
  edgeDistanceKilometers?: number
  recentInteractions?: number
  role?: string
}


export interface listResponse {
  status: number
  headers: object
  contentType: string
  body: {
api: API
data: {
  results: undefined[]
  has_more: boolean
  links: {
    next: string
  }
}
user: User
}
}

export interface writeResponse {
  status: number
  headers: object
  contentType: string
  body: {
api: API
data: {
  key: string
  url: string
  length: string
  written: boolean
  tries: number
  timing: {
    fetch: number
    r2: number
  }
}
length: string
user: User
}
}

export interface readResponse {
  status: number
  headers: object
  contentType: string
  body: ArrayBuffer
}

export interface deleteResponse {
  status: number
  headers: object
  contentType: string
  body: {
api: API
data: {
  deleted: number
}
user: User
}
}

class BucketDo {
  apiKey: string
  baseURL: string
  currentChain: object[]

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseURL = `https://bucket.do`
    this.currentChain = []
  }

  async apiRequest(path: string, options: RequestInit = {}) : Promise<any> {
    const resp = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    let body
    let contentType

    if (resp.headers.get('content-type')?.includes('application/json')) {
      body = await resp.json()
      contentType = 'json'
    } else if (resp.headers.get('content-type')?.includes('text/plain')) {
      body = await resp.text()
      contentType = 'text'
    } else {
      body = await resp.arrayBuffer()
      contentType = 'arrayBuffer'
    }

    return {
      status: resp.status,
      headers: Object.fromEntries(resp.headers.entries()),
      contentType: resp.headers.get('content-type'),
      body,
    }
  }

  async next(url: string) : Promise<any> {
    // Fetches the next page of a paginated response
    // This only occurs in a JSON response.

    const resp = await fetch(url, {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    return await resp.json()
  }

  chain(hostname : string, ...args : Array<string>) : any {
    if (typeof this[hostname] === "function") {
      this.currentChain.push({
        hostname: this.baseURL
          .replace("https://", "")
          .replace("/", "")
          .split(".")[0],
        args: [hostname, ...args]
      })
    } else {
      this.currentChain.push({ hostname, args })
    }

    return this
  }

  async execute() : Promise<any> {
    let path = ""
    for (const { hostname, args } of this.currentChain.reverse()) {
      path += `/${hostname}.do${args.map((arg) => `/${arg}`).join("")}`
    }
    const resp = await fetch("https://" + path).then((r) => r.json())
    this.currentChain = []
    return resp
  }

  
  async list(prefix: string, query: object = {}) : Promise<listResponse> {
    let route = '/list/:prefix+'
      .replace(/:([^/]+)/g, (_: string, param: string) : string => {
        return {
          'prefix': prefix
        }[param.replace('+', '').replace('?', '')] || ''
      })
      .replace(/\/$/, '')

    // @ts-ignore
    route = !!query ? route + '?' + new URLSearchParams(query).toString() : route

    return await this.apiRequest(route, {
      method: 'GET',
    })
  }
        

  async write(url: string, query: object = {}) : Promise<writeResponse> {
    let route = '/write/:url+'
      .replace(/:([^/]+)/g, (_: string, param: string) : string => {
        return {
          'url': url
        }[param.replace('+', '').replace('?', '')] || ''
      })
      .replace(/\/$/, '')

    // @ts-ignore
    route = !!query ? route + '?' + new URLSearchParams(query).toString() : route

    return await this.apiRequest(route, {
      method: 'GET',
    })
  }
        

  async read(path: string, query: object = {}) : Promise<readResponse> {
    let route = '/read/:path+'
      .replace(/:([^/]+)/g, (_: string, param: string) : string => {
        return {
          'path': path
        }[param.replace('+', '').replace('?', '')] || ''
      })
      .replace(/\/$/, '')

    // @ts-ignore
    route = !!query ? route + '?' + new URLSearchParams(query).toString() : route

    return await this.apiRequest(route, {
      method: 'GET',
    })
  }
        

  async delete(path: string, query: object = {}) : Promise<deleteResponse> {
    let route = '/delete/:path+'
      .replace(/:([^/]+)/g, (_: string, param: string) : string => {
        return {
          'path': path
        }[param.replace('+', '').replace('?', '')] || ''
      })
      .replace(/\/$/, '')

    // @ts-ignore
    route = !!query ? route + '?' + new URLSearchParams(query).toString() : route

    return await this.apiRequest(route, {
      method: 'GET',
    })
  }
        
}
    