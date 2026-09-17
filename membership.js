(function () {
  const LS = "nt_pay_proofs_v1";
  const LS_BUG = "nt_bugs_v1";

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  }
  function save(key, v) { localStorage.setItem(key, JSON.stringify(v)); }

  const M = {
    plans() { return window.NT_CONFIG.vipPlans || []; },
    plan(id) { return M.plans().find((p) => p.id === id); },

    proofs() { return load(LS); },
    submitProof(row) {
      const list = load(LS);
      list.unshift({
        id: "pay_" + Date.now(),
        status: "pending",
        at: Date.now(),
        ...row
      });
      save(LS, list);
      return list[0];
    },
    setProofStatus(id, status, note) {
      const list = load(LS).map((x) => x.id === id ? { ...x, status, note, reviewedAt: Date.now() } : x);
      save(LS, list);
    },

    bugs() { return load(LS_BUG); },
    addBug(row) {
      const list = load(LS_BUG);
      list.unshift({ id: "bug_" + Date.now(), at: Date.now(), ...row });
      save(LS_BUG, list);
    },

    remainText(user) {
      if (!user) return "Member";
      if (user.role === "owner") return "Owner";
      if (user.plan === "vip-perm" || user.permanent) return "VIP Permanen";
      if (user.vipUntil && user.vipUntil > Date.now()) {
        const ms = user.vipUntil - Date.now();
        const d = Math.floor(ms / 86400000);
        const h = Math.floor((ms % 86400000) / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        if (d > 0) return "VIP " + d + " hari " + h + " jam";
        return "VIP " + h + " jam " + m + " menit";
      }
      return "member";
    }
  };
  window.NTMember = M;
})();
