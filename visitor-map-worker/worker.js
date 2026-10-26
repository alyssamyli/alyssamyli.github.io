// Visitor map counter for alyssamyli.github.io (Cloudflare Worker + Workers KV).
//
// POST /hit   records one visit from the visitor's approximate city and returns the totals.
// GET  /data  returns the totals without recording anything.
//
// Location comes from Cloudflare's own request metadata (request.cf), at city level.
// No IP addresses, user agents or other personal data are stored, only
// { city, country, approximate lat/lon, visit count } per place.
//
// For the site owner only, stats.detail also keeps per network + place counts:
// { network name (e.g. a university or ISP), city, region, postal code, country,
//   visits, first/last visit date }, and stats.recent keeps the latest visits
// (time to the minute, UTC) with the same fields. Neither is ever returned by
// /data; read them from the KV namespace in the Cloudflare dashboard.
//
// Setup: bind a KV namespace to this Worker under the variable name VISITS.

const ALLOWED_ORIGINS = new Set(["https://alyssamyli.github.io"]);
const STATS_KEY = "stats";
const MAX_PLACES = 2000;
const MAX_DETAIL = 3000;
const MAX_RECENT = 500;
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
  recordDetail(stats, cf);
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

function recordDetail(stats, cf) {
  if (!stats.detail) stats.detail = {};
  if (!Array.isArray(stats.recent)) stats.recent = [];
  const clip = (v, n) => String(v || "").slice(0, n);
  const row = {
    network: clip(cf.asOrganization, 120),
    city: clip(cf.city, 80),
    region: clip(cf.region, 80),
    postal: clip(cf.postalCode, 16),
    country: clip(cf.country, 2),
  };
  const now = new Date().toISOString();
  stats.recent.unshift({ t: now.slice(0, 16) + "Z", ...row });
  if (stats.recent.length > MAX_RECENT) stats.recent.length = MAX_RECENT;

  const key = [row.network, row.city, row.region, row.postal, row.country].join("|");
  const today = now.slice(0, 10);
  let d = stats.detail[key];
  if (!d) {
    if (Object.keys(stats.detail).length >= MAX_DETAIL) return;
    d = stats.detail[key] = { ...row, n: 0, first: today };
  }
  d.n += 1;
  d.last = today;
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
