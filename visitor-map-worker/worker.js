// Visitor map counter for alyssamyli.github.io (Cloudflare Worker + Workers KV).
//
// POST /hit   records one visit from the visitor's approximate city and returns the totals.
// GET  /data  returns the totals without recording anything.
//
// Location comes from Cloudflare's own request metadata (request.cf), at city level.
// No IP addresses, user agents or other personal data are stored, only
// { city, country, approximate lat/lon, visit count } per place.
//
// Setup: bind a KV namespace to this Worker under the variable name VISITS.

const ALLOWED_ORIGINS = new Set(["https://alyssamyli.github.io"]);
const STATS_KEY = "stats";
const MAX_PLACES = 2000;
const BOT_UA = /bot|crawl|spider|slurp|headless|preview|scan|monitor|lighthouse/i;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (url.pathname === "/data" && request.method === "GET") {
      return reply(publicView(await load(env)), origin, 60);
    }

    if (url.pathname === "/hit" && request.method === "POST") {
      if (!ALLOWED_ORIGINS.has(origin)) return reply({ error: "forbidden" }, origin, 0, 403);
      const stats = await load(env);
      const ua = request.headers.get("User-Agent") || "";
      if (!BOT_UA.test(ua)) {
        record(stats, request.cf || {});
        await env.VISITS.put(STATS_KEY, JSON.stringify(stats));
      }
      return reply(publicView(stats), origin, 0);
    }

    return reply({ error: "not found" }, origin, 0, 404);
  },
};

export function record(stats, cf) {
  stats.total += 1;
  const lat = Number.parseFloat(cf.latitude);
  const lon = Number.parseFloat(cf.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
  const city = String(cf.city || "").slice(0, 80);
  const country = String(cf.country || "").slice(0, 2);
  const key = city ? `${country}|${String(cf.region || "").slice(0, 80)}|${city}` : `${lat.toFixed(1)},${lon.toFixed(1)}`;
  let place = stats.places[key];
  if (!place) {
    if (Object.keys(stats.places).length >= MAX_PLACES) return;
    place = stats.places[key] = { city, country, lat: round2(lat), lon: round2(lon), n: 0 };
  }
  place.n += 1;
}

async function load(env) {
  const raw = await env.VISITS.get(STATS_KEY);
  if (raw) {
    try {
      const s = JSON.parse(raw);
      if (s && typeof s.total === "number" && s.places) return s;
    } catch (_) {
      /* fall through to a fresh record */
    }
  }
  return { total: 0, since: new Date().toISOString().slice(0, 10), places: {} };
}

function publicView(stats) {
  return {
    total: stats.total,
    since: stats.since,
    places: Object.values(stats.places).sort((a, b) => b.n - a.n),
  };
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function reply(body, origin, maxAge, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": maxAge ? `public, max-age=${maxAge}` : "no-store",
    },
  });
}
