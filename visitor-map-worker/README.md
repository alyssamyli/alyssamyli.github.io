# Visitor map service

`worker.js` is the Cloudflare Worker behind the visitor map on the About page.
It runs as `visitor-map` in Cloudflare (Workers & Pages) with a Workers KV
namespace bound as `VISITS`, and is served at
https://visitor-map.alyssamengyuanli.workers.dev.

- `POST /hit` records one visit (approximate city from Cloudflare's request data) and returns totals.
- `GET /data` returns totals without recording.

Only `{ city, country, approximate lat/lon, count }` per place is stored. No IP
addresses or user agents. To change the code, paste `worker.js` into the
Worker's code editor in the Cloudflare dashboard and click Deploy.

The map itself is `assets/js/visitor-map.js`; its settings live under
`visitor_map:` in `_config.yml`.
