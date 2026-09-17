(function () {
  const E = {};

  E.download = function (blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2500);
  };
  E.downloadText = function (text, name, type) {
    E.download(new Blob([text], { type: type || "text/plain" }), name);
  };
  E.copy = async function (text) {
    await navigator.clipboard.writeText(text);
  };
  E.readFile = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
  E.readDataURL = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  E.readText = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsText(file);
  });
  E.loadImage = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Could not read image."));
    img.src = src;
  });
  E.canvasToBlob = (canvas, type, quality) => new Promise((res) => canvas.toBlob(res, type || "image/jpeg", quality ?? 0.85));

  function drawImage(img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return { c, ctx };
  }

  E.imageCompress = async function (file, quality, mime) {
    const url = await E.readDataURL(file);
    const img = await E.loadImage(url);
    const { c } = drawImage(img);
    const type = mime || file.type || "image/jpeg";
    const blob = await E.canvasToBlob(c, type, quality);
    return { blob, width: c.width, height: c.height, before: file.size, after: blob.size };
  };

  E.imageResize = async function (file, w, h) {
    const img = await E.loadImage(await E.readDataURL(file));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    const blob = await E.canvasToBlob(c, file.type || "image/png", 0.92);
    return { blob, width: w, height: h };
  };

  E.imageFilter = async function (file, cssFilter) {
    const img = await E.loadImage(await E.readDataURL(file));
    const { c, ctx } = drawImage(img);
    ctx.filter = cssFilter;
    ctx.drawImage(img, 0, 0);
    const blob = await E.canvasToBlob(c, "image/png", 0.92);
    return { blob, width: c.width, height: c.height };
  };

  E.imageRotate = async function (file, deg) {
    const img = await E.loadImage(await E.readDataURL(file));
    const rad = deg * Math.PI / 180;
    const c = document.createElement("canvas");
    const swap = deg % 180 !== 0;
    c.width = swap ? img.height : img.width;
    c.height = swap ? img.width : img.height;
    const ctx = c.getContext("2d");
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    const blob = await E.canvasToBlob(c, "image/png");
    return { blob };
  };

  E.imageFlip = async function (file, dir) {
    const img = await E.loadImage(await E.readDataURL(file));
    const { c, ctx } = drawImage(img);
    ctx.save();
    if (dir === "h") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    else { ctx.translate(0, c.height); ctx.scale(1, -1); }
    ctx.drawImage(img, 0, 0);
    ctx.restore();
    return { blob: await E.canvasToBlob(c, "image/png") };
  };

  E.imageConvert = async function (file, type) {
    const img = await E.loadImage(await E.readDataURL(file));
    const { c, ctx } = drawImage(img);
    if (type === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
    }
    const ext = type.split("/")[1].replace("jpeg", "jpg");
    return { blob: await E.canvasToBlob(c, type, 0.92), ext };
  };

  E.imageWatermark = async function (file, text, color) {
    const img = await E.loadImage(await E.readDataURL(file));
    const { c, ctx } = drawImage(img);
    const size = Math.max(16, Math.floor(c.width / 18));
    ctx.font = `700 ${size}px Inter,sans-serif`;
    ctx.fillStyle = color || "rgba(255,208,0,.75)";
    ctx.textAlign = "right";
    ctx.fillText(text || "NAILONG TOOLS", c.width - 16, c.height - 16);
    return { blob: await E.canvasToBlob(c, "image/png") };
  };

  E.imageBorder = async function (file, pad, color) {
    const img = await E.loadImage(await E.readDataURL(file));
    const c = document.createElement("canvas");
    c.width = img.width + pad * 2; c.height = img.height + pad * 2;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color || "#ffd000";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, pad, pad);
    return { blob: await E.canvasToBlob(c, "image/png") };
  };

  E.imagePixelate = async function (file, block) {
    const img = await E.loadImage(await E.readDataURL(file));
    const { c, ctx } = drawImage(img);
    const w = Math.max(1, Math.floor(c.width / block));
    const h = Math.max(1, Math.floor(c.height / block));
    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    const tctx = tmp.getContext("2d");
    tctx.imageSmoothingEnabled = false;
    tctx.drawImage(img, 0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(tmp, 0, 0, c.width, c.height);
    return { blob: await E.canvasToBlob(c, "image/png") };
  };

  E.imageRound = async function (file, r) {
    const img = await E.loadImage(await E.readDataURL(file));
    const { c, ctx } = drawImage(img);
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    const rad = Math.min(r, c.width / 2, c.height / 2);
    ctx.moveTo(rad, 0);
    ctx.arcTo(c.width, 0, c.width, c.height, rad);
    ctx.arcTo(c.width, c.height, 0, c.height, rad);
    ctx.arcTo(0, c.height, 0, 0, rad);
    ctx.arcTo(0, 0, c.width, 0, rad);
    ctx.closePath(); ctx.fill();
    return { blob: await E.canvasToBlob(c, "image/png") };
  };

  E.stats = function (text) {
    const t = text || "";
    const lines = t.split(/\n/);
    const paras = t.split(/\n\s*\n/).filter((p) => p.trim());
    const words = t.trim() ? t.trim().split(/\s+/) : [];
    const sentences = t.split(/[.!?]+/).filter((s) => s.trim());
    return {
      chars: t.length,
      charsNoSpace: t.replace(/\s/g, "").length,
      words: words.length,
      lines: t ? lines.length : 0,
      paragraphs: t.trim() ? paras.length : 0,
      sentences: t.trim() ? sentences.length : 0
    };
  };

  const MORSE = { A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..","0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----."," ":"/" };
  const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

  E.morseEnc = (t) => (t || "").toUpperCase().split("").map((c) => MORSE[c] || c).join(" ");
  E.morseDec = (t) => (t || "").trim().split(/\s+/).map((c) => MORSE_REV[c] || c).join("").replace(/\//g, " ");

  E.toSlug = (t) => (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  E.titleCase = (t) => (t || "").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
  E.sentenceCase = (t) => (t || "").toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase());
  E.camel = (t) => E.toSlug(t).replace(/-([a-z])/g, (_, a) => a.toUpperCase());
  E.snake = (t) => E.toSlug(t).replace(/-/g, "_");
  E.kebab = (t) => E.toSlug(t);

  E.prettyJSON = (t) => JSON.stringify(JSON.parse(t), null, 2);
  E.minJSON = (t) => JSON.stringify(JSON.parse(t));
  E.prettyXML = (xml) => {
    const p = new DOMParser().parseFromString(xml, "text/xml");
    if (p.querySelector("parsererror")) throw new Error("Invalid XML.");
    const s = new XMLSerializer().serializeToString(p);
    let pad = 0, out = "";
    s.replace(/>(\s*)</g, "><").split(/(<[^>]+>)/g).forEach((n) => {
      if (!n) return;
      if (/^<\//.test(n)) pad = Math.max(0, pad - 2);
      if (!/^</.test(n)) { out += n; return; }
      out += "\n" + " ".repeat(pad) + n;
      if (/^<[^/!][^>]*[^/]>$/.test(n)) pad += 2;
    });
    return out.trim();
  };

  E.b64enc = (t) => btoa(unescape(encodeURIComponent(t)));
  E.b64dec = (t) => decodeURIComponent(escape(atob(t)));

  E.hash = async function (text, algo) {
    const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  E.uuid = () => crypto.randomUUID();
  E.rand = (len, chars) => {
    const c = chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const a = new Uint32Array(len);
    crypto.getRandomValues(a);
    return [...a].map((n) => c[n % c.length]).join("");
  };
  E.password = (len, opts) => {
    let c = "";
    if (opts.lower !== false) c += "abcdefghijkmnopqrstuvwxyz";
    if (opts.upper !== false) c += "ABCDEFGHJKLMNPQRSTUVWXYZ";
    if (opts.num !== false) c += "23456789";
    if (opts.sym) c += "!@#$%^&*_-+=?";
    return E.rand(len, c || "abcdef123");
  };

  E.hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
    const n = parseInt(hex, 16);
    if (Number.isNaN(n) || hex.length !== 6) throw new Error("Invalid HEX.");
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  E.rgbToHex = (r, g, b) => "#" + [r, g, b].map((x) => Number(x).toString(16).padStart(2, "0")).join("");
  E.rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  E.lorem = (n) => {
    const s = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");
    const out = [];
    for (let i = 0; i < n; i++) {
      const words = [];
      const count = 20 + Math.floor(Math.random() * 20);
      for (let j = 0; j < count; j++) words.push(s[Math.floor(Math.random() * s.length)]);
      words[0] = words[0][0].toUpperCase() + words[0].slice(1);
      out.push(words.join(" ") + ".");
    }
    return out.join("\n\n");
  };

  const HTTP = {
    200: "OK", 201: "Created", 204: "No Content", 301: "Moved Permanently", 302: "Found",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
    500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable"
  };
  E.httpStatus = (code) => HTTP[String(code)] || "Unknown or uncommon code";

  E.decodeJWT = (token) => {
    const parts = (token || "").split(".");
    if (parts.length < 2) throw new Error("Not a JWT.");
    const dec = (p) => JSON.parse(E.b64dec(p.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((p.length % 4) || 4)));
    return { header: dec(parts[0]), payload: dec(parts[1]), note: "Signature is not verified. Use only for debugging your own tokens." };
  };

  E.cronExplain = (expr) => {
    const p = (expr || "").trim().split(/\s+/);
    if (p.length < 5) throw new Error("Use 5-field cron: min hour day month weekday");
    return `Minute: ${p[0]}\nHour: ${p[1]}\nDay of month: ${p[2]}\nMonth: ${p[3]}\nWeekday: ${p[4]}`;
  };

  E.parseURL = (u) => {
    const x = new URL(u);
    return JSON.stringify({
      href: x.href, protocol: x.protocol, host: x.host, hostname: x.hostname,
      port: x.port, pathname: x.pathname, search: x.search, hash: x.hash
    }, null, 2);
  };

  E.mdLite = (src) => {
    let t = (src || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    t = t.replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, "<br>");
    return t;
  };

  E.csvToJson = (csv) => {
    const rows = csv.trim().split(/\r?\n/).map((r) => r.split(",").map((c) => c.trim()));
    const head = rows.shift();
    return JSON.stringify(rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ""]))), null, 2);
  };
  E.jsonToCsv = (text) => {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    const keys = [...new Set(arr.flatMap((o) => Object.keys(o)))];
    const lines = [keys.join(",")].concat(arr.map((o) => keys.map((k) => String(o[k] ?? "").replace(/,/g, " ")).join(",")));
    return lines.join("\n");
  };

  E.units = {
    length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
    weight: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.0283495, t: 1000 },
    temp: null,
    area: { m2: 1, cm2: 0.0001, ft2: 0.092903, acre: 4046.86, ha: 10000 },
    volume: { l: 1, ml: 0.001, gal: 3.78541, m3: 1000 },
    speed: { kmh: 1, mph: 1.60934, ms: 3.6 },
    data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
    time: { s: 1, min: 60, h: 3600, d: 86400 }
  };
  E.convert = (type, value, from, to) => {
    if (type === "temp") {
      let c = value;
      if (from === "F") c = (value - 32) * 5 / 9;
      if (from === "K") c = value - 273.15;
      if (to === "C") return c;
      if (to === "F") return c * 9 / 5 + 32;
      if (to === "K") return c + 273.15;
    }
    const map = E.units[type];
    return value * map[from] / map[to];
  };

  window.NTEngine = E;
})();
