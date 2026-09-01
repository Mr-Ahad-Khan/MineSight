import https from 'node:https'
import http from 'node:http'

function sendJson(res, statusCode, body) {
  res.status(statusCode).json(body)
}

export default function proxy(req, res) {
  const backendUrl = process.env.BACKEND_URL

  if (!backendUrl) {
    return sendJson(res, 503, {
      message: 'The API service has not been configured.',
    })
  }

  let origin
  try {
    origin = new URL(backendUrl)
  } catch {
    return sendJson(res, 500, { message: 'The API service URL is invalid.' })
  }

  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path || ''
  const query = new URLSearchParams(req.query)
  query.delete('path')
  const queryString = query.toString()
  const apiPath = `/api/${path}${queryString ? `?${queryString}` : ''}`
  const transport = origin.protocol === 'https:' ? https : http

  const headers = { ...req.headers, host: origin.host }
  delete headers['content-length']

  const proxyRequest = transport.request({
    protocol: origin.protocol,
    hostname: origin.hostname,
    port: origin.port || undefined,
    method: req.method,
    path: `${origin.pathname.replace(/\/$/, '')}${apiPath}`,
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
      sendJson(res, 502, { message: 'Unable to reach the API service.' })
    }
  })

  req.pipe(proxyRequest)
}
