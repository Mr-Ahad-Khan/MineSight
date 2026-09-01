import http from 'node:http'
import https from 'node:https'

function sendJson(res, statusCode, body) {
  res.status(statusCode).json(body)
}

// Vercel maps /api/* directly to this function. Keeping this as a catch-all
// function (instead of rewriting to another /api URL) avoids route recursion.
export default function apiProxy(req, res) {
  const backendUrl = process.env.BACKEND_URL

  if (!backendUrl) {
    return sendJson(res, 503, {
      message: 'The API service has not been configured. Set BACKEND_URL on the frontend Vercel project.',
    })
  }

  let backend
  try {
    backend = new URL(backendUrl)
  } catch {
    return sendJson(res, 500, { message: 'BACKEND_URL must be a valid public URL.' })
  }

  if (backend.host === req.headers.host) {
    return sendJson(res, 500, {
      message: 'BACKEND_URL cannot point to this frontend deployment. Configure the public backend service URL instead.',
    })
  }

  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path || ''
  const query = new URLSearchParams(req.query)
  query.delete('path')
  const queryString = query.toString()
  const apiPath = `/api/${path}${queryString ? `?${queryString}` : ''}`
  const transport = backend.protocol === 'https:' ? https : http
  const body = ['GET', 'HEAD'].includes(req.method) || req.body == null
    ? undefined
    : JSON.stringify(req.body)
  const headers = {
    accept: req.headers.accept || 'application/json',
    ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}),
    ...(body ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) } : {}),
  }

  const proxyRequest = transport.request({
    protocol: backend.protocol,
    hostname: backend.hostname,
    port: backend.port || undefined,
    method: req.method,
    path: `${backend.pathname.replace(/\/$/, '')}${apiPath}`,
    headers,
  }, (proxyResponse) => {
    res.status(proxyResponse.statusCode || 502)
    Object.entries(proxyResponse.headers).forEach(([name, value]) => {
      if (value !== undefined) res.setHeader(name, value)
    })
    proxyResponse.pipe(res)
  })

  proxyRequest.on('error', () => {
    if (!res.headersSent) {
      sendJson(res, 502, { message: 'Unable to reach the configured API service.' })
    }
  })

  if (body) proxyRequest.write(body)
  proxyRequest.end()
}
