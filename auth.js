(function () {
  const CFG = window.NT_CONFIG;
  const LS_USERS = "nt_users_v1";
  const LS_SESSION = "nt_session_v1";
  const LS_SEQ = "nt_member_seq_v1";
  const LS_BOOK = "nt_account_book_v1";

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); } catch { return []; }
  }
  function saveUsers(list) { localStorage.setItem(LS_USERS, JSON.stringify(list)); }

  function book() {
    try { return JSON.parse(localStorage.getItem(LS_BOOK) || "[]"); } catch { return []; }
  }
  function saveBook(list) { localStorage.setItem(LS_BOOK, JSON.stringify(list)); }

  function rememberBook(user) {
    const list = book().filter((x) => x.uid !== user.uid && x.username !== user.username);
    list.unshift({
      uid: user.uid,
      username: user.username || user.name,
      passwordPlain: user.passwordPlain || "",
      role: user.role,
      last: Date.now()
    });
    saveBook(list.slice(0, 20));
  }

  function firebaseReady() {
    return !!(CFG.firebaseEnabled && CFG.firebaseConfig && CFG.firebaseConfig.apiKey && !String(CFG.firebaseConfig.apiKey).startsWith("YOUR_") && window.firebase);
  }

  function initFirebase() {
    if (!firebaseReady()) return null;
    if (!firebase.apps.length) firebase.initializeApp(CFG.firebaseConfig);
    return firebase.auth();
  }

  function makePublicId() {
    const n = Date.now().toString(36).toUpperCase().slice(-4);
    const r = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(2, 6);
    return "NL-" + n + r;
  }

  function ensureIds(user) {
    if (!user) return user;
    if (!user.publicId) {
      const used = new Set(loadUsers().map((u) => u.publicId).filter(Boolean));
      let id = makePublicId();
      while (used.has(id)) id = makePublicId();
      user.publicId = id;
    }
    if (!user.createdAt) user.createdAt = Date.now();
    if (!user.photoURL) user.photoURL = "assets/akun.jpg";
    return user;
  }

  function sessionOf(user) {
    user = ensureIds(user || {});
    return {
      uid: user.uid,
      publicId: user.publicId,
      name: user.name,
      username: user.username || user.name,
      email: user.email || "",
      photoURL: user.photoURL || "assets/akun.jpg",
      provider: user.provider || "local",
      role: user.role || "member",
      plan: user.plan || "free",
      vipUntil: user.vipUntil || 0,
      permanent: !!user.permanent,
      passwordPlain: user.passwordPlain || "",
      createdAt: user.createdAt
    };
  }

  function applyExpiry(user) {
    if (!user) return user;
    user = ensureIds(user);
    if (user.role === "owner" || user.role === "admin") return user;
    if (user.plan === "vip-perm" || user.permanent) return user;
    if (user.plan && user.plan !== "free" && user.vipUntil && Date.now() > user.vipUntil) {
      user.plan = "free";
      user.vipUntil = 0;
      user.permanent = false;
      if (user.role !== "owner" && user.role !== "admin") user.role = "member";
      try { persistUser(user); } catch (_) {}
    }
    return user;
  }

  function persistUser(updated) {
    const users = loadUsers();
    const i = users.findIndex((u) => u.uid === updated.uid || u.username === updated.username);
    if (i >= 0) users[i] = { ...users[i], ...updated };
    else users.push(updated);
    saveUsers(users);
    const cur = currentLocal();
    if (cur && cur.uid === updated.uid) {
      localStorage.setItem(LS_SESSION, JSON.stringify(sessionOf(users[i >= 0 ? i : users.length - 1])));
    }
  }

  function currentLocal() {
    try { return applyExpiry(JSON.parse(localStorage.getItem(LS_SESSION) || "null")); } catch { return null; }
  }

  async function seedOwner() {
    const users = loadUsers();
    const uname = CFG.owner.username;
    if (users.some((u) => u.username === uname || u.role === "owner")) return;
    const pass = CFG.owner.password;
    users.push({
      uid: "owner_nailong",
      publicId: "NL-OWNER01",
      name: uname,
      username: uname,
      email: CFG.owner.email,
      pass: await sha256(pass + ":nailong"),
      passwordPlain: pass,
      photoURL: "",
      createdAt: Date.now(),
      role: "owner",
      plan: "vip-perm",
      vipUntil: 0,
      permanent: true,
      provider: "local"
    });
    saveUsers(users);
  }

  function nextMemberName() {
    let n = Number(localStorage.getItem(LS_SEQ) || "0") + 1;
    localStorage.setItem(LS_SEQ, String(n));
    return { n, username: "Member free nailong #" + n };
  }

  const Auth = {
    mode() { return firebaseReady() ? "firebase" : "local"; },

    loadUsers, persistUser, book,

    roleLabel(user) {
      const u = applyExpiry(user || {});
      if (u.role === "owner") return "owner";
      if (u.role === "admin") return "admin";
      if (u.plan === "vip-perm" || u.permanent) return "VIP Permanen";
      if (u.plan && u.plan !== "free" && u.vipUntil > Date.now()) return "VIP";
      return "member";
    },

    isVip(user) {
      const u = applyExpiry(user || {});
      if (!u) return false;
      if (u.role === "owner" || u.role === "admin") return true;
      if (u.plan === "vip-perm" || u.permanent) return true;
      return !!(u.vipUntil && Date.now() < u.vipUntil);
    },

    async currentUser() {
      await seedOwner();
      if (firebaseReady()) {
        const auth = initFirebase();
        const u = auth.currentUser;
        if (!u) return currentLocal();
        return applyExpiry({
          uid: u.uid,
          name: u.displayName || (u.email || "User").split("@")[0],
          username: u.displayName || (u.email || "User").split("@")[0],
          email: u.email || "",
          photoURL: u.photoURL || "",
          provider: "firebase",
          role: (CFG.adminEmails || []).includes((u.email || "").toLowerCase()) ? "admin" : "member",
          plan: "free",
          vipUntil: 0
        });
      }
      const s = currentLocal();
      if (!s) return null;
      const fresh = loadUsers().find((u) => u.uid === s.uid);
      if (fresh) {
        const merged = applyExpiry({ ...fresh });
        persistUser(merged);
        return sessionOf(merged);
      }
      return applyExpiry(s);
    },

    async ensureAutoAccount() {
      await seedOwner();
      const cur = await Auth.currentUser();
      if (cur) return cur;
      return Auth.createFreeMember();
    },

    async createFreeMember() {
      const { username } = nextMemberName();
      const password = username;
      const user = {
        uid: "loc_" + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        publicId: makePublicId(),
        name: username,
        username,
        email: "member" + Date.now() + "@local.nailong",
        pass: await sha256(password + ":nailong"),
        passwordPlain: password,
        photoURL: "",
        createdAt: Date.now(),
        role: "member",
        plan: "free",
        vipUntil: 0,
        provider: "local"
      };
      const users = loadUsers();
      users.push(user);
      saveUsers(users);
      rememberBook(user);
      localStorage.setItem(LS_SESSION, JSON.stringify(sessionOf(user)));
      return sessionOf(user);
    },

    async register({ name, email, password, username }) {
      username = (username || name || "").trim();
      email = (email || "").trim().toLowerCase();
      name = (name || username).trim();
      if (!username) throw new Error("Username wajib diisi.");
      if (username.length < 3) throw new Error("Username minimal 3 karakter.");
      const users = loadUsers();
      if (users.some((u) => (u.username || "").toLowerCase() === username.toLowerCase())) {
        throw new Error("Username ini sudah digunakan.");
      }
      if (email && users.some((u) => u.email === email)) throw new Error("Email sudah digunakan.");
      if (!password || password.length < 4) throw new Error("Password minimal 4 karakter.");
      const user = {
        uid: "loc_" + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        publicId: makePublicId(),
        name, username,
        email: email || (username.replace(/\s+/g, ".").toLowerCase() + "@local.nailong"),
        pass: await sha256(password + ":nailong"),
        passwordPlain: password,
        photoURL: "",
        createdAt: Date.now(),
        role: "member",
        plan: "free",
        vipUntil: 0,
        provider: "local"
      };
      users.push(user);
      saveUsers(users);
      rememberBook(user);
      localStorage.setItem(LS_SESSION, JSON.stringify(sessionOf(user)));
      return sessionOf(user);
    },

    async login({ email, password, username }) {
      await seedOwner();
      const key = (username || email || "").trim();
      const users = loadUsers();
      const user = users.find((u) =>
        u.username === key ||
        u.email === key.toLowerCase() ||
        (u.name && u.name === key)
      );
      if (!user) throw new Error("Akun tidak ditemukan.");
      const hash = await sha256(password + ":nailong");
      if (hash !== user.pass && password !== user.passwordPlain && !(user.username === CFG.owner.username && password === CFG.owner.password)) {
        throw new Error("Password salah.");
      }
      const live = applyExpiry(user);
      persistUser(live);
      rememberBook({ ...live, passwordPlain: password });
      localStorage.setItem(LS_SESSION, JSON.stringify(sessionOf(live)));
      return sessionOf(live);
    },

    async switchTo(uid) {
      const user = loadUsers().find((u) => u.uid === uid);
      if (!user) throw new Error("Akun tidak ada.");
      const live = applyExpiry(user);
      persistUser(live);
      localStorage.setItem(LS_SESSION, JSON.stringify(sessionOf(live)));
      return sessionOf(live);
    },

    async forgot(email) {
      email = (email || "").trim().toLowerCase();
      if (firebaseReady()) {
        await initFirebase().sendPasswordResetEmail(email);
        return "Email reset terkirim.";
      }
      const users = loadUsers();
      const user = users.find((u) => u.email === email || u.username === email);
      if (!user) throw new Error("Akun tidak ditemukan.");
      return "Mode lokal: password saat ini ada di halaman Saya. Ganti dari situ.";
    },

    async logout() {
      if (firebaseReady()) try { await initFirebase().signOut(); } catch (_) {}
      localStorage.removeItem(LS_SESSION);
    },

    async changeUsername(next) {
      next = (next || "").trim();
      if (next.length < 3) throw new Error("Username minimal 3 karakter.");
      const user = await Auth.currentUser();
      if (!user) throw new Error("Belum masuk.");
      const users = loadUsers();
      if (users.some((u) => u.uid !== user.uid && (u.username || "").toLowerCase() === next.toLowerCase())) {
        throw new Error("Username ini sudah digunakan.");
      }
      const full = users.find((u) => u.uid === user.uid);
      full.username = next;
      full.name = next;
      persistUser(full);
      rememberBook(full);
      return sessionOf(full);
    },

    async changePassword(next) {
      next = (next || "").trim();
      if (next.length < 4) throw new Error("Password minimal 4 karakter.");
      const user = await Auth.currentUser();
      if (!user) throw new Error("Belum masuk.");
      const users = loadUsers();
      const full = users.find((u) => u.uid === user.uid);
      full.pass = await sha256(next + ":nailong");
      full.passwordPlain = next;
      persistUser(full);
      rememberBook(full);
      return sessionOf(full);
    },

    async grantVip(username, planId) {
      const actor = await Auth.currentUser();
      if (!actor || (actor.role !== "owner" && actor.role !== "admin")) {
        throw new Error("Hanya owner/admin.");
      }
      const plan = (CFG.vipPlans || []).find((p) => p.id === planId);
      if (!plan) throw new Error("Paket tidak ada.");
      const users = loadUsers();
      const full = users.find((u) => (u.username || "") === username || u.name === username);
      if (!full) throw new Error("Username tidak ditemukan.");
      full.plan = plan.id;
      full.permanent = !!plan.permanent;
      const days = Number(plan.days || plan.hours || 0);
      full.vipUntil = plan.permanent ? 0 : Date.now() + days * 24 * 3600 * 1000;
      full.role = full.role === "owner" ? "owner" : "member";
      persistUser(full);
      return full;
    },

    async updateProfile(patch) {
      const user = await Auth.currentUser();
      if (!user) throw new Error("Belum masuk.");
      const users = loadUsers();
      const i = users.findIndex((u) => u.uid === user.uid);
      if (i >= 0) {
        users[i] = { ...users[i], ...patch };
        saveUsers(users);
        localStorage.setItem(LS_SESSION, JSON.stringify(sessionOf(users[i])));
        return sessionOf(users[i]);
      }
      return user;
    }
  };

  window.NTAuth = Auth;
})();
