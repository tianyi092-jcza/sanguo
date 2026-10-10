// Cloudflare Worker: Google Map Tiles API 代理 + 静态资源服务
// 用途：浏览器→本Worker→Google，避免国内直连 tile.googleapis.com 不稳定
// API Key 存在 Worker Secret (GOOGLE_MAPS_API_KEY)，前端不再接触密钥

const GOOGLE_TILE_HOST = 'https://tile.googleapis.com';

async function proxyGoogle(request, env, ctx) {
  const url = new URL(request.url);
  const apiKey = env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Google Maps API key not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  // /api/gtiles/session → POST https://tile.googleapis.com/v1/createSession?key=...
  if (url.pathname === '/api/gtiles/session' && request.method === 'POST') {
    const body = await request.text();
    const resp = await fetch(`${GOOGLE_TILE_HOST}/v1/createSession?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // 满足 API Key 的 HTTP Referrer 限制
        'referer': 'https://sanguo.720108.xyz/',
      },
      body: body || '{}',
    });
    return new Response(await resp.arrayBuffer(), {
      status: resp.status,
      headers: {
        'content-type': resp.headers.get('content-type') || 'application/json',
        'cache-control': 'no-store',
      },
    });
  }

  // /api/gtiles/viewport?... → GET https://tile.googleapis.com/tile/v1/viewport?key=...&...
  if (url.pathname === '/api/gtiles/viewport') {
    const params = new URLSearchParams(url.search);
    params.set('key', apiKey);
    const resp = await fetch(`${GOOGLE_TILE_HOST}/tile/v1/viewport?${params}`, {
      headers: {
        'accept': 'application/json',
        'referer': 'https://sanguo.720108.xyz/',
      },
    });
    return new Response(await resp.arrayBuffer(), {
      status: resp.status,
      headers: {
        'content-type': resp.headers.get('content-type') || 'application/json',
        'cache-control': 'no-store',
      },
    });
  }

  // /api/gtiles/2dtiles/{z}/{x}/{y}?... → GET https://tile.googleapis.com/v1/2dtiles/...
  const tileMatch = url.pathname.match(/^\/api\/gtiles\/2dtiles\/(\d+)\/(\d+)\/(\d+)$/);
  if (tileMatch) {
    const [, z, x, y] = tileMatch;
    try {
    const params = new URLSearchParams(url.search);
    params.set('key', apiKey);
    // session 由前端传入（createSession 返回的 token）
    // 注：暂时禁用 caches.default 缓存（曾导致 Worker 500），仅用并发控制防 429
    const resp = await fetch(`${GOOGLE_TILE_HOST}/v1/2dtiles/${z}/${x}/${y}?${params}`, {
      headers: { 'referer': 'https://sanguo.720108.xyz/' },
    });
    if (!resp.ok) {
      const bodyText = await resp.text().catch(() => '');
      console.error(`[gtiles] Google tile ${z}/${x}/${y} -> ${resp.status}: ${bodyText.slice(0, 300)}`);
      return new Response(`tile fetch failed: upstream ${resp.status}`, { status: resp.status });
    }
    return new Response(await resp.arrayBuffer(), {
      status: 200,
      headers: {
        'content-type': resp.headers.get('content-type') || 'image/png',
        'cache-control': 'public, max-age=86400',
      },
    });
    } catch (e) {
      console.error(`[gtiles] worker tile error ${z}/${x}/${y}:`, e && e.message, e && e.stack);
      return new Response('worker tile error: ' + (e && e.message), { status: 500 });
    }
  }

  return null; // 非代理路径，交由静态资源处理
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/gtiles/')) {
      const proxied = await proxyGoogle(request, env, ctx);
      if (proxied) return proxied;
      return new Response('not found', { status: 404 });
    }
    // 静态资源：交由 Cloudflare Assets 处理
    // 注意：wrangler.jsonc 需配置 [assets] 且本 Worker 为入口时，需用 env.ASSETS.fetch
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('assets not configured', { status: 500 });
  },
};
