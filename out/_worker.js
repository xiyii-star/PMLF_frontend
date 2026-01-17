/**
 * ESA Pages 边缘函数配置
 * 用于反向代理 API 请求到后端服务器
 *
 * 部署说明：
 * 1. 将此文件上传到 ESA Pages 的根目录
 * 2. 在 ESA Pages 控制台配置边缘函数
 * 3. 确保后端服务器 http://47.102.99.87:8000 可访问
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // 如果是 API 请求，转发到后端
  if (url.pathname.startsWith('/api/')) {
    return proxyToBackend(request, url)
  }

  // 如果是 WebSocket 升级请求，转发到后端
  if (request.headers.get('Upgrade') === 'websocket') {
    return proxyToBackend(request, url)
  }

  // 其他请求返回静态文件
  const response = await fetch(request)

  // 如果静态文件不存在（404），返回 index.html（用于 hash 路由）
  if (response.status === 404 && !url.pathname.startsWith('/_next/')) {
    const indexUrl = new URL('/', url.origin)
    return fetch(indexUrl.toString())
  }

  return response
}

async function proxyToBackend(request, url) {
  // 后端服务器地址
  const BACKEND_URL = 'http://47.102.99.87:8000'

  // 构建后端 URL
  const backendUrl = BACKEND_URL + url.pathname + url.search

  // 复制请求头
  const headers = new Headers(request.headers)

  // 添加 X-Forwarded-* 头
  headers.set('X-Forwarded-Host', url.host)
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''))
  headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || '')

  try {
    // 转发请求到后端
    const backendRequest = new Request(backendUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'follow'
    })

    const response = await fetch(backendRequest)

    // 创建新的响应对象
    const newResponse = new Response(response.body, response)

    // 添加 CORS 头（如果后端没有设置）
    if (!newResponse.headers.has('Access-Control-Allow-Origin')) {
      newResponse.headers.set('Access-Control-Allow-Origin', url.origin)
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      newResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return newResponse
  } catch (error) {
    // 返回错误响应
    return new Response(JSON.stringify({
      error: 'Backend connection failed',
      message: error.message,
      backend_url: BACKEND_URL
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': url.origin
      }
    })
  }
}

// 处理 OPTIONS 预检请求
addEventListener('fetch', event => {
  const request = event.request
  if (request.method === 'OPTIONS') {
    event.respondWith(handleOptions(request))
  }
})

function handleOptions(request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  })

  return new Response(null, {
    status: 204,
    headers: headers
  })
}
