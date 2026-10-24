/*
 * Visitor map: black dot-matrix world, glowing gold dots for visitor cities,
 * and airline-style arcs from home. Data comes from the visitor-map Worker
 * (see visitor-map-worker/), which stores only approximate city-level counts.
 */
(function () {
  "use strict";

  var GRID = {
    step: 1.5,
    lonMin: -180,
    latMax: 82.5,
    cols: 240,
    rows: 94,
    mask: [
      "00000000000000007ffe007fff8000000000000000000000000000000000",
      "00000000000000e3efe7fffffffc00000000000e90000300000000000000",
      "00000000000000fffe07ffffffe00001d7800000001003c0000000000000",
      "0000000000160581f8ffffffffc000007200000000000020000000000000",
      "0000000001d126ffb03fffffff900000000000001c00000fe00000000000",
      "00000000000684dfe0003fffffa000000000000300003fffe0000e300000",
      "0000000007e04ee6f8001ffffec000000000000c0023fffe6e3003000000",
      "000000000f7fc70dee001fffff80000000000038030dfffffffc07f00000",
      "0003e0000007f0e7ff400bfffec0000001f00000073effffffffffffe000",
      "001ffff7ff8f3379d7e003fffe0000002fff0080731fffffffffffffffbf",
      "e01ffffffffffffbc4f80fffc00000003fffe4ffff3fffffffffffffffff",
      "7e7ffffffffffffe03c40fff00fc0000fffe1fffffffffffffffffffffff",
      "081fffffffffffff8df807f8007c0001fcfe7ffffffffffffffffffffffc",
      "003ffffffffffff0006803f000000003f3ffffffffffffffffffffffffff",
      "007fffffffffff800f0001f00000100fe3ffffffffffffffffffffff17f0",
      "005fd07fffffff800f8000200000001ff90ffffffffffffffffffffe0c40",
      "0001800fffffffc00fec00000000040ce0fffffffffffffffffffc003000",
      "00024001fffffff007fe000000000e02e3fffffffffffffffffff000f800",
      "00080001fffffffe0fff000000000e0143ffffffffffffffffffe000f000",
      "000000017fffffff9fffc00000007302bffffffffffffffffffff800e000",
      "000000001fffffffcfffe0000000379ffffffffffffffffffffffd00c000",
      "000000001fffffffffffa000000007fffffffffffffffffffffffd008000",
      "000000000fffffffffe06000000000fffffffffffffffffffffffd000000",
      "0000000007ffffffffb0f800000007fffffffffffffffffffffff8000000",
      "0000000007fffffffff90000000001fffffb7f9ffffffffffffff0000000",
      "0000000007ffffffffe60000000001ff3ff37e3fffffffffffffe2200000",
      "0000000007ffffffff800000000039f99fe01f3fffffffffffffc3800000",
      "0000000007ffffffff80000000003fc0c7e00f0ffffffffffffe04000000",
      "0000000007fffffffc00000000003f02371fff9fffffffffff3c04000000",
      "0000000003fffffffc00000000003f00033fff8ffffffffffc1804000000",
      "0000000003fffffffc00000000003e00433fff8ffffffffffe8c1c000000",
      "0000000001fffffff8000000000000fe0020ffffffffffffff0c1c000000",
      "0000000000fffffff000000000000ffe0000ffffffffffffff00e0000000",
      "00000000003fffffe000000000003fff0001ffffffffffffff8380000000",
      "00000000002fffffc000000000007fffc7c9ffffffffffffff8100000000",
      "000000000017fff1c000000000003fffffffff7fffffffffffc000000000",
      "00000000000bff00400000000000ffffffffff3fffffffffff8000000000",
      "000000000009fe00600000000001fffffffeff8bffffffffff0000000000",
      "000000000005fe00000000000003fffffffe7fc5ffffffffff0000000000",
      "0000000000027e00000000000003ffffffff7ffc07fffffffc8000000000",
      "0000000000003e00a00000000007ffffffff3fff01fffffff08000000000",
      "0000000000003e0c0c0000000007ffffffffbffe017fc7ff000000000000",
      "0000800000003f0c018000000007ffffffff9ffc007f83fe400000000000",
      "0000000000000ff8089000000007ffffffffcffc007f01fe008000000000",
      "00000000000003f8000000000007ffffffffc7e0007e017f00c000000000",
      "000000000000003f800000000007ffffffffe7c00078007f808000000000",
      "000000000000000f000000000007fffffffff6000038003f800000000000",
      "0000000000000003008000000007fffffffff80000380027803000000000",
      "000000000000000103f000000003fffffffffbc000180003012000000000",
      "0000000000000000f7fe00000001ffffffffffc000140020021000000000",
      "00000000000000006fff80000000ffffffffff8000060020005000000000",
      "00000000000000000fffc00000007f9fffffff8000000010040000000000",
      "00000000000000000ffff8000000000bffffff00000000980e0800000000",
      "00000000000000000ffffc0000000001fffffe000000006a1c0000000000",
      "00000000000000001ffffe0000000003fffffc00000000347e0000000000",
      "00000000000000001ffffc0000000003fffff800000000387c0000000000",
      "00000000000000003ffffec000000003fffff0000000001c7cc080000000",
      "00000000000000003ffffffc00000001ffffe0000000000e1946de000000",
      "00000000000000003ffffffe00000000ffffc0000000000600001f840000",
      "00000000000000003fffffff800000007fffc0000000000100000fd90000",
      "00000000000000001fffffff800000007fffc00000000000e0010fc00000",
      "00000000000000000fffffff800000007fffc00000000000001003200000",
      "00000000000000000fffffff000000007fffe00000000000000000000000",
      "000000000000000007fffffe000000007fffe000000000000000a0000000",
      "000000000000000007fffffc00000000ffffe080000000000001e3000000",
      "000000000000000003fffffc00000000ffffe1c000000000000fc3800000",
      "000000000000000001fffffc00000000ffffc38000000000003ff3800001",
      "0000000000000000007ffffc00000000ffff878000000000003fff800002",
      "0000000000000000007ffff8000000007fff038000000000007fffc00000",
      "0000000000000000007ffff8000000007ffe07000000000007ffffe00100",
      "0000000000000000007ffff0000000003fff0700000000000ffffff00000",
      "0000000000000000007fff80000000003fff0700000000000ffffff80000",
      "0000000000000000007fff00000000003ffc0000000000000ffffffc0000",
      "0000000000000000007fff00000000003ffc0000000000000ffffffc0000",
      "000000000000000000fffe00000000001ffc0000000000000ffffffc0000",
      "000000000000000000fffe00000000001ff800000000000007fffffc0000",
      "000000000000000000fff800000000000ff000000000000007fffffc0000",
      "000000000000000000fff800000000000fe000000000000007e07ff80000",
      "000000000000000000ffb00000000000040000000000000006002ff80000",
      "000000000000000001ffc000000000000000000000000000000007f00000",
      "000000000000000001ffc000000000000000000000000000000007f00008",
      "000000000000000001fc000000000000000000000000000000000000000e",
      "000000000000000001fc0000000000000000000000000000000000800004",
      "000000000000000000f80000000000000000000000000000000000600030",
      "000000000000000001f80000000000000000000000000000000000400060",
      "000000000000000003f000000000000000000000000000000000000001c0",
      "000000000000000003e00000000000000000000000000000000000000080",
      "000000000000000001f00000000000000000000000000000000000000000",
      "000000000000000001e00000000000000000000002000000000000000000",
      "000000000000000003c00000000000000000000000000000000000000000",
      "000000000000000001c00000000000000000000000000000000000000000",
      "000000000000000001600000000000000000000000000000000000000000",
      "000000000000000000200000000000000000000000000000000000000000",
      "000000000000000000000000000000000000000000000000000000000000",
    ],
  };

  var GOLD = "232, 199, 102";
  var GOLD_DEEP = "201, 162, 39";

  function init() {
    var el = document.getElementById("visitor-map");
    if (!el) return;
    var endpoint = (el.getAttribute("data-endpoint") || "").replace(/\/+$/, "");
    if (!endpoint) {
      el.parentNode.removeChild(el);
      return;
    }
    var article = el.closest("article");
    if (article) article.appendChild(el);

    var home = {
      lat: parseFloat(el.getAttribute("data-home-lat")) || 35.99,
      lon: parseFloat(el.getAttribute("data-home-lon")) || -78.94,
      label: el.getAttribute("data-home-label") || "Durham",
    };

    injectStyles();
    el.className = "vm-card";
    el.innerHTML =
      '<div class="vm-head"><span class="vm-title">Visitors</span>' +
      '<span class="vm-stats">&nbsp;</span></div>' +
      '<div class="vm-stage"><canvas class="vm-land" aria-hidden="true"></canvas>' +
      '<canvas class="vm-live" role="img" aria-label="World map of where visitors to this site are from"></canvas>' +
      '<div class="vm-tip" hidden></div></div>' +
      '<div class="vm-foot">Approximate city-level locations</div>';

    var map = createMap(el, home);
    loadData(endpoint).then(
      function (data) {
        map.setData(data);
      },
      function () {
        map.setData(null);
      }
    );
  }

  function loadData(endpoint) {
    var today = new Date();
    var day = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var counted = false;
    try {
      counted = window.localStorage.getItem("vm-day") === day;
    } catch (e) {
      counted = false;
    }
    if (navigator.webdriver) counted = true;
    var req = counted ? fetch(endpoint + "/data") : fetch(endpoint + "/hit", { method: "POST" });
    return req.then(function (res) {
      if (!res.ok) throw new Error("visitor map: " + res.status);
      if (!counted) {
        try {
          window.localStorage.setItem("vm-day", day);
        } catch (e) {
          /* storage unavailable: fine */
        }
      }
      return res.json();
    });
  }

  function createMap(root, home) {
    var stage = root.querySelector(".vm-stage");
    var land = root.querySelector(".vm-land");
    var live = root.querySelector(".vm-live");
    var tip = root.querySelector(".vm-tip");
    var statsEl = root.querySelector(".vm-stats");
    var footEl = root.querySelector(".vm-foot");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var W = 0,
      H = 0,
      dpr = 1,
      scale = 1;
    var places = [];
    var arcs = [];
    var maxN = 1;
    var visible = true;
    var start = performance.now();
    var dataTime = null;

    function project(lat, lon) {
      var x = ((lon + 180) / 360) * W;
      var span = GRID.rows * GRID.step;
      var y = ((GRID.latMax + GRID.step / 2 - lat) / span) * H;
      return [x, y];
    }

    function resize() {
      W = stage.clientWidth;
      H = Math.round((W * GRID.rows) / GRID.cols);
      scale = Math.min(1.1, Math.max(0.55, W / 820));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      [land, live].forEach(function (c) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
        c.style.width = W + "px";
        c.style.height = H + "px";
      });
      stage.style.height = H + "px";
      drawLand();
      layout();
      if (reduceMotion || !visible) drawFrame(performance.now());
    }

    function drawLand() {
      var ctx = land.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var sx = W / GRID.cols;
      var r = Math.max(0.6, sx * 0.3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      for (var row = 0; row < GRID.rows; row++) {
        var hex = GRID.mask[row];
        var lat = GRID.latMax - row * GRID.step;
        for (var i = 0; i < hex.length; i++) {
          var nib = parseInt(hex.charAt(i), 16);
          if (!nib) continue;
          for (var b = 0; b < 4; b++) {
            if (!(nib & (8 >> b))) continue;
            var col = i * 4 + b;
            if (col >= GRID.cols) continue;
            var lon = GRID.lonMin + GRID.step / 2 + col * GRID.step;
            var p = project(lat, lon);
            ctx.beginPath();
            ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    function layout() {
      var h = project(home.lat, home.lon);
      maxN = places.reduce(function (m, p) {
        return Math.max(m, p.n);
      }, 1);
      places.forEach(function (p) {
        var xy = project(p.lat, p.lon);
        p.x = xy[0];
        p.y = xy[1];
        p.r = (1.8 + 4.2 * Math.sqrt(p.n / maxN)) * scale;
      });
      arcs = places
        .filter(function (p) {
          return Math.hypot(p.x - h[0], p.y - h[1]) > 6;
        })
        .slice(0, 80)
        .map(function (p, i) {
          var dx = p.x - h[0],
            dy = p.y - h[1];
          var dist = Math.hypot(dx, dy);
          var lift = Math.min(dist * 0.32, H * 0.42);
          return {
            x0: h[0],
            y0: h[1],
            x1: p.x,
            y1: p.y,
            cx: (h[0] + p.x) / 2,
            cy: (h[1] + p.y) / 2 - lift,
            speed: 0.00011 + 0.00004 * ((i * 7) % 5),
            phase: (i * 0.137) % 1,
            weight: Math.sqrt(p.n / maxN),
          };
        });
    }

    function bez(a, t) {
      var u = 1 - t;
      return [u * u * a.x0 + 2 * u * t * a.cx + t * t * a.x1, u * u * a.y0 + 2 * u * t * a.cy + t * t * a.y1];
    }

    function drawFrame(now) {
      var ctx = live.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var t = now - start;
      var reveal = dataTime === null ? 0 : Math.min(1, (now - dataTime) / 1400);
      if (reduceMotion) reveal = dataTime === null ? 0 : 1;
      var easeR = 1 - Math.pow(1 - reveal, 3);

      // arcs
      ctx.lineCap = "round";
      arcs.forEach(function (a) {
        var g = ctx.createLinearGradient(a.x0, a.y0, a.x1, a.y1);
        g.addColorStop(0, "rgba(" + GOLD + ", " + (0.55 * easeR).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + GOLD_DEEP + ", " + ((0.12 + 0.25 * a.weight) * easeR).toFixed(3) + ")");
        ctx.strokeStyle = g;
        ctx.lineWidth = (0.6 + 0.8 * a.weight) * scale;
        ctx.beginPath();
        var steps = 48,
          upto = Math.max(1, Math.round(steps * easeR));
        for (var s = 0; s <= upto; s++) {
          var q = bez(a, s / steps);
          if (s === 0) ctx.moveTo(q[0], q[1]);
          else ctx.lineTo(q[0], q[1]);
        }
        ctx.stroke();

        if (!reduceMotion && reveal >= 1) {
          var k = (a.phase + t * a.speed) % 1;
          for (var j = 0; j < 6; j++) {
            var kk = k - j * 0.012;
            if (kk < 0) continue;
            var pt = bez(a, kk);
            ctx.fillStyle = "rgba(255, 236, 170, " + (0.9 - j * 0.15).toFixed(2) + ")";
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], Math.max(0.4, 1.5 - j * 0.2), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // visitor dots
      places.forEach(function (p, i) {
        var tw = reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(t / 900 + i * 1.7);
        var r = p.r * easeR;
        if (r <= 0.1) return;
        var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.2);
        glow.addColorStop(0, "rgba(" + GOLD + ", " + (0.55 * tw).toFixed(3) + ")");
        glow.addColorStop(0.35, "rgba(" + GOLD_DEEP + ", " + (0.18 * tw).toFixed(3) + ")");
        glow.addColorStop(1, "rgba(" + GOLD_DEEP + ", 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 228, 140, 0.95)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      });

      // home
      var h = project(home.lat, home.lon);
      if (!reduceMotion) {
        for (var w = 0; w < 2; w++) {
          var ph = (((t / 2600 + w * 0.5) % 1) + 1) % 1;
          ctx.strokeStyle = "rgba(" + GOLD + ", " + (0.6 * (1 - ph)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(h[0], h[1], (3 + ph * 16) * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#fff4cc";
      ctx.shadowColor = "rgba(" + GOLD + ", 0.9)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(h[0], h[1], 3 * Math.max(scale, 0.8), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = "500 " + Math.round(11 * Math.max(scale, 0.9)) + "px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "rgba(" + GOLD + ", 0.95)";
      ctx.textAlign = "left";
      ctx.fillText(home.label, h[0] + 8, h[1] + 14);
    }

    function loop(now) {
      if (visible && !reduceMotion) drawFrame(now);
      window.requestAnimationFrame(loop);
    }

    function regionName(code) {
      try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
      } catch (e) {
        return code;
      }
    }

    function fmt(n) {
      return Number(n).toLocaleString("en-US");
    }

    function onMove(ev) {
      var rect = live.getBoundingClientRect();
      var mx = ev.clientX - rect.left,
        my = ev.clientY - rect.top;
      var best = null,
        bestD = 14;
      places.forEach(function (p) {
        var d = Math.hypot(p.x - mx, p.y - my) - p.r;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      });
      if (!best) {
        tip.hidden = true;
        live.style.cursor = "";
        return;
      }
      var name = (best.city ? best.city + ", " : "") + regionName(best.country);
      tip.textContent = name + " · " + fmt(best.n) + (best.n === 1 ? " visit" : " visits");
      tip.hidden = false;
      var tx = Math.min(Math.max(best.x, 70), W - 70);
      tip.style.left = tx + "px";
      tip.style.top = best.y - 14 + "px";
      live.style.cursor = "default";
    }

    live.addEventListener("mousemove", onMove);
    live.addEventListener("mouseleave", function () {
      tip.hidden = true;
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(root);
    }
    window.addEventListener("resize", resize);
    resize();
    if (reduceMotion) drawFrame(performance.now());
    else window.requestAnimationFrame(loop);

    return {
      setData: function (data) {
        if (!data) {
          statsEl.textContent = "";
          return;
        }
        places = (data.places || []).filter(function (p) {
          return isFinite(p.lat) && isFinite(p.lon) && p.n > 0;
        });
        var countries = {};
        places.forEach(function (p) {
          if (p.country) countries[p.country] = 1;
        });
        var nc = Object.keys(countries).length;
        statsEl.textContent =
          fmt(data.total) +
          (data.total === 1 ? " visit" : " visits") +
          " · " +
          fmt(places.length) +
          (places.length === 1 ? " city" : " cities") +
          " · " +
          fmt(nc) +
          (nc === 1 ? " country" : " countries");
        if (data.since) {
          var d = new Date(data.since + "T12:00:00");
          if (!isNaN(d)) {
            footEl.textContent =
              "Approximate city-level locations · since " + d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          }
        }
        dataTime = performance.now();
        layout();
        if (reduceMotion || !visible) drawFrame(performance.now());
      },
    };
  }

  function injectStyles() {
    if (document.getElementById("vm-styles")) return;
    var css =
      ".vm-card{margin:2.75rem 0 1rem;padding:18px 18px 14px;border-radius:16px;" +
      "background:radial-gradient(120% 140% at 50% 0%,#101012 0%,#050506 55%,#000 100%);" +
      "border:1px solid rgba(232,199,102,.18);box-shadow:0 10px 40px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.04);" +
      "color:#e9e4d4;position:relative;overflow:hidden}" +
      ".vm-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin:0 2px 12px}" +
      ".vm-title{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:#e8c766;font-weight:600}" +
      ".vm-stats{font-size:.8rem;color:rgba(233,228,212,.78);font-variant-numeric:tabular-nums}" +
      ".vm-stage{position:relative;width:100%}" +
      ".vm-stage canvas{position:absolute;inset:0;display:block}" +
      ".vm-tip{position:absolute;transform:translate(-50%,-100%);pointer-events:none;white-space:nowrap;" +
      "font-size:.75rem;padding:5px 9px;border-radius:999px;background:rgba(12,12,12,.92);color:#f5e6b8;" +
      "border:1px solid rgba(232,199,102,.45);box-shadow:0 4px 14px rgba(0,0,0,.5)}" +
      ".vm-foot{margin:10px 2px 0;font-size:.68rem;letter-spacing:.04em;color:rgba(233,228,212,.42)}";
    var style = document.createElement("style");
    style.id = "vm-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
