import http from 'node:http';
import { URL } from 'node:url';
import { TrendyolClient } from 'trendyol-satici-api';

const PORT = Number(process.env.CLINIGA_TRENDYOL_BRIDGE_PORT || 8010);
const supplierId = process.env.TRENDYOL_SUPPLIER_ID || '';
const apiKey = process.env.TRENDYOL_API_KEY || '';
const apiSecret = process.env.TRENDYOL_API_SECRET || '';
const environment = process.env.TRENDYOL_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production';
const approvalToken = process.env.CLINIGA_COMMERCE_APPROVAL_TOKEN || '';

const configured = Boolean(supplierId && apiKey && apiSecret);
const client = configured
  ? new TrendyolClient({
      supplierId,
      apiKey,
      apiSecret,
      environment,
      timeout: 30000,
      retry: { maxRetries: 2 },
      rateLimiting: true,
    })
  : null;

function send(res, status, payload) {
  const data = Buffer.from(JSON.stringify(payload));
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': data.length,
    'cache-control': 'no-store',
  });
  res.end(data);
}

async function bodyJson(req, maxBytes = 2_000_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('request body too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function requireConfigured(res) {
  if (!client) {
    send(res, 503, { error: 'Trendyol bridge is not configured' });
    return false;
  }
  return true;
}

function requireApproval(req, res) {
  const supplied = String(req.headers['x-cliniga-approval'] || '');
  if (!approvalToken || supplied !== approvalToken) {
    send(res, 403, { error: 'Explicit commerce approval is required' });
    return false;
  }
  return true;
}

function safeError(error) {
  const message = error instanceof Error ? error.message : 'upstream request failed';
  return message.replace(/(api[_-]?key|api[_-]?secret|authorization)\s*[:=]\s*\S+/gi, '$1=[redacted]').slice(0, 500);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      return send(res, 200, { status: 'ok', configured, environment });
    }

    if (!requireConfigured(res)) return;

    // Read-only endpoints can be used for analysis without a write approval token.
    if (req.method === 'GET' && url.pathname === '/origins') {
      return send(res, 200, { data: await client.getOrigins() });
    }

    if (req.method === 'GET' && url.pathname === '/orders') {
      const days = Math.max(1, Math.min(30, Number(url.searchParams.get('days') || 7)));
      return send(res, 200, { data: await client.getRecentOrders(days), days });
    }

    if (req.method === 'GET' && url.pathname === '/product-videos') {
      const barcode = String(url.searchParams.get('barcode') || '').trim();
      if (!barcode) return send(res, 400, { error: 'barcode is required' });
      return send(res, 200, { data: await client.getProductVideos(barcode) });
    }

    // Any marketplace mutation is approval-gated. The agent itself never receives
    // the Trendyol credentials; this service keeps them process-local.
    if (req.method === 'POST' && url.pathname === '/products/v2') {
      if (!requireApproval(req, res)) return;
      const payload = await bodyJson(req);
      return send(res, 200, { data: await client.createProductV2(payload) });
    }

    if (req.method === 'POST' && url.pathname === '/product-video') {
      if (!requireApproval(req, res)) return;
      const payload = await bodyJson(req);
      return send(res, 200, { data: await client.createProductVideo(payload) });
    }

    return send(res, 404, { error: 'not found' });
  } catch (error) {
    return send(res, 502, { error: safeError(error) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CliniGA Trendyol bridge listening on ${PORT}`);
});
