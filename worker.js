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
    params.delete('mt'); // 仅供本 Worker 分缓存用，不传给 Google
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
    // 用不带 session 的 key 查缓存，多用户共享；mt 区分底图类型，避免地形/卫星瓦片串缓存
    const mtParam = new URLSearchParams(url.search).get('mt') || '';
    const mt = /^[a-z]+$/.test(mtParam) ? mtParam : 'base';
    const cacheKey = `https://gtiles-cache.internal/2dtiles/${mt}/${z}/${x}/${y}`;
    const cache = caches.default;
    let cached;
    try { cached = await cache.match(cacheKey); } catch (e) { console.error('[gtiles] cache.match error:', e && e.message); }
    if (cached) return cached;

    // L2：R2 持久緩存。新鮮期 30 天（Google 條款的緩存上限），過期視為未命中、回源刷新，
    // 不長期存儲 Google 內容。R2 命中時瀏覽器與 Google 之間零遠端請求。
    const bucket = env.GTILES_BUCKET;
    const r2Key = `${mt}/${z}/${x}/${y}`;
    if (bucket) {
      try {
        const obj = await bucket.get(r2Key);
        if (obj && (Date.now() - obj.uploaded.getTime()) < 2592000000) {
          const headers = new Headers();
          obj.writeHttpMetadata(headers);
          headers.set('cache-control', 'public, max-age=86400');
          headers.set('x-tile-cache', 'r2');
          return new Response(obj.body, { headers });
        }
      } catch (e) { console.error('[gtiles] r2 get error:', e && e.message); }
    }

    const params = new URLSearchParams(url.search);
    params.delete('mt'); // 仅供本 Worker 分缓存用，不传给 Google
    params.set('key', apiKey);
    // session 由前端传入（createSession 返回的 token）
    const resp = await fetch(`${GOOGLE_TILE_HOST}/v1/2dtiles/${z}/${x}/${y}?${params}`, {
      headers: { 'referer': 'https://sanguo.720108.xyz/' },
    });
    if (!resp.ok) {
      const bodyText = await resp.text().catch(() => '');
      console.error(`[gtiles] Google tile ${z}/${x}/${y} -> ${resp.status}: ${bodyText.slice(0, 300)}`);
      return new Response(`tile fetch failed: upstream ${resp.status}`, { status: resp.status });
    }
    const bytes = await resp.arrayBuffer();
    const contentType = resp.headers.get('content-type') || 'image/png';
    const out = new Response(bytes, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400',
        'x-tile-cache': 'google',
      },
    });
    try { ctx.waitUntil(cache.put(cacheKey, out.clone())); } catch (e) { console.error('[gtiles] cache.put error:', e && e.message); }
    if (bucket) {
      try {
        ctx.waitUntil(bucket.put(r2Key, bytes, { httpMetadata: { contentType } }).catch(e => console.error('[gtiles] r2 put error:', e && e.message)));
      } catch (e) { console.error('[gtiles] r2 put error:', e && e.message); }
    }
    return out;
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
    // 摘录 API：D1 动态数据
    if (url.pathname.startsWith('/api/excerpts/') || url.pathname.startsWith('/api/biography/')) {
      return handleExcerptsAPI(request, env, url);
    }
    // 静态资源：交由 Cloudflare Assets 处理
    // 注意：wrangler.jsonc 需配置 [assets] 且本 Worker 为入口时，需用 env.ASSETS.fetch
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('assets not configured', { status: 500 });
  },
};

// 摘录 API：GET /api/excerpts/:pid 取某人摘录；DELETE /api/excerpts/:id 删一条
// 本传 API：GET /api/biography/:pid 取某人本传全文（sidneyluo）
async function handleExcerptsAPI(request, env, url) {
  const db = env.SANGUO_DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'D1 not configured' }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }
  const parts = url.pathname.split('/');
  // parts: ['', 'api', 'excerpts'|'biography', ':id']
  const kind = parts[2];
  const id = parts[3];

  if (kind === 'biography' && request.method === 'GET' && id) {
    try {
      const row = await db.prepare(
        'SELECT person_id, volume, bio_name, full_text FROM biographies WHERE person_id = ?'
      ).bind(id).first();
      if (!row) {
        return new Response(JSON.stringify({ error: 'not found' }), {
          status: 404, headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(row), {
        headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500, headers: { 'content-type': 'application/json' },
      });
    }
  }

  if (kind === 'excerpts' && request.method === 'GET' && id) {
    // 取某人的全部摘录：/api/excerpts/p0086
    try {
      const { results } = await db.prepare(
        'SELECT id, person_id, work, source, citation, quote FROM excerpts WHERE person_id = ? ORDER BY source, id'
      ).bind(id).all();
      return new Response(JSON.stringify(results), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500, headers: { 'content-type': 'application/json' },
      });
    }
  }

  if (request.method === 'DELETE' && id) {
    // 删一条：/api/excerpts/p0086-a04-001-0
    // 同时记入 excerpt_deletions 表，防重导时复活
    try {
      const res = await db.prepare('DELETE FROM excerpts WHERE id = ?').bind(id).run();
      if (res.meta.changes > 0) {
        await db.prepare('INSERT OR IGNORE INTO excerpt_deletions (id) VALUES (?)').bind(id).run();
      }
      return new Response(JSON.stringify({ deleted: res.meta.changes }), {
        headers: { 'content-type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500, headers: { 'content-type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'method not allowed' }), {
    status: 405, headers: { 'content-type': 'application/json' },
  });
}
