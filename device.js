(function () {
  const TZ_COUNTRY = {
    "Asia/Jakarta": ["Indonesia", "ID"],
    "Asia/Makassar": ["Indonesia", "ID"],
    "Asia/Jayapura": ["Indonesia", "ID"],
    "Asia/Pontianak": ["Indonesia", "ID"],
    "Asia/Singapore": ["Singapore", "SG"],
    "Asia/Kuala_Lumpur": ["Malaysia", "MY"],
    "Asia/Tokyo": ["Japan", "JP"],
    "Asia/Seoul": ["South Korea", "KR"],
    "Asia/Shanghai": ["China", "CN"],
    "Asia/Bangkok": ["Thailand", "TH"],
    "Asia/Manila": ["Philippines", "PH"],
    "Asia/Ho_Chi_Minh": ["Vietnam", "VN"],
    "Australia/Sydney": ["Australia", "AU"],
    "Europe/London": ["United Kingdom", "GB"],
    "America/New_York": ["United States", "US"],
    "America/Los_Angeles": ["United States", "US"]
  };

  function flagEmoji(cc) {
    if (!cc || cc.length !== 2) return "🌐";
    const u = (c) => String.fromCodePoint(127397 + c.toUpperCase().charCodeAt(0));
    return u(cc[0]) + u(cc[1]);
  }

  function parseDevice() {
    const ua = navigator.userAgent || "";
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android";
    if (/Windows Phone/.test(ua)) return "Windows Phone";
    if (/Macintosh|Mac OS X/.test(ua)) return "Mac";
    if (/Windows/.test(ua)) return "Windows";
    if (/Linux/.test(ua)) return "Linux";
    return "Unknown";
  }

  function parseBrowser() {
    const ua = navigator.userAgent || "";
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\/|Opera/.test(ua)) return "Opera";
    if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
    if (/Firefox|FxiOS/.test(ua)) return "Firefox";
    if (/CriOS/.test(ua)) return "Chrome";
    if (/Chrome/.test(ua) && !/Edg\//.test(ua)) return "Chrome";
    if (/Safari/.test(ua) && !/Chrome|CriOS/.test(ua)) return "Safari";
    if (/UCBrowser/.test(ua)) return "UC Browser";
    return "Browser";
  }

  async function detectCountry() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (TZ_COUNTRY[tz]) {
      const [name, code] = TZ_COUNTRY[tz];
      return { name, code, flag: flagEmoji(code), tz };
    }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch("https://ipwho.is/", { signal: ctrl.signal });
      clearTimeout(t);
      const j = await r.json();
      if (j && j.success !== false && j.country) {
        return { name: j.country, code: j.country_code || "", flag: flagEmoji(j.country_code || ""), tz };
      }
    } catch (_) {}
    const lang = (navigator.language || "").toLowerCase();
    if (lang.includes("-id") || lang === "id") return { name: "Indonesia", code: "ID", flag: flagEmoji("ID"), tz };
    return { name: tz || "Unknown", code: "", flag: "🌐", tz };
  }

  async function readBattery() {
    try {
      if (!navigator.getBattery) return { supported: false, percent: null, charging: false };
      const b = await navigator.getBattery();
      return {
        supported: true,
        percent: Math.round(b.level * 100),
        charging: !!b.charging,
        raw: b
      };
    } catch (_) {
      return { supported: false, percent: null, charging: false };
    }
  }

  window.NTDevice = { parseDevice, parseBrowser, detectCountry, readBattery, flagEmoji };
})();
