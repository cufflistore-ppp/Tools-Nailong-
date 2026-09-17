(function () {
  const k = (uid, name) => `nt_${name}_${uid || "anon"}`;
  const Store = {
    get(uid, name, fallback) {
      try { return JSON.parse(localStorage.getItem(k(uid, name)) || JSON.stringify(fallback)); }
      catch { return fallback; }
    },
    set(uid, name, value) { localStorage.setItem(k(uid, name), JSON.stringify(value)); },
    favs(uid) { return this.get(uid, "favs", []); },
    toggleFav(uid, id) {
      const list = this.favs(uid);
      const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1); else list.unshift(id);
      this.set(uid, "favs", list);
      return list;
    },
    history(uid) { return this.get(uid, "history", []); },
    pushHistory(uid, id) {
      const list = this.history(uid).filter((x) => x.id !== id);
      list.unshift({ id, at: Date.now() });
      this.set(uid, "history", list.slice(0, 80));
    },
    stats(uid) { return this.get(uid, "stats", { opens: {} }); },
    bump(uid, id) {
      const s = this.stats(uid);
      s.opens[id] = (s.opens[id] || 0) + 1;
      this.set(uid, "stats", s);
      const g = JSON.parse(localStorage.getItem("nt_global_opens") || "{}");
      g[id] = (g[id] || 0) + 1;
      localStorage.setItem("nt_global_opens", JSON.stringify(g));
    },
    globalOpens() { try { return JSON.parse(localStorage.getItem("nt_global_opens") || "{}"); } catch { return {}; } },
    recentSearch(uid) { return this.get(uid, "rsearch", []); },
    pushSearch(uid, q) {
      if (!q) return;
      const list = this.recentSearch(uid).filter((x) => x !== q);
      list.unshift(q);
      this.set(uid, "rsearch", list.slice(0, 8));
    }
  };
  window.NTStore = Store;
})();
