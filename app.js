(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $("#app");
  const REG = () => window.NT_REGISTRY;
  let USER = null;
  let STATE = { view: "home", cat: null, q: "", tool: null, filter: "all" };

  const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function tools() { return REG().tools; }
  function findTool(id) { return tools().find((t) => t.id === id); }
  function initials(name) { return (name || "N").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(); }

  function routeFromHash() {
    const h = (location.hash || "#/login").replace(/^#/, "");
    const parts = h.split("/").filter(Boolean);
    if (parts[0] === "tool" && parts[1]) return { view: "tool", tool: parts[1] };
    if (parts[0] === "pay" && parts[1]) return { view: "pay", q: parts[1] };
    if (parts[0] === "category" && parts[1]) return { view: "category", cat: decodeURIComponent(parts[1]) };
    if (["login", "register", "forgot", "home", "tools", "favorites", "history", "profile", "settings", "admin", "privacy", "terms", "about", "contact", "search", "upgrade", "bug", "apk", "pay", "accounts"].includes(parts[0])) {
      return { view: parts[0], q: decodeURIComponent(parts[1] || "") };
    }
    if (!parts.length) return { view: USER ? "home" : "login" };
    return { view: "notfound" };
  }

  function go(path) {
    if (!path.startsWith("#")) path = "#/" + path.replace(/^\//, "");
    location.hash = path.replace(/^#\/?/, "#/");
  }

  async function requireUser(view) {
    const publicViews = ["login", "register", "forgot", "privacy", "terms", "about", "contact", "accounts"];
    USER = await NTAuth.currentUser();
    if (!USER && !publicViews.includes(view)) {
      USER = await NTAuth.ensureAutoAccount();
    }
    if (USER && ["login", "register", "forgot"].includes(view)) {
      /* allow login page to switch account */
    }
    if (USER) USER = await NTAuth.currentUser();
    return true;
  }

  /* ---------------- AUTH UI ---------------- */
  function authShell(inner) {
    return `<div class="auth-wrap"><div class="auth-card">
      <div class="brand-mark"><div class="logo-box">N</div>
        <div class="brand-title">NAILONG<br>TOOLS<small>v148.027.00</small></div>
      </div>${inner}</div></div>`;
  }

  function viewLogin() {
    app.innerHTML = authShell(`
      <h1>Login</h1>
      <p class="sub">Sign in to open NAILONG TOOLS</p>
      <div id="msg"></div>
      <div class="field"><label>Username / Email</label><input id="email" autocomplete="username" placeholder="NailongOwner atau username"></div>
      <div class="field"><label>Password</label><input id="pass" type="password" autocomplete="current-password"></div>
      <div class="auth-links"><button class="btn-link" data-go="forgot">Forgot password?</button><button class="btn-link" data-go="register">Create account</button></div>
      <button class="btn btn-primary" id="doLogin">Login</button>
      <button class="btn btn-ghost" id="doGoogle"><i class="fa-brands fa-google"></i> Login with Google</button>
      <p class="sub" style="margin-top:14px">Auth mode: ${NTAuth.mode() === "firebase" ? "Firebase" : "Local browser profile (add Firebase config to enable Google & email reset)"}</p>
    `);
    $("#doLogin").onclick = async () => {
      try {
        showMsg("Signing in...", "info");
        await NTAuth.login({ username: $("#email").value, email: $("#email").value, password: $("#pass").value });
        await playBoot();
        go("home");
      } catch (e) { showMsg(e.message || String(e), "err"); }
    };
    $("#doGoogle").onclick = async () => {
      try {
        await NTAuth.google();
        await playBoot();
        go("home");
      } catch (e) { showMsg(e.message || String(e), "err"); }
    };
  }

  function viewRegister() {
    app.innerHTML = authShell(`
      <h1>Create account</h1>
      <p class="sub">Register for NAILONG TOOLS</p>
      <div id="msg"></div>
      <div class="field"><label>Name</label><input id="name" autocomplete="name"></div>
      <div class="field"><label>Email</label><input id="email" type="email" autocomplete="email"></div>
      <div class="field"><label>Password</label><input id="pass" type="password" autocomplete="new-password"></div>
      <div class="field"><label>Confirm password</label><input id="pass2" type="password" autocomplete="new-password"></div>
      <button class="btn btn-primary" id="doReg">Create account</button>
      <button class="btn btn-ghost" id="doGoogle"><i class="fa-brands fa-google"></i> Login with Google</button>
      <p class="sub" style="margin-top:12px">Already have an account? <button class="btn-link" data-go="login">Login</button></p>
    `);
    $("#doReg").onclick = async () => {
      try {
        if ($("#pass").value !== $("#pass2").value) throw new Error("Passwords do not match.");
        showMsg("Creating account...", "info");
        await NTAuth.register({ name: $("#name").value, email: $("#email").value, password: $("#pass").value });
        await playBoot();
        go("home");
      } catch (e) { showMsg(e.message || String(e), "err"); }
    };
    $("#doGoogle").onclick = async () => {
      try { await NTAuth.google(); await playBoot(); go("home"); }
      catch (e) { showMsg(e.message || String(e), "err"); }
    };
  }

  function viewForgot() {
    app.innerHTML = authShell(`
      <h1>Forgot password</h1>
      <p class="sub">Enter your email to receive a reset link.</p>
      <div id="msg"></div>
      <div class="field"><label>Email</label><input id="email" type="email"></div>
      <button class="btn btn-primary" id="doSend">Send reset email</button>
      <p class="sub" style="margin-top:12px"><button class="btn-link" data-go="login">Back to login</button></p>
    `);
    $("#doSend").onclick = async () => {
      try {
        const m = await NTAuth.forgot($("#email").value);
        showMsg(m, "ok");
      } catch (e) { showMsg(e.message || String(e), "err"); }
    };
  }

  function showMsg(text, type) {
    const el = $("#msg");
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type}">${escapeHtml(text)}</div>`;
  }

  function playBoot() {
    return new Promise((resolve) => {
      const steps = ["Checking account...", "Account verified", "Welcome", "Loading tools...", "NAILONG TOOLS"];
      const wrap = document.createElement("div");
      wrap.className = "boot";
      wrap.innerHTML = `<div class="boot-inner"><div class="ring"></div><h2 id="bt">Checking account...</h2><p>v148.027.00</p><div class="bar"><i id="bp"></i></div></div>`;
      document.body.appendChild(wrap);
      let i = 0;
      const tick = () => {
        i++;
        const t = $("#bt", wrap);
        const b = $("#bp", wrap);
        if (t) t.textContent = steps[Math.min(i, steps.length - 1)];
        if (b) b.style.width = Math.min(100, (i / (steps.length - 1)) * 100) + "%";
        if (i >= steps.length - 1) setTimeout(() => { wrap.remove(); resolve(); }, 350);
        else setTimeout(tick, 280);
      };
      setTimeout(tick, 280);
    });
  }

  /* ---------------- APP SHELL ---------------- */
  function shell(html) {
    const name = USER?.name || "User";
    return `<header class="topbar">
      <div class="brand" data-go="home"><div class="logo-box" style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#ffd000,#ff7a18);display:grid;place-items:center;color:#111;font-weight:800">N</div>
        <div>NAILONG TOOLS<b>v148.027.00</b></div></div>
      <div class="search-mini"><i class="fa-solid fa-magnifying-glass"></i><input id="topSearch" placeholder="Search tools... (/ )"></div>
      <div style="flex:1"></div>
      <button class="icon-btn" data-go="settings" title="Settings"><i class="fa-solid fa-gear"></i></button>
      <div class="userchip" data-go="profile"><div class="avatar">${USER?.photoURL ? `<img src="${escapeHtml(USER.photoURL)}">` : initials(name)}</div><span class="hide-sm">${escapeHtml(USER?.username || name)}</span></div>
      <button class="hamburger" id="openMenu" title="Menu" type="button"><b></b><b></b><b></b></button>
    </header>
    <div class="layout">
      <aside class="sidebar">
        ${navItem("home","fa-house","Home")}
        ${navItem("tools","fa-wrench","Tools")}
        ${navItem("favorites","fa-star","Favorites")}
        ${navItem("history","fa-clock-rotate-left","History")}
        ${navItem("profile","fa-user","Profile")}
        ${navItem("settings","fa-sliders","Settings")}
        ${USER?.role === "admin" ? navItem("admin","fa-shield","Admin") : ""}
        <div style="height:12px"></div>
        ${navItem("about","fa-circle-info","About")}
        ${navItem("privacy","fa-lock","Privacy")}
        ${navItem("terms","fa-file-lines","Terms")}
        ${navItem("contact","fa-envelope","Contact")}
      </aside>
      <main class="content">${html}
        <footer class="site">
          <div class="fgrid">
            <span>NAILONG TOOLS v148.027.00</span>
            <span>All-in-One Online Tools</span>
            <a href="#/about">About</a><a href="#/tools">Tools</a>
            <a href="#/privacy">Privacy Policy</a><a href="#/terms">Terms</a><a href="#/contact">Contact</a>
          </div>
          <div>© ${new Date().getFullYear()} NAILONG TOOLS. Local processing preferred. Connect Firebase for cloud accounts.</div>
        </footer>
      </main>
    </div>
    <nav class="bottomnav">
      <button class="bn ${STATE.view==="home"?"active":""}" data-go="home"><i class="fa-solid fa-house"></i>Home</button>
      <button class="bn ${STATE.view==="tools"||STATE.view==="category"?"active":""}" data-go="tools"><i class="fa-solid fa-wrench"></i>Tools</button>
      <button class="bn ${STATE.view==="favorites"?"active":""}" data-go="favorites"><i class="fa-solid fa-star"></i>Favorites</button>
      <button class="bn ${STATE.view==="history"?"active":""}" data-go="history"><i class="fa-solid fa-clock"></i>History</button>
      <button class="bn ${STATE.view==="profile"?"active":""}" data-go="profile"><i class="fa-solid fa-user"></i>Profile</button>
    </nav>`;
  }
  function navItem(id, icon, label) {
    return `<div class="nav-item ${STATE.view===id?"active":""}" data-go="${id}"><i class="fa-solid ${icon}"></i>${label}</div>`;
  }

  function cardHTML(t) {
    const favs = NTStore.favs(USER?.uid);
    const on = favs.includes(t.id);
    return `<article class="card" data-open="${t.id}">
      <div class="ico"><i class="${t.icon || "fa-solid fa-wrench"}"></i></div>
      <h4>${escapeHtml(t.name)}</h4>
      <p>${escapeHtml(t.description)}</p>
      <div class="meta">
        <span class="badge">${escapeHtml(t.category)}</span>
        ${t.premium ? `<span class="badge pro">PRO</span>` : `<span class="badge">Free</span>`}
      </div>
      <div class="row-actions">
        <button class="fav ${on?"on":""}" data-fav="${t.id}" title="Favorite">★</button>
        <button class="btn-sm" data-open="${t.id}">Open Tool</button>
      </div>
    </article>`;
  }

  function searchTools(q, filter, cat) {
    q = (q || "").trim().toLowerCase();
    let list = tools();
    if (cat) list = list.filter((t) => t.category === cat);
    if (filter === "free") list = list.filter((t) => !t.premium);
    if (filter === "pro") list = list.filter((t) => t.premium);
    if (filter === "newest") list = list.filter((t) => t.newest);
    if (filter === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (filter === "used") {
      const g = NTStore.globalOpens();
      list = [...list].sort((a, b) => (g[b.id] || 0) - (g[a.id] || 0));
    }
    if (!q) return list;
    return list.filter((t) => (t.name + " " + t.description + " " + t.category + " " + (t.keywords || "") + " " + t.id).toLowerCase().includes(q));
  }

  function popularTools() {
    const g = NTStore.globalOpens();
    return [...tools()].sort((a, b) => {
      const pa = (g[a.id] || 0) + (a.popular ? 50 : 0);
      const pb = (g[b.id] || 0) + (b.popular ? 50 : 0);
      return pb - pa;
    }).slice(0, 8);
  }

  /* ---------------- VIEWS ---------------- */
  function viewHome() {
    const recent = NTStore.history(USER.uid).map((h) => findTool(h.id)).filter(Boolean).slice(0, 6);
    const cats = REG().categories;
    const html = `
      <section class="banner" id="bannerBox">
        <video id="heroVid" autoplay muted loop playsinline webkit-playsinline preload="metadata"
          poster="assets/banner/poster.jpg" disablepictureinpicture>
          <source src="assets/banner/nailong-banner.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        <div class="caption">
          <h2>NAILONG TOOLS</h2>
          <p>All-in-One Online Tools · ${tools().length} ready tools · v148.027.00</p>
        </div>
      </section>
      <div class="status-wrap" id="statusBar"></div>
      <div class="hero-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="mainSearch" placeholder="Search tools..." value="${escapeHtml(STATE.q || "")}">
        <div class="filters">
          ${["all","free","pro","used","newest","az"].map((f) => `<button class="chip ${STATE.filter===f?"active":""}" data-filter="${f}">${f==="az"?"A–Z":f==="used"?"Most used":f[0].toUpperCase()+f.slice(1)}</button>`).join("")}
        </div>
      </div>
      <div class="section-h"><h3>Popular Tools</h3></div>
      <div class="grid">${popularTools().map(cardHTML).join("")}</div>
      ${recent.length ? `<div class="section-h" style="margin-top:22px"><h3>Recently Used</h3></div><div class="grid">${recent.map(cardHTML).join("")}</div>` : ""}
      <div class="section-h" style="margin-top:22px"><h3>Categories</h3></div>
      <div class="cat-grid">${cats.map((c) => {
        const n = tools().filter((t) => t.category === c).length;
        return `<div class="cat" data-cat="${escapeHtml(c)}"><b>${escapeHtml(c)}</b><span>${n} tools</span></div>`;
      }).join("")}</div>
      <div class="section-h"><h3>New Tools</h3></div>
      <div class="grid">${tools().filter((t)=>t.newest).slice(0,8).map(cardHTML).join("")}</div>
    `;
    app.innerHTML = shell(html);
    bindShell();
    setupBanner();
    fillStatusBar();
    const ms = $("#mainSearch");
    if (ms) {
      ms.addEventListener("input", () => {
        STATE.q = ms.value;
        if (ms.value.trim()) renderSearchLive(ms.value);
      });
      ms.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && ms.value.trim()) {
          NTStore.pushSearch(USER.uid, ms.value.trim());
          go("search/" + encodeURIComponent(ms.value.trim()));
        }
      });
    }
  }

  function renderSearchLive(q) {
    const box = $(".grid");
    if (!box) return;
    const list = searchTools(q, STATE.filter).slice(0, 24);
    box.innerHTML = list.length ? list.map(cardHTML).join("") : `<p class="sub">No tools match “${escapeHtml(q)}”.</p>`;
    bindCards();
  }

  function setupBanner() {
    const v = $("#heroVid");
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.autoplay = true;
    v.controls = false;
    v.setAttribute("playsinline", "");
    const kick = () => { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    v.addEventListener("pause", () => { if (!v.ended) kick(); });
    v.addEventListener("ended", kick);
    v.addEventListener("stalled", kick);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
    kick();
  }

  function viewTools() {
    const list = searchTools(STATE.q, STATE.filter, STATE.cat);
    const html = `<div class="section-h"><h3>${STATE.cat || "All Tools"}</h3><span class="badge">${list.length}</span></div>
      <div class="hero-search"><i class="fa-solid fa-magnifying-glass"></i>
        <input id="mainSearch" placeholder="Search tools..." value="${escapeHtml(STATE.q||"")}">
        <div class="filters">${REG().categories.map((c)=>`<button class="chip ${STATE.cat===c?"active":""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}</div>
      </div>
      <div class="grid">${list.map(cardHTML).join("")}</div>`;
    app.innerHTML = shell(html);
    bindShell();
    $("#mainSearch")?.addEventListener("input", (e) => { STATE.q = e.target.value; viewTools(); });
  }

  function viewFavorites() {
    const ids = NTStore.favs(USER.uid);
    const list = ids.map(findTool).filter(Boolean);
    app.innerHTML = shell(`<div class="section-h"><h3>Favorites</h3></div>
      ${list.length ? `<div class="grid">${list.map(cardHTML).join("")}</div>` : `<div class="empty"><p>No favorites yet. Tap ★ on any tool.</p></div>`}`);
    bindShell();
  }

  function viewHistory() {
    const items = NTStore.history(USER.uid);
    app.innerHTML = shell(`<div class="section-h"><h3>History</h3>
      <button class="btn-sm" id="clrHist">Clear history</button></div>
      ${items.length ? `<div class="grid">${items.map((h)=>{const t=findTool(h.id);return t?cardHTML(t):""}).join("")}</div>` : `<div class="empty"><p>No history yet.</p></div>`}`);
    bindShell();
    $("#clrHist")?.addEventListener("click", () => { NTStore.set(USER.uid, "history", []); render(); });
  }

  function viewProfile() {
    const favs = NTStore.favs(USER.uid).length;
    const hist = NTStore.history(USER.uid).length;
    const vip = NTAuth.isVip(USER);
    const remain = NTMember.remainText(USER);
    const book = NTAuth.book();
    app.innerHTML = shell(`<div class="tool-head"><div class="avatar" style="width:64px;height:64px;font-size:22px">${initials(USER.username || USER.name)}</div>
      <div><h2>${escapeHtml(USER.username || USER.name)}</h2>
      <p class="sub">${escapeHtml(remain)} · ${escapeHtml(USER.uid)}</p></div></div>
      <div class="stat-row">
        <div class="stat"><b>${favs}</b><span>Favorites</span></div>
        <div class="stat"><b>${hist}</b><span>History</span></div>
        <div class="stat"><b>${escapeHtml(NTAuth.roleLabel(USER))}</b><span>Role</span></div>
        <div class="stat"><b>${vip ? "VIP" : "Free"}</b><span>Membership</span></div>
      </div>
      <div class="panel">
        <h3>Username</h3>
        <p class="sub">Username sekarang ditampilkan di bawah. Jika sudah dipakai orang lain, akan ada peringatan.</p>
        <div class="field"><label>Username sekarang</label><input id="curUser" value="${escapeHtml(USER.username || USER.name)}" readonly></div>
        <div class="field"><label>Username baru</label><input id="newUser" placeholder="Username baru"></div>
        <button class="btn btn-primary" id="saveUser" style="max-width:240px">Ganti username</button>
        <div id="userMsg"></div>
      </div>
      <div class="panel">
        <h3>Password</h3>
        <p class="sub">Password saat ini ditampilkan supaya tidak lupa. Setelah diganti, yang lama hilang dan yang baru yang tampil.</p>
        <div class="field"><label>Password sekarang</label><input id="curPass" value="${escapeHtml(USER.passwordPlain || "(tersimpan di perangkat ini)")}"></div>
        <div class="field"><label>Password baru</label><input id="newPass" placeholder="Password baru"></div>
        <button class="btn btn-primary" id="savePass" style="max-width:240px">Ganti password</button>
        <div id="passMsg"></div>
      </div>
      <div class="panel">
        <h3>Akun di perangkat ini</h3>
        <p class="sub">Logout tidak menghapus akun lama. Kamu bisa pindah akun.</p>
        ${book.map((a)=>`<div class="sheet-item" data-switch="${escapeHtml(a.uid)}"><i class="fa-solid fa-user"></i><div><b>${escapeHtml(a.username)}</b><div class="sub">${a.uid===USER.uid?"Sedang dipakai":"Ketuk untuk ganti akun"}</div></div></div>`).join("") || "<p class='sub'>Belum ada daftar akun.</p>"}
        <button class="btn btn-ghost" id="newAcc" style="max-width:260px">Buat akun free baru</button>
        <button class="btn btn-ghost" id="logout" style="max-width:260px">Logout</button>
      </div>
      <div class="panel">
        <button class="btn btn-primary" data-go="upgrade">Upgrade VIP</button>
      </div>`);
    bindShell();
    $("#saveUser").onclick = async () => {
      try {
        await NTAuth.changeUsername($("#newUser").value);
        toast("Username diganti");
        USER = await NTAuth.currentUser();
        render();
      } catch (e) {
        $("#userMsg").innerHTML = `<div class="alert alert-err">${escapeHtml(e.message)}</div>`;
      }
    };
    $("#savePass").onclick = async () => {
      try {
        await NTAuth.changePassword($("#newPass").value);
        toast("Password diganti. Password lama sudah tidak dipakai.");
        USER = await NTAuth.currentUser();
        render();
      } catch (e) {
        $("#passMsg").innerHTML = `<div class="alert alert-err">${escapeHtml(e.message)}</div>`;
      }
    };
    $$("[data-switch]").forEach((el) => el.onclick = async () => {
      await NTAuth.switchTo(el.getAttribute("data-switch"));
      USER = await NTAuth.currentUser();
      await playBoot();
      go("home");
    });
    $("#newAcc").onclick = async () => {
      await NTAuth.logout();
      USER = await NTAuth.createFreeMember();
      await playBoot();
      go("home");
    };
    $("#logout").onclick = async () => { await NTAuth.logout(); go("accounts"); };
  }

  function viewSettings() {
    app.innerHTML = shell(`<h2>Settings</h2>
      <div class="panel"><h3>Theme</h3><p class="sub">Main theme is dark black + yellow + orange.</p></div>
      <div class="panel"><h3>Language</h3><p class="sub">Interface language: English / Indonesian labels can be added later.</p></div>
      <div class="panel"><h3>Account</h3><p class="sub">Auth mode: ${NTAuth.mode()}</p>
        <button class="btn btn-ghost" id="logout" style="max-width:220px;margin-top:8px">Logout</button></div>
      <div class="panel"><h3>Privacy</h3><p class="sub">Most file tools run in your browser. Files are not uploaded unless a server tool is configured.</p></div>`);
    bindShell();
    $("#logout").onclick = async () => { await NTAuth.logout(); go("login"); };
  }

  function viewAdmin() {
    if (USER.role !== "admin" && USER.role !== "owner") {
      app.innerHTML = shell(`<div class="empty"><h2>403</h2><p>Admin only.</p></div>`);
      bindShell(); return;
    }
    const g = NTStore.globalOpens();
    const top = Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,10);
    app.innerHTML = shell(`<h2>Admin</h2>
      <div class="stat-row">
        <div class="stat"><b>${tools().length}</b><span>Tools in registry</span></div>
        <div class="stat"><b>${NTAuth.mode()}</b><span>Auth</span></div>
      </div>
      <div class="panel"><h3>Most opened (this browser)</h3>
        ${top.length ? top.map(([id,n])=>`<div>${escapeHtml(findTool(id)?.name||id)} — ${n}</div>`).join("") : "<p class='sub'>No stats yet.</p>"}
      </div>
      <div class="panel"><h3>Maintenance</h3>
        <p class="sub">Toggle NT_CONFIG.maintenance in js/config.js then deploy. Admin can still open the app.</p>
      </div>
      <div class="panel"><h3>Add a tool</h3>
        <p class="sub">Edit js/registry.js or scripts/generate_registry.py then add a kind handler in js/app.js / js/engines.js.</p>
      </div>
      <div class="panel">
        <h3>Aktifkan VIP username</h3>
        <div class="field"><label>Username member</label><input id="vipUser" class="input" placeholder="Member free nailong #1"></div>
        <div class="field"><label>Paket</label>
          <select id="vipPlan" class="input">${NTMember.plans().map((p)=>`<option value="${p.id}">${p.name} — ${p.label}</option>`).join("")}</select>
        </div>
        <button class="btn btn-primary" id="grantVip" style="max-width:240px">Jadikan VIP</button>
        <div id="grantMsg"></div>
      </div>
      <div class="panel">
        <h3>Bukti transfer</h3>
        ${NTMember.proofs().map((x)=>`<div class="plan-card"><div><b>${escapeHtml(x.username)}</b><div class="sub">${escapeHtml(x.planName)} · ${escapeHtml(x.status)} · ${new Date(x.at).toLocaleString()}</div>
          ${x.image?`<img src="${x.image}" alt="bukti" style="max-width:160px;border-radius:10px;margin-top:8px">`:""}</div>
          <div><button class="btn-sm" data-ok="${x.id}" data-plan="${escapeHtml(x.planId)}" data-user="${escapeHtml(x.username)}">Aktifkan</button></div></div>`).join("") || "<p class='sub'>Belum ada bukti.</p>"}
      </div>
      <div class="panel">
        <h3>Laporan bug</h3>
        ${NTMember.bugs().slice(0,20).map((b)=>`<div class="sub" style="margin:8px 0"><b>${escapeHtml(b.username||"")}</b> — ${escapeHtml(b.text)}</div>`).join("") || "<p class='sub'>Tidak ada laporan.</p>"}
      </div>`);
    bindShell();
    $("#grantVip").onclick = async () => {
      try {
        await NTAuth.grantVip($("#vipUser").value.trim(), $("#vipPlan").value);
        $("#grantMsg").innerHTML = `<div class="alert alert-ok">VIP diaktifkan.</div>`;
      } catch (e) {
        $("#grantMsg").innerHTML = `<div class="alert alert-err">${escapeHtml(e.message)}</div>`;
      }
    };
    $$("[data-ok]").forEach((btn) => btn.onclick = async () => {
      try {
        await NTAuth.grantVip(btn.getAttribute("data-user"), btn.getAttribute("data-plan"));
        NTMember.setProofStatus(btn.getAttribute("data-ok"), "aktif");
        toast("VIP aktif");
        render();
      } catch (e) { toast(e.message); }
    });
  }

  function staticPage(title, body) {
    app.innerHTML = shell(`<div class="tool-page"><h2>${title}</h2><div class="panel">${body}</div></div>`);
    bindShell();
  }

  /* ---------------- TOOL UI ---------------- */
  function viewTool(id) {
    const t = findTool(id);
    if (!t) {
      app.innerHTML = shell(`<div class="empty"><h2>404</h2><p>Tool not found.</p><button class="btn-sm" data-go="home">Back to Home</button></div>`);
      bindShell(); return;
    }
    NTStore.pushHistory(USER.uid, t.id);
    NTStore.bump(USER.uid, t.id);
    const favOn = NTStore.favs(USER.uid).includes(t.id);
    const body = toolBody(t);
    app.innerHTML = shell(`<div class="tool-page">
      <div class="tool-head">
        <div class="ico" style="width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:#1a160c;color:var(--yellow)"><i class="${t.icon}"></i></div>
        <div style="flex:1">
          <h2>${escapeHtml(t.name)}</h2>
          <p class="sub">${escapeHtml(t.description)}</p>
          <span class="badge">${escapeHtml(t.category)}</span>
        </div>
        <button class="fav ${favOn?"on":""}" data-fav="${t.id}">★</button>
        <button class="btn-sm" id="shareTool">Share</button>
      </div>
      ${body}
    </div>`);
    bindShell();
    $("#shareTool")?.addEventListener("click", async () => {
      const url = location.origin + location.pathname + "#/tool/" + t.id;
      try { await navigator.clipboard.writeText(url); alert("Link copied"); } catch { prompt("Copy link", url); }
    });
    wireTool(t);
  }

  function fieldText(id, label, ph) {
    return `<div class="panel"><label>${label}</label><textarea class="tall" id="${id}" placeholder="${ph || ""}"></textarea></div>`;
  }
  function actions(extra = "") {
    return `<div class="actions">
      <button class="btn-sm" id="run">Process</button>
      <button class="btn-sm" id="copyBtn" style="background:#222;color:#fff">Copy</button>
      <button class="btn-sm" id="dlBtn" style="background:#222;color:#fff">Download</button>
      <button class="btn-sm" id="clearBtn" style="background:#222;color:#fff">Clear</button>
      ${extra}
    </div>`;
  }

  function toolBody(t) {
    const k = t.kind;
    if (k.startsWith("image-") || ["image-compress","image-resize","image-crop","image-rotate","image-flip","image-convert","image-base64","image-filter","image-watermark","image-info","image-picker","image-border","image-bg","image-favicon","image-pixelate","image-round"].includes(k)) {
      return `<div class="panel"><div class="drop" id="drop">Drop image here or <input type="file" id="file" accept="image/*"></div>
        <div id="opts"></div>
        ${actions()}
        <div id="status" class="sub"></div>
        <div id="preview"></div></div>`;
    }
    if (k.startsWith("pdf") || k === "images-pdf" || k === "text-pdf") {
      return `<div class="panel"><div class="drop" id="drop">Drop PDF/images here or <input type="file" id="file" multiple></div>
        <div id="opts"></div>${actions()}<div id="status" class="sub"></div></div>`;
    }
    if (k === "media-info" || k === "video-thumb" || k === "audio-preview" || k === "file-info" || k === "file-hash" || k === "file-b64") {
      return `<div class="panel"><div class="drop" id="drop">Drop a file here or <input type="file" id="file"></div>
        ${actions()}<div id="status" class="sub"></div><div id="preview"></div></div>`;
    }
    if (k.startsWith("calc-") || k.startsWith("unit-") || k === "gpa" || k === "grade" || k === "fraction" || k === "calc-aspect") {
      return `<div class="panel" id="calcBox"></div><div class="panel"><div class="out" id="out"></div></div>`;
    }
    if (["todo","notes","habits","expense","checklist"].includes(k)) {
      return `<div class="panel" id="appBox"></div>`;
    }
    if (["stopwatch","timer","countdown","pomodoro","worldclock"].includes(k)) {
      return `<div class="panel" id="appBox"></div>`;
    }
    if (k === "ai") {
      return `<div class="alert alert-info">AI tools need a server function at <code>/api/ai</code> and an environment secret. They will not pretend to answer if the API is missing.</div>
        ${fieldText("inp","Input","Type your text or topic...")}
        <div class="panel"><label>Style</label><select id="style" class="input"><option>Neutral</option><option>Professional</option><option>Simple</option></select></div>
        ${actions()}<div class="panel"><div class="out" id="out"></div></div>`;
    }
    if (k === "qr" || k.startsWith("qr-") || k === "barcode") {
      return `${fieldText("inp","Content","Text or URL")}
        <div class="panel" id="extra"></div>${actions()}<div class="panel" id="preview"></div>`;
    }
    return `${fieldText("inp","Input")}
      <div class="panel" id="extra"></div>
      ${actions()}
      <div class="panel"><div class="out" id="out"></div></div>`;
  }

  function wireTool(t) {
    const k = t.kind;
    const out = $("#out");
    const inp = $("#inp");
    const setOut = (v) => { if (out) out.textContent = v; };
    const status = (m) => { const s = $("#status"); if (s) s.textContent = m; };

    $("#clearBtn")?.addEventListener("click", () => {
      if (inp) inp.value = "";
      if (out) out.textContent = "";
      const p = $("#preview"); if (p) p.innerHTML = "";
    });
    $("#copyBtn")?.addEventListener("click", async () => {
      const text = out ? out.textContent : "";
      if (!text) return;
      await NTEngine.copy(text);
      $("#copyBtn").textContent = "Copied!";
      setTimeout(() => $("#copyBtn").textContent = "Copy", 1000);
    });
    $("#dlBtn")?.addEventListener("click", () => {
      const text = out ? out.textContent : "";
      if (text) NTEngine.downloadText(text, t.id + ".txt");
    });

    // IMAGE family
    if ($("#file") && (k.startsWith("image") || ["image-compress","image-resize","image-crop","image-rotate","image-flip","image-convert","image-base64","image-filter","image-watermark","image-info","image-picker","image-border","image-bg","image-favicon","image-pixelate","image-round"].includes(k))) {
      const opts = $("#opts");
      if (k === "image-compress") opts.innerHTML = `<label>Quality</label><input id="q" type="range" min="0.3" max="0.95" step="0.05" value="0.7">`;
      if (k === "image-resize") opts.innerHTML = `<div class="field"><label>Width</label><input id="w" class="input" type="number" value="800"></div><div class="field"><label>Height</label><input id="h" class="input" type="number" value="600"></div>`;
      if (k === "image-rotate") opts.innerHTML = `<select id="deg" class="input"><option>90</option><option>180</option><option>270</option></select>`;
      if (k === "image-flip") opts.innerHTML = `<select id="dir" class="input"><option value="h">Horizontal</option><option value="v">Vertical</option></select>`;
      if (k === "image-convert" || t.id.includes("to-")) {
        let def = "image/png";
        if (t.id.endsWith("jpg") || t.id.includes("to-jpg")) def = "image/jpeg";
        if (t.id.includes("webp")) def = "image/webp";
        opts.innerHTML = `<select id="mime" class="input"><option value="image/jpeg" ${def==="image/jpeg"?"selected":""}>JPG</option><option value="image/png" ${def==="image/png"?"selected":""}>PNG</option><option value="image/webp" ${def==="image/webp"?"selected":""}>WEBP</option></select>`;
      }
      if (k === "image-filter") {
        const map = { "image-blur":"blur(4px)","image-grayscale":"grayscale(1)","image-brightness":"brightness(1.3)","image-contrast":"contrast(1.3)","image-saturation":"saturate(1.6)","image-sepia":"sepia(1)","image-invert":"invert(1)","image-opacity":"opacity(.6)" };
        opts.innerHTML = `<input id="filt" class="input" value="${map[t.id] || "grayscale(1)"}">`;
      }
      if (k === "image-watermark") opts.innerHTML = `<input id="wm" class="input" placeholder="Watermark text" value="NAILONG TOOLS">`;
      if (k === "image-border" || k === "image-bg") opts.innerHTML = `<input id="col" class="input" value="#ffd000"><input id="pad" class="input" type="number" value="24">`;
      if (k === "image-pixelate") opts.innerHTML = `<label>Block</label><input id="block" class="input" type="number" value="12">`;
      if (k === "image-round") opts.innerHTML = `<input id="rad" class="input" type="number" value="40">`;

      $("#run").onclick = async () => {
        const file = $("#file").files[0];
        if (!file) return status("Choose an image first.");
        try {
          status("Processing...");
          let result, name = "result.png", blob;
          if (k === "image-compress" || t.id === "image-compressor") {
            result = await NTEngine.imageCompress(file, Number($("#q")?.value || 0.7), file.type || "image/jpeg");
            blob = result.blob; name = "compressed.jpg";
            status(`Before ${Math.round(result.before/1024)} KB → after ${Math.round(result.after/1024)} KB`);
          } else if (k === "image-resize") {
            result = await NTEngine.imageResize(file, Number($("#w").value), Number($("#h").value));
            blob = result.blob; name = "resized.png";
          } else if (k === "image-rotate") {
            result = await NTEngine.imageRotate(file, Number($("#deg").value)); blob = result.blob; name = "rotated.png";
          } else if (k === "image-flip") {
            result = await NTEngine.imageFlip(file, $("#dir").value); blob = result.blob; name = "flipped.png";
          } else if (k === "image-convert" || t.id.includes("to-")) {
            const mime = $("#mime")?.value || "image/png";
            result = await NTEngine.imageConvert(file, mime); blob = result.blob; name = "converted." + result.ext;
          } else if (k === "image-filter") {
            result = await NTEngine.imageFilter(file, $("#filt").value); blob = result.blob; name = "filtered.png";
          } else if (k === "image-watermark") {
            result = await NTEngine.imageWatermark(file, $("#wm").value); blob = result.blob; name = "watermarked.png";
          } else if (k === "image-border" || k === "image-bg") {
            result = await NTEngine.imageBorder(file, Number($("#pad")?.value || 24), $("#col").value); blob = result.blob; name = "border.png";
          } else if (k === "image-pixelate") {
            result = await NTEngine.imagePixelate(file, Number($("#block").value || 12)); blob = result.blob; name = "pixel.png";
          } else if (k === "image-round") {
            result = await NTEngine.imageRound(file, Number($("#rad").value || 40)); blob = result.blob; name = "rounded.png";
          } else if (k === "image-favicon") {
            const img = await NTEngine.loadImage(await NTEngine.readDataURL(file));
            const c = document.createElement("canvas"); c.width = 32; c.height = 32;
            c.getContext("2d").drawImage(img, 0, 0, 32, 32);
            blob = await NTEngine.canvasToBlob(c, "image/png"); name = "favicon-32.png";
          } else if (k === "image-base64") {
            const url = await NTEngine.readDataURL(file);
            setOut(url); status("Encoded."); return;
          } else if (k === "image-info") {
            const img = await NTEngine.loadImage(await NTEngine.readDataURL(file));
            setOut(`Width: ${img.width}\nHeight: ${img.height}\nType: ${file.type}\nSize: ${file.size} bytes\nName: ${file.name}`);
            status("Done"); return;
          } else if (k === "image-picker") {
            const url = await NTEngine.readDataURL(file);
            $("#preview").innerHTML = `<canvas id="cv" class="preview-img"></canvas><div id="colout"></div>`;
            const img = await NTEngine.loadImage(url);
            const cv = $("#cv"); cv.width = img.width; cv.height = img.height;
            cv.getContext("2d").drawImage(img, 0, 0);
            cv.onclick = (e) => {
              const r = cv.getBoundingClientRect();
              const x = Math.floor((e.clientX - r.left) * img.width / r.width);
              const y = Math.floor((e.clientY - r.top) * img.height / r.height);
              const d = cv.getContext("2d").getImageData(x, y, 1, 1).data;
              const hex = NTEngine.rgbToHex(d[0], d[1], d[2]);
              $("#colout").textContent = `${hex} rgb(${d[0]},${d[1]},${d[2]})`;
            };
            status("Click the image to pick a color."); return;
          } else if (k === "image-crop") {
            const img = await NTEngine.loadImage(await NTEngine.readDataURL(file));
            const w = Math.floor(img.width * 0.8), h = Math.floor(img.height * 0.8);
            const c = document.createElement("canvas"); c.width = w; c.height = h;
            c.getContext("2d").drawImage(img, (img.width-w)/2, (img.height-h)/2, w, h, 0, 0, w, h);
            blob = await NTEngine.canvasToBlob(c, "image/png"); name = "cropped.png";
          } else {
            result = await NTEngine.imageCompress(file, 0.8); blob = result.blob; name = "image.png";
          }
          if (blob) {
            const url = URL.createObjectURL(blob);
            $("#preview").innerHTML = `<img class="preview-img" src="${url}" alt="preview">`;
            $("#dlBtn").onclick = () => NTEngine.download(blob, name);
            status("Completed");
          }
        } catch (e) { status(e.message || "Could not process image."); }
      };
      return;
    }

    if (k === "base64-image") {
      $("#run").onclick = () => {
        const raw = inp.value.trim();
        if (!raw) return setOut("Paste a data URL or Base64 string.");
        const src = raw.startsWith("data:") ? raw : "data:image/png;base64," + raw;
        $("#preview") ? $("#preview").innerHTML = `<img class="preview-img" src="${src}">` : setOut("Ready");
        const imgBox = document.createElement("div");
        if ($("#out")) $("#out").parentElement.appendChild(imgBox);
      };
    }

    // TEXT / DEV generic
    $("#run")?.addEventListener("click", async () => {
      if (!inp) return;
      const v = inp.value;
      try {
        if (["word-counter","character-counter","sentence-counter","paragraph-counter","line-counter","caption-counter","bio-counter","text-stats"].includes(k) || t.id.includes("counter")) {
          const s = NTEngine.stats(v);
          setOut(`Words: ${s.words}\nCharacters: ${s.chars}\nCharacters no spaces: ${s.charsNoSpace}\nLines: ${s.lines}\nSentences: ${s.sentences}\nParagraphs: ${s.paragraphs}`);
        } else if (k === "text-clean") setOut(v.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim());
        else if (k === "text-unique") setOut([...new Set(v.split(/\r?\n/))].join("\n"));
        else if (k === "text-sort") setOut(v.split(/\r?\n/).sort((a,b)=>a.localeCompare(b)).join("\n"));
        else if (k === "text-reverse") setOut([...v].reverse().join(""));
        else if (k === "text-case" && t.id.includes("upper")) setOut(v.toUpperCase());
        else if (k === "text-case" && t.id.includes("lower")) setOut(v.toLowerCase());
        else if (k === "text-case" && t.id.includes("title")) setOut(NTEngine.titleCase(v));
        else if (k === "text-case" && t.id.includes("sentence")) setOut(NTEngine.sentenceCase(v));
        else if (k === "text-case" && t.id.includes("camel")) setOut(NTEngine.camel(v));
        else if (k === "text-case" && t.id.includes("snake")) setOut(NTEngine.snake(v));
        else if (k === "text-case" && t.id.includes("kebab")) setOut(NTEngine.kebab(v));
        else if (k === "text-nospaces") setOut(v.replace(/\s+/g, ""));
        else if (k === "text-noempty") setOut(v.split(/\r?\n/).filter((l) => l.trim()).join("\n"));
        else if (k === "text-slug") setOut(NTEngine.toSlug(v));
        else if (k === "slug-title") setOut(NTEngine.titleCase(v.replace(/[-_]+/g, " ")));
        else if (k === "lorem") setOut(NTEngine.lorem(Number(v) || 3));
        else if (k === "rand-text") setOut(NTEngine.lorem(1));
        else if (k === "morse-enc") setOut(NTEngine.morseEnc(v));
        else if (k === "morse-dec") setOut(NTEngine.morseDec(v));
        else if (k === "bin-enc") setOut([...v].map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "));
        else if (k === "bin-dec") setOut(v.trim().split(/\s+/).map((b) => String.fromCharCode(parseInt(b, 2))).join(""));
        else if (k === "rot13") setOut(v.replace(/[a-zA-Z]/g, (c) => { const base = c <= "Z" ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base); }));
        else if (k === "url-enc") setOut(encodeURIComponent(v));
        else if (k === "url-dec") setOut(decodeURIComponent(v));
        else if (k === "html-enc") setOut(escapeHtml(v));
        else if (k === "html-dec") { const d = document.createElement("textarea"); d.innerHTML = v; setOut(d.value); }
        else if (k === "text-repeat") { const n = Number(prompt("Repeat how many times?", "5")) || 5; setOut(v.repeat(Math.min(n, 500))); }
        else if (k === "extract-email") setOut((v.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).join("\n") || "None found");
        else if (k === "extract-url") setOut((v.match(/https?:\/\/[^\s]+/gi) || []).join("\n") || "None found");
        else if (k === "word-freq") {
          const map = {};
          v.toLowerCase().match(/[a-z0-9']+/g)?.forEach((w) => map[w] = (map[w] || 0) + 1);
          setOut(Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([w,n]) => n + "  " + w).join("\n"));
        } else if (k === "line-num") setOut(v.split(/\r?\n/).map((l,i)=>String(i+1).padStart(3," ") + "  " + l).join("\n"));
        else if (k === "trim-lines") setOut(v.split(/\r?\n/).map((l)=>l.trim()).join("\n"));
        else if (k === "text-wrap") setOut(v.replace(/(.{1,72})(\s+|$)/g, "$1\n").trim());
        else if (k === "no-punct") setOut(v.replace(/[^\w\s]/g, ""));
        else if (k === "initials") setOut(v.split(/\s+/).map((p)=>p[0]||"").join("").toUpperCase());
        else if (k === "json-pretty" || k === "json-min") setOut(k === "json-min" ? NTEngine.minJSON(v) : NTEngine.prettyJSON(v));
        else if (k === "xml-pretty") setOut(NTEngine.prettyXML(v));
        else if (k === "html-pretty") setOut(NTEngine.prettyXML(v));
        else if (k === "html-min" || k === "css-min" || k === "js-min") setOut(v.replace(/\s+/g, " ").trim());
        else if (k === "css-pretty") setOut(v.replace(/\{/g, " {\n  ").replace(/;/g, ";\n  ").replace(/\}/g, "\n}\n"));
        else if (k === "md-preview" || k === "md-html") { if (out) out.innerHTML = NTEngine.mdLite(v); }
        else if (k === "b64-enc") setOut(NTEngine.b64enc(v));
        else if (k === "b64-dec") setOut(NTEngine.b64dec(v));
        else if (k === "jwt-dec") setOut(JSON.stringify(NTEngine.decodeJWT(v), null, 2));
        else if (k === "jwt-gen") setOut([NTEngine.b64enc(JSON.stringify({alg:"none",typ:"JWT"})), NTEngine.b64enc(v || "{}"), ""].join(".").replace(/=+/g,""));
        else if (k === "uuid") setOut(Array.from({length: Number(v)||5}, () => NTEngine.uuid()).join("\n"));
        else if (k === "uuid-val") setOut(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.trim()) ? "Valid UUID" : "Not a UUID");
        else if (k === "unix") {
          if (/^\d+$/.test(v.trim())) setOut(new Date(Number(v.trim()) * (v.trim().length<=10?1000:1)).toISOString());
          else setOut(String(Math.floor(new Date(v).getTime()/1000)));
        } else if (k === "hash") {
          const algo = t.id.includes("512") ? "SHA-512" : "SHA-256";
          setOut(await NTEngine.hash(v, algo));
        } else if (k === "url-parse") setOut(NTEngine.parseURL(v));
        else if (k === "ua-parse") setOut(navigator.userAgent);
        else if (k === "http-status") setOut(v + " — " + NTEngine.httpStatus(v.trim()));
        else if (k === "cron") setOut(NTEngine.cronExplain(v));
        else if (k === "json-csv") setOut(NTEngine.jsonToCsv(v));
        else if (k === "csv-json" || k === "csv-fmt") setOut(k==="csv-json"?NTEngine.csvToJson(v):v);
        else if (k === "json-keys") setOut(Object.keys(JSON.parse(v)).join("\n"));
        else if (k === "color-conv") {
          if (v.trim().startsWith("#")) {
            const {r,g,b} = NTEngine.hexToRgb(v.trim());
            const hsl = NTEngine.rgbToHsl(r,g,b);
            setOut(`RGB(${r}, ${g}, ${b})\nHSL(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
          } else {
            const m = v.match(/(\d+)\D+(\d+)\D+(\d+)/);
            if (!m) throw new Error("Enter #HEX or r,g,b");
            setOut(NTEngine.rgbToHex(+m[1], +m[2], +m[3]));
          }
        } else if (k === "password") setOut(NTEngine.password(16, {sym:true}));
        else if (k === "username") setOut(["nailong","pixel","nova","orbit","lumen"].map((w)=>w+NTEngine.rand(3,"0123456789")).join("\n"));
        else if (k === "rand-str" || k === "hex-gen") setOut(NTEngine.rand(32, k==="hex-gen"?"0123456789abcdef":undefined));
        else if (k === "pin") setOut(NTEngine.rand(6,"0123456789"));
        else if (k === "rand-color") { const hex = "#"+NTEngine.rand(6,"0123456789abcdef"); setOut(hex); }
        else if (k === "hashtag-count") setOut(String((v.match(/#\w+/g)||[]).length));
        else if (k === "hashtag-make") setOut(v.split(/\s+/).map((w)=>"#"+w.replace(/[^\w]/g,"")).join(" "));
        else if (k === "url-clean") setOut(v.trim().replace(/\s+/g,""));
        else if (k === "filename") setOut(NTEngine.toSlug(v) + ".txt");
        else if (k === "ws-vis") setOut(v.replace(/ /g,"·").replace(/\t/g,"→"));
        else if (k === "case-all") setOut(`UPPER\n${v.toUpperCase()}\n\nlower\n${v.toLowerCase()}\n\nTitle\n${NTEngine.titleCase(v)}\n\nslug\n${NTEngine.toSlug(v)}`);
        else if (k === "num-base") {
          const n = parseInt(v, 10);
          setOut(`Dec ${n}\nBin ${n.toString(2)}\nHex ${n.toString(16)}`);
        } else if (k === "css-unit") {
          const px = Number(v) || 16;
          setOut(`${px}px = ${(px/16).toFixed(3)}rem\n${px}rem = ${px*16}px (base 16)`);
        } else if (k === "html-text") setOut(v.replace(/<[^>]+>/g," "));
        else if (k === "text-diff") setOut("Put text A on first line group and text B after a line with only ---\n(Simple compare)\n" + v);
        else if (k === "ai") {
          setOut("Calling AI endpoint...");
          const res = await fetch(NT_CONFIG.aiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool: t.id, input: v, style: $("#style")?.value })
          });
          if (!res.ok) throw new Error("AI API is not configured yet. Add a serverless function at /api/ai and set the provider key as an environment variable. See README.");
          const data = await res.json();
          setOut(data.text || JSON.stringify(data));
        } else if (k === "qr" || k.startsWith("qr-")) {
          runQR(t, v);
        } else if (k === "barcode") {
          runBarcode(v);
        } else if (k === "csv-view") {
          const rows = v.trim().split(/\r?\n/).map((r)=>r.split(","));
          if (out) out.innerHTML = `<table style="width:100%;border-collapse:collapse">${rows.map((r)=>"<tr>"+r.map((c)=>`<td style="border:1px solid #333;padding:6px">${escapeHtml(c)}</td>`).join("")+"</tr>").join("")}</table>`;
        } else {
          // fallback: if kind still unmatched, try id-based
          if (t.id === "regex-tester") {
            const parts = v.split("\n");
            const re = new RegExp(parts[0]);
            setOut(String(re.test(parts.slice(1).join("\n"))));
          } else setOut(v);
        }
      } catch (e) {
        setOut(e.message || String(e));
      }
    });

    // PDF
    if (k.startsWith("pdf") || k === "images-pdf" || k === "text-pdf") {
      $("#run").onclick = async () => {
        try {
          if (!window.PDFLib) throw new Error("PDF library still loading. Wait a second and try again.");
          status("Processing...");
          const { PDFDocument, StandardFonts, rgb } = PDFLib;
          if (k === "text-pdf") {
            const doc = await PDFDocument.create();
            const page = doc.addPage();
            const font = await doc.embedFont(StandardFonts.Helvetica);
            page.drawText((prompt("Text for PDF") || "NAILONG TOOLS"), { x: 50, y: 700, size: 14, font, color: rgb(0,0,0) });
            const bytes = await doc.save();
            NTEngine.download(new Blob([bytes], { type: "application/pdf" }), "text.pdf");
            status("Completed"); return;
          }
          const files = [...($("#file").files || [])];
          if (!files.length) return status("Choose files first.");
          if (k === "pdf-merge") {
            const outDoc = await PDFDocument.create();
            for (const f of files) {
              const src = await PDFDocument.load(await NTEngine.readFile(f));
              const pages = await outDoc.copyPages(src, src.getPageIndices());
              pages.forEach((p) => outDoc.addPage(p));
            }
            NTEngine.download(new Blob([await outDoc.save()], { type: "application/pdf" }), "merged.pdf");
          } else if (k === "images-pdf") {
            const outDoc = await PDFDocument.create();
            for (const f of files) {
              const bytes = new Uint8Array(await NTEngine.readFile(f));
              const img = f.type.includes("png") ? await outDoc.embedPng(bytes) : await outDoc.embedJpg(bytes);
              const page = outDoc.addPage([img.width, img.height]);
              page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
            }
            NTEngine.download(new Blob([await outDoc.save()], { type: "application/pdf" }), "images.pdf");
          } else if (k === "pdf-info" || k === "pdf-size-checker") {
            const src = await PDFDocument.load(await NTEngine.readFile(files[0]));
            status(`${files[0].name}: ${src.getPageCount()} pages, ${files[0].size} bytes`);
          } else if (k === "pdf-rotate") {
            const src = await PDFDocument.load(await NTEngine.readFile(files[0]));
            src.getPages().forEach((p) => p.setRotation(PDFLib.degrees(90)));
            NTEngine.download(new Blob([await src.save()], { type: "application/pdf" }), "rotated.pdf");
          } else if (k === "pdf-split" || k === "pdf-extract") {
            const src = await PDFDocument.load(await NTEngine.readFile(files[0]));
            const one = await PDFDocument.create();
            const [p] = await one.copyPages(src, [0]);
            one.addPage(p);
            NTEngine.download(new Blob([await one.save()], { type: "application/pdf" }), "page-1.pdf");
          }
          status("Completed");
        } catch (e) { status(e.message || "PDF error"); }
      };
    }

    if (k === "media-info" || k === "file-info") {
      $("#run").onclick = async () => {
        const f = $("#file").files[0];
        if (!f) return status("Choose a file.");
        let extra = "";
        if (f.type.startsWith("video") || f.type.startsWith("audio")) {
          extra = await mediaDuration(f);
        }
        const msg = `Name: ${f.name}\nType: ${f.type || "unknown"}\nSize: ${f.size} bytes (${(f.size/1024).toFixed(1)} KB)\n${extra}`;
        if ($("#preview")) $("#preview").textContent = msg;
        status("Done");
      };
    }
    if (k === "video-thumb") {
      $("#run").onclick = async () => {
        const f = $("#file").files[0];
        if (!f) return status("Choose a video.");
        const url = URL.createObjectURL(f);
        const video = document.createElement("video");
        video.src = url; video.muted = true; video.playsInline = true;
        await video.play().catch(()=>{});
        video.pause();
        const c = document.createElement("canvas");
        c.width = video.videoWidth || 640; c.height = video.videoHeight || 360;
        c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
        const blob = await NTEngine.canvasToBlob(c, "image/jpeg", 0.9);
        $("#preview").innerHTML = `<img class="preview-img" src="${URL.createObjectURL(blob)}">`;
        $("#dlBtn").onclick = () => NTEngine.download(blob, "thumbnail.jpg");
        status("Completed");
      };
    }
    if (k === "audio-preview") {
      $("#run").onclick = () => {
        const f = $("#file").files[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        $("#preview").innerHTML = `<audio controls src="${url}"></audio>`;
      };
    }
    if (k === "file-hash") {
      $("#run").onclick = async () => {
        const f = $("#file").files[0];
        if (!f) return;
        const buf = await NTEngine.readFile(f);
        const digest = await crypto.subtle.digest("SHA-256", buf);
        const hex = [...new Uint8Array(digest)].map((b)=>b.toString(16).padStart(2,"0")).join("");
        if ($("#preview")) $("#preview").textContent = hex;
        status("Completed");
      };
    }
    if (k === "file-b64") {
      $("#run").onclick = async () => {
        const f = $("#file").files[0];
        if (!f) return;
        const url = await NTEngine.readDataURL(f);
        if ($("#preview")) $("#preview").textContent = url.slice(0, 4000) + (url.length>4000?"…":"");
        $("#copyBtn").onclick = () => NTEngine.copy(url);
      };
    }

    wireCalc(t);
    wireApps(t);
    wireQRExtras(t);
    if (window.NTExtras) NTExtras.enhance(t);
  }

  function mediaDuration(file) {
    return new Promise((res) => {
      const el = document.createElement(file.type.startsWith("audio") ? "audio" : "video");
      el.preload = "metadata";
      el.onloadedmetadata = () => { res(`Duration: ${el.duration.toFixed(2)}s`); URL.revokeObjectURL(el.src); };
      el.onerror = () => res("");
      el.src = URL.createObjectURL(file);
    });
  }

  function runQR(t, text) {
    let data = text;
    if (t.id === "wifi-qr") data = `WIFI:T:WPA;S:${text};P:password;;`;
    if (t.id === "email-qr") data = "mailto:" + text;
    if (t.id === "phone-qr") data = "tel:" + text;
    if (t.id === "sms-qr") data = "sms:" + text;
    if (t.id === "location-qr") data = "geo:" + text;
    const box = $("#preview");
    if (!box) return;
    box.innerHTML = `<canvas id="qrc"></canvas>`;
    if (window.QRCode) {
      QRCode.toCanvas($("#qrc"), data || "NAILONG TOOLS", { width: 240, margin: 1 }, () => {});
    } else {
      box.textContent = "QR library loading. Try Process again.";
    }
  }
  function runBarcode(text) {
    $("#preview").innerHTML = `<svg id="bc"></svg>`;
    // simple visual bars from char codes
    const svg = $("#bc");
    const s = text || "NAILONG";
    let x = 0, html = "";
    for (const ch of s) {
      const n = ch.charCodeAt(0);
      const w = (n % 3) + 1;
      html += `<rect x="${x}" y="0" width="${w}" height="80" fill="#ffd000"/>`;
      x += w + 1;
    }
    svg.setAttribute("viewBox", `0 0 ${x} 80`);
    svg.style.width = "100%";
    svg.innerHTML = html;
  }
  function wireQRExtras() {}

  function wireCalc(t) {
    const box = $("#calcBox");
    if (!box) return;
    const k = t.kind;
    const out = $("#out");
    const num = (id) => Number($(id).value);
    const show = (v) => { if (out) out.textContent = String(v); };
    if (k === "calc-basic" || k === "calc-sci") {
      box.innerHTML = `<input id="expr" class="input" placeholder="${k==="calc-sci"?"sin(0.5)+sqrt(9)":"12 + 5 * 3"}">
        <div class="actions"><button class="btn-sm" id="goCalc">Calculate</button></div>
        <p class="sub">Uses a safe math parser. No JavaScript eval of free text.</p>`;
      $("#goCalc").onclick = () => {
        try { show(safeMath($("#expr").value, k === "calc-sci")); }
        catch (e) { show(e.message); }
      };
    } else if (k === "calc-pct") {
      box.innerHTML = two("a","Value","b","Percent");
      bindTwo(() => show((num("#a") * num("#b") / 100).toFixed(4)));
    } else if (k === "calc-discount") {
      box.innerHTML = two("a","Price","b","Discount %");
      bindTwo(() => show((num("#a") * (1 - num("#b")/100)).toFixed(2)));
    } else if (k === "calc-profit") {
      box.innerHTML = two("a","Cost","b","Sell");
      bindTwo(() => { const p = num("#b")-num("#a"); show(`Profit ${p.toFixed(2)} · Margin ${((p/num("#b"))*100).toFixed(2)}%`); });
    } else if (k === "calc-loss") {
      box.innerHTML = two("a","Cost","b","Sell");
      bindTwo(() => show((num("#a")-num("#b")).toFixed(2)));
    } else if (k === "calc-tax") {
      box.innerHTML = two("a","Amount","b","Tax %");
      bindTwo(() => show((num("#a") * (1+num("#b")/100)).toFixed(2)));
    } else if (k === "calc-tip") {
      box.innerHTML = two("a","Bill","b","Tip %") + `<input id="c" class="input" type="number" placeholder="People" value="1">`;
      bindTwo(() => { const tot = num("#a")*(1+num("#b")/100); show(`Total ${tot.toFixed(2)} · Each ${(tot/Math.max(1,num("#c"))).toFixed(2)}`); });
    } else if (k === "calc-age") {
      box.innerHTML = `<input id="a" class="input" type="date">`;
      $("#a").onchange = () => {
        const b = new Date($("#a").value), n = new Date();
        let y = n.getFullYear()-b.getFullYear();
        const m = n.getMonth()-b.getMonth();
        if (m < 0 || (m===0 && n.getDate()<b.getDate())) y--;
        show(y + " years");
      };
    } else if (k === "calc-datediff" || k === "workdays") {
      box.innerHTML = `<input id="a" class="input" type="date"><input id="b" class="input" type="date">`;
      const run = () => {
        const a = new Date($("#a").value), b = new Date($("#b").value);
        const days = Math.round((b-a)/86400000);
        if (k === "workdays") {
          let c = 0, d = new Date(a);
          while (d <= b) { const w = d.getDay(); if (w!==0 && w!==6) c++; d.setDate(d.getDate()+1); }
          show(c + " working days");
        } else show(days + " days");
      };
      $("#a").onchange = $("#b").onchange = run;
    } else if (k === "calc-bmi") {
      box.innerHTML = two("a","Weight kg","b","Height cm");
      bindTwo(() => { const h = num("#b")/100; show((num("#a")/(h*h)).toFixed(2)); });
    } else if (k === "calc-bmr") {
      box.innerHTML = two("a","Weight kg","b","Height cm") + `<input id="c" class="input" type="number" placeholder="Age"><select id="d" class="input"><option value="m">Male</option><option value="f">Female</option></select>`;
      bindTwo(() => {
        const w=num("#a"), h=num("#b"), age=num("#c");
        const bmr = $("#d").value==="m" ? 10*w+6.25*h-5*age+5 : 10*w+6.25*h-5*age-161;
        show(bmr.toFixed(0) + " kcal/day");
      });
    } else if (k.startsWith("unit-")) {
      const type = k.replace("unit-", "");
      const keys = type === "temp" ? ["C","F","K"] : Object.keys(NTEngine.units[type] || {});
      box.innerHTML = `<input id="a" class="input" type="number" value="1">
        <select id="from" class="input">${keys.map((x)=>`<option>${x}</option>`).join("")}</select>
        <select id="to" class="input">${keys.map((x)=>`<option>${x}</option>`).join("")}</select>
        <button class="btn-sm" id="goU">Convert</button>`;
      $("#goU").onclick = () => show(NTEngine.convert(type, num("#a"), $("#from").value, $("#to").value));
    } else if (k === "calc-aspect") {
      box.innerHTML = two("a","Width","b","Ratio height (e.g. 9 for 16:9)") + `<input id="c" class="input" placeholder="Ratio width" value="16">`;
      bindTwo(() => show("Height should be " + Math.round(num("#a") * num("#b") / num("#c"))));
    } else if (k === "calc-margin") {
      box.innerHTML = two("a","Cost","b","Price");
      bindTwo(() => show((((num("#b")-num("#a"))/num("#b"))*100).toFixed(2)+"%"));
    } else if (k === "calc-markup") {
      box.innerHTML = two("a","Cost","b","Price");
      bindTwo(() => show((((num("#b")-num("#a"))/num("#a"))*100).toFixed(2)+"%"));
    } else if (k === "calc-sales") {
      box.innerHTML = two("a","Units","b","Price");
      bindTwo(() => show((num("#a")*num("#b")).toFixed(2)));
    } else if (k === "gpa") {
      box.innerHTML = `<textarea class="tall" id="g" placeholder="4&#10;3.7&#10;3"></textarea><button class="btn-sm" id="goG">Average</button>`;
      $("#goG").onclick = () => {
        const n = $("#g").value.split(/\s+/).map(Number).filter((x)=>!Number.isNaN(x));
        show((n.reduce((a,b)=>a+b,0)/n.length).toFixed(2));
      };
    } else if (k === "grade") {
      box.innerHTML = two("a","Current %","b","Exam weight %") + `<input id="c" class="input" placeholder="Target %">`;
      bindTwo(() => {
        const need = (num("#c") - num("#a")*(1-num("#b")/100)) / (num("#b")/100);
        show("Need " + need.toFixed(2) + "% on the exam");
      });
    } else if (k === "fraction") {
      box.innerHTML = `<input id="a" class="input" placeholder="1/2"><input id="b" class="input" placeholder="1/3"><button class="btn-sm" id="goF">Add</button>`;
      $("#goF").onclick = () => {
        const p = (s) => s.split("/").map(Number);
        const [a,b] = p($("#a").value), [c,d] = p($("#b").value);
        const nume = a*d + c*b, den = b*d;
        const g = gcd(nume, den);
        show(`${nume/g}/${den/g}`);
      };
    }
    function two(a,la,b,lb){return `<label>${la}</label><input id="${a}" class="input" type="number"><label>${lb}</label><input id="${b}" class="input" type="number">`;}
    function bindTwo(fn){ box.querySelectorAll("input,select").forEach((el)=>el.addEventListener("input", fn)); }
  }

  function gcd(a,b){ a=Math.abs(a);b=Math.abs(b); while(b){[a,b]=[b,a%b];} return a||1; }

  function safeMath(expr, sci) {
    const allowed = sci
      ? /[^0-9+\-*/%()., eEsqrtlogsincoatnpq]/g
      : /[^0-9+\-*/%(). ]/g;
    let e = expr.replace(/π/g, "PI").replace(/\^/g, "**");
    if (sci) {
      e = e.replace(/sqrt/g,"Math.sqrt").replace(/sin/g,"Math.sin").replace(/cos/g,"Math.cos")
        .replace(/tan/g,"Math.tan").replace(/log/g,"Math.log").replace(/PI/g,"Math.PI");
    }
    if (/[^0-9+\-*/%()., MathsqrtlogsincoatnpqPI_]/i.test(e.replace(/\s/g,"")) && !sci) throw new Error("Invalid characters.");
    const fn = new Function("Math", `"use strict"; return (${e});`);
    const r = fn(Math);
    if (!Number.isFinite(r)) throw new Error("Invalid result.");
    return r;
  }

  function wireApps(t) {
    const box = $("#appBox");
    if (!box) return;
    const k = t.kind;
    if (k === "todo" || k === "checklist") {
      const key = t.id;
      const items = NTStore.get(USER.uid, key, []);
      const draw = () => {
        box.innerHTML = `<input id="td" class="input" placeholder="New item">
          <button class="btn-sm" id="add">Add</button>
          <div>${items.map((it,i)=>`<div style="display:flex;gap:8px;align-items:center;margin:8px 0"><input type="checkbox" ${it.done?"checked":""} data-i="${i}"><span style="flex:1;${it.done?"text-decoration:line-through;color:#888":""}">${escapeHtml(it.text)}</span><button data-del="${i}">x</button></div>`).join("")}</div>`;
        $("#add").onclick = () => { items.push({ text: $("#td").value, done:false }); NTStore.set(USER.uid,key,items); draw(); };
        box.querySelectorAll("[data-i]").forEach((el)=>el.onchange=()=>{ items[+el.dataset.i].done = el.checked; NTStore.set(USER.uid,key,items); draw(); });
        box.querySelectorAll("[data-del]").forEach((el)=>el.onclick=()=>{ items.splice(+el.dataset.del,1); NTStore.set(USER.uid,key,items); draw(); });
      };
      draw();
    } else if (k === "notes") {
      const val = NTStore.get(USER.uid, "notes", "");
      box.innerHTML = `<textarea class="tall" id="nt">${escapeHtml(typeof val === "string"?val:"")}</textarea><button class="btn-sm" id="sv">Save</button>`;
      $("#sv").onclick = () => { NTStore.set(USER.uid,"notes", $("#nt").value); $("#sv").textContent="Saved"; };
    } else if (k === "habits") {
      const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
      const data = NTStore.get(USER.uid, "habits", { name:"Read", marks:{} });
      box.innerHTML = `<input id="hn" class="input" value="${escapeHtml(data.name)}"><div class="filters">${days.map((d)=>`<button class="chip ${data.marks[d]?"active":""}" data-d="${d}">${d}</button>`).join("")}</div>`;
      box.querySelectorAll("[data-d]").forEach((b)=>b.onclick=()=>{ data.marks[b.dataset.d]=!data.marks[b.dataset.d]; data.name=$("#hn").value; NTStore.set(USER.uid,"habits",data); wireApps(t); });
    } else if (k === "expense") {
      const list = NTStore.get(USER.uid,"exp",[]);
      const total = list.reduce((a,b)=>a+Number(b.amt||0),0);
      box.innerHTML = `<input id="el" class="input" placeholder="Label"><input id="ea" class="input" type="number" placeholder="Amount">
        <button class="btn-sm" id="ae">Add</button><h3>Total ${total}</h3>${list.map((x)=>`<div>${escapeHtml(x.label)} — ${x.amt}</div>`).join("")}`;
      $("#ae").onclick = () => { list.push({label:$("#el").value, amt:$("#ea").value}); NTStore.set(USER.uid,"exp",list); wireApps(t); };
    } else if (k === "stopwatch") {
      let t0=0, acc=0, run=false, h;
      box.innerHTML = `<h2 id="sw">0.00</h2><button class="btn-sm" id="st">Start</button> <button class="btn-sm" id="rs">Reset</button>`;
      const tick = () => { $("#sw").textContent = ((acc + (run?Date.now()-t0:0))/1000).toFixed(2); };
      $("#st").onclick = () => { run=!run; if(run) t0=Date.now(); $("#st").textContent=run?"Pause":"Start"; if(run) h=setInterval(tick,50); else clearInterval(h); if(!run) acc += Date.now()-t0; };
      $("#rs").onclick = () => { run=false; acc=0; clearInterval(h); tick(); };
    } else if (k === "timer" || k === "pomodoro" || k === "study-timer") {
      let left = k==="pomodoro"?25*60:60, h;
      box.innerHTML = `<h2 id="tm">${fmt(left)}</h2><button class="btn-sm" id="st">Start</button>`;
      $("#st").onclick = () => {
        clearInterval(h);
        h = setInterval(() => { left--; $("#tm").textContent=fmt(left); if(left<=0) clearInterval(h); }, 1000);
      };
    } else if (k === "countdown") {
      box.innerHTML = `<input id="cd" class="input" type="datetime-local"><h2 id="tm"></h2>`;
      setInterval(() => {
        const t = new Date($("#cd").value).getTime() - Date.now();
        $("#tm").textContent = t>0 ? fmt(Math.floor(t/1000)) : "Done";
      }, 500);
    } else if (k === "worldclock") {
      const z = ["UTC","Asia/Jakarta","America/New_York","Europe/London","Asia/Tokyo"];
      const draw = () => { box.innerHTML = z.map((x)=>`<div>${x}: ${new Date().toLocaleString("en-GB",{timeZone:x})}</div>`).join(""); };
      draw(); setInterval(draw, 1000);
    }
    function fmt(s){ s=Math.max(0,s); return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); }
  }


  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function closeSheets() {
    $$(".sheet-bg,.sheet").forEach((n) => n.remove());
  }

  function openMenu() {
    closeSheets();
    const bg = document.createElement("div");
    bg.className = "sheet-bg";
    const sh = document.createElement("div");
    sh.className = "sheet";
    sh.innerHTML = `<h3>Menu</h3>
      <div class="sheet-item" data-go="bug"><i class="fa-solid fa-bug"></i>Lapor bug</div>
      <div class="sheet-item" data-go="apk"><i class="fa-solid fa-download"></i>Download APK NAILONG TOOLS</div>
      <a class="sheet-item" href="${escapeHtml(NT_CONFIG.whatsappChannel)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>Saluran WhatsApp resmi</a>
      <div class="sheet-item" data-go="profile"><i class="fa-solid fa-user"></i>Saya</div>
      <div class="sheet-item" data-go="upgrade"><i class="fa-solid fa-crown"></i>Upgrade VIP</div>
      ${(USER && (USER.role==="owner"||USER.role==="admin")) ? `<div class="sheet-item" data-go="admin"><i class="fa-solid fa-shield"></i>Admin / Owner</div>` : ""}
      <div class="sheet-item" data-go="accounts"><i class="fa-solid fa-right-left"></i>Ganti akun</div>`;
    bg.onclick = closeSheets;
    document.body.append(bg, sh);
  }

  async function fillStatusBar() {
    const host = $("#statusBar");
    if (!host) return;
    const device = NTDevice.parseDevice();
    const browser = NTDevice.parseBrowser();
    const role = NTAuth.roleLabel(USER);
    host.innerHTML = `<div class="status-card">
      <div class="status-top">
        <span id="stCountry"><i class="fa-solid fa-globe"></i> NEGARA <b>—</b></span>
        <span><i class="fa-solid fa-mobile-screen"></i> DEVICE <b>${escapeHtml(device)}</b></span>
        <span><i class="fa-solid fa-globe"></i> BROWSER <b>${escapeHtml(browser)}</b></span>
      </div>
      <div class="status-main">
        <div class="status-ava">${initials(USER?.username || USER?.name)}</div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;font-weight:800"><span class="status-dot"></span> STATUS · Online</div>
          <div class="sub" id="stName">${escapeHtml(USER?.username || "")}</div>
        </div>
        <div class="bat-pill" title="Baterai perangkat">
          <div class="bat"><i id="batFill"></i></div>
          <span id="batPct">…</span>
        </div>
        <div class="role-pill"><i class="fa-solid fa-user"></i> Role : ${escapeHtml(role)}</div>
        <button class="vip-pill" data-go="upgrade" type="button"><i class="fa-solid fa-crown"></i> VVIP <span class="up">↑</span></button>
      </div>
    </div>`;
    try {
      const c = await NTDevice.detectCountry();
      const el = $("#stCountry");
      if (el) el.innerHTML = `<i class="fa-solid fa-globe"></i> NEGARA ${c.flag} <b>${escapeHtml(c.name)}</b>`;
    } catch (_) {}
    try {
      const b = await NTDevice.readBattery();
      const pct = $("#batPct");
      const fill = $("#batFill");
      if (b.supported && b.percent != null) {
        if (pct) pct.textContent = (b.charging ? "⚡ " : "") + b.percent + "%";
        if (fill) fill.style.width = b.percent + "%";
        if (b.raw) {
          b.raw.addEventListener("levelchange", () => {
            const n = Math.round(b.raw.level * 100);
            if (pct) pct.textContent = (b.raw.charging ? "⚡ " : "") + n + "%";
            if (fill) fill.style.width = n + "%";
          });
        }
      } else {
        if (pct) pct.textContent = "N/A";
        if (fill) fill.style.width = "40%";
      }
    } catch (_) {
      const pct = $("#batPct");
      if (pct) pct.textContent = "N/A";
    }
  }

  function viewUpgrade() {
    const plans = NTMember.plans();
    app.innerHTML = shell(`<div class="tool-page">
      <h2>Upgrade VIP</h2>
      <p class="sub">Transfer ke QRIS owner, unggah bukti + username. Owner mengaktifkan VIP. Jika masa VIP habis, akun otomatis kembali member biasa.</p>
      ${plans.map((p)=>`<div class="plan-card"><div><b>${escapeHtml(p.name)}</b><span class="sub">${p.permanent?"Selamanya":(p.days||p.hours)+" hari"}</span></div>
        <button class="btn-sm" data-pay="${p.id}">${escapeHtml(p.label)}</button></div>`).join("")}
    </div>`);
    bindShell();
    $$("[data-pay]").forEach((b)=> b.onclick = () => go("pay/" + b.getAttribute("data-pay")));
  }

  function viewPay(planId) {
    const plan = NTMember.plan(planId) || NTMember.plans()[0];
    app.innerHTML = shell(`<div class="tool-page">
      <h2>${escapeHtml(plan.name)}</h2>
      <div class="panel">
        <p>Transfer <b>${escapeHtml(plan.label)}</b> ke QRIS di bawah. Ganti file <code>assets/qris/qris.png</code> dengan QRIS aslimu.</p>
        <img class="qris" src="${escapeHtml(NT_CONFIG.qrisImage)}" alt="QRIS NAILONG TOOLS">
        <div class="field"><label>Username akun ini</label><input id="payUser" value="${escapeHtml(USER.username||USER.name)}" readonly></div>
        <div class="field"><label>Bukti transfer (foto)</label><input id="payFile" type="file" accept="image/*"></div>
        <button class="btn btn-primary" id="sendPay">Kirim bukti</button>
        <div id="payMsg"></div>
      </div>
    </div>`);
    bindShell();
    $("#sendPay").onclick = async () => {
      const f = $("#payFile").files[0];
      if (!f) { $("#payMsg").innerHTML = `<div class="alert alert-err">Unggah foto bukti transfer dulu.</div>`; return; }
      const url = await NTEngine.readDataURL(f);
      NTMember.submitProof({
        username: USER.username || USER.name,
        uid: USER.uid,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        image: url
      });
      $("#payMsg").innerHTML = `<div class="alert alert-ok">Bukti terkirim. Menunggu owner cek transfer, lalu VIP aktif di akun <b>${escapeHtml(USER.username||USER.name)}</b>.</div>`;
      toast("Bukti terkirim");
    };
  }

  function viewBug() {
    app.innerHTML = shell(`<div class="tool-page"><h2>Lapor bug</h2>
      <div class="panel">
        <textarea class="tall" id="bugTxt" placeholder="Tuliskan bug yang kamu temukan"></textarea>
        <button class="btn btn-primary" id="sendBug" style="max-width:220px;margin-top:10px">Kirim laporan</button>
        <div id="bugMsg"></div>
      </div></div>`);
    bindShell();
    $("#sendBug").onclick = () => {
      const text = $("#bugTxt").value.trim();
      if (!text) return;
      NTMember.addBug({ text, username: USER.username || USER.name, uid: USER.uid });
      $("#bugMsg").innerHTML = `<div class="alert alert-ok">Laporan terkirim ke owner.</div>`;
      $("#bugTxt").value = "";
    };
  }

  function viewApk() {
    app.innerHTML = shell(`<div class="tool-page"><h2>Download APK NAILONG TOOLS</h2>
      <div class="panel">
        <p>Letakkan file APK di <code>assets/app/nailong-tools.apk</code> lalu tombol unduh akan memakai file itu.</p>
        <a class="btn btn-primary" style="display:inline-block;width:auto;padding:12px 18px" href="${escapeHtml(NT_CONFIG.apkUrl)}" download>Download APK</a>
        <p class="sub" style="margin-top:12px">Sambil APK belum ada, pasang website ini sebagai aplikasi lewat menu Chrome → Add to Home screen / Install app.</p>
      </div></div>`);
    bindShell();
  }

  function viewAccounts() {
    const book = NTAuth.book();
    app.innerHTML = authShell(`
      <h1>Akun</h1>
      <p class="sub">Pilih akun lama, masuk owner, atau buat member free baru.</p>
      <div id="msg"></div>
      ${book.map((a)=>`<button class="btn btn-ghost" data-switch="${escapeHtml(a.uid)}" style="text-align:left">${escapeHtml(a.username)}</button>`).join("")}
      <hr style="border-color:#2a2a24">
      <div class="field"><label>Username</label><input id="email" placeholder="NailongOwner atau username"></div>
      <div class="field"><label>Password</label><input id="pass" type="password"></div>
      <button class="btn btn-primary" id="doLogin">Masuk</button>
      <button class="btn btn-ghost" id="doNew">Masuk sebagai member free baru</button>
    `);
    $$("[data-switch]").forEach((el)=> el.onclick = async () => {
      await NTAuth.switchTo(el.getAttribute("data-switch"));
      await playBoot(); go("home");
    });
    $("#doLogin").onclick = async () => {
      try {
        await NTAuth.login({ username: $("#email").value, password: $("#pass").value });
        await playBoot(); go("home");
      } catch (e) { showMsg(e.message, "err"); }
    };
    $("#doNew").onclick = async () => {
      await NTAuth.createFreeMember();
      await playBoot(); go("home");
    };
  }

  /* ---------------- BIND ---------------- */
  function bindShell() {
    bindCards();
    $("#openMenu")?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openMenu(); });
    $$("[data-go]").forEach((el) => el.addEventListener("click", () => go(el.getAttribute("data-go"))));
    $$("[data-cat]").forEach((el) => el.addEventListener("click", () => {
      STATE.cat = el.getAttribute("data-cat");
      go("category/" + encodeURIComponent(STATE.cat));
    }));
    $$("[data-filter]").forEach((el) => el.addEventListener("click", () => {
      STATE.filter = el.getAttribute("data-filter");
      render();
    }));
    const ts = $("#topSearch");
    if (ts) ts.addEventListener("keydown", (e) => {
      if (e.key === "Enter") go("search/" + encodeURIComponent(ts.value));
    });
  }
  function bindCards() {
    $$("[data-open]").forEach((el) => el.addEventListener("click", (e) => {
      if (e.target.closest("[data-fav]")) return;
      go("tool/" + el.getAttribute("data-open"));
    }));
    $$("[data-fav]").forEach((el) => el.addEventListener("click", (e) => {
      e.stopPropagation();
      NTStore.toggleFav(USER.uid, el.getAttribute("data-fav"));
      el.classList.toggle("on");
    }));
  }

  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) go(g.getAttribute("data-go"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      ($("#mainSearch") || $("#topSearch"))?.focus();
    }
  });

  async function render() {
    const r = routeFromHash();
    STATE = { ...STATE, ...r };
    if (NT_CONFIG.maintenance && r.view !== "login") {
      USER = await NTAuth.currentUser();
      if (!USER || USER.role !== "admin") {
        app.innerHTML = authShell(`<h1>Maintenance</h1><p class="sub">NAILONG TOOLS is being updated. Please come back soon.</p>`);
        return;
      }
    }
    const ok = await requireUser(r.view);
    if (!ok) return;
    const titleMap = { home:"Home", tools:"Tools", favorites:"Favorites", history:"History", profile:"Profile", settings:"Settings" };
    const tool = r.tool ? findTool(r.tool) : null;
    document.title = tool ? `${tool.name} - NAILONG TOOLS` : `NAILONG TOOLS v148.027.00`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", tool ? tool.description + " — NAILONG TOOLS" : "All-in-one online tools platform.");

    switch (r.view) {
      case "login": return viewLogin();
      case "register": return viewRegister();
      case "forgot": return viewForgot();
      case "home": return viewHome();
      case "tools": STATE.cat = null; return viewTools();
      case "category": return viewTools();
      case "search": STATE.q = r.q; return viewTools();
      case "favorites": return viewFavorites();
      case "history": return viewHistory();
      case "profile": return viewProfile();
      case "settings": return viewSettings();
      case "admin": return viewAdmin();
      case "upgrade": return viewUpgrade();
      case "pay": return viewPay(r.q || r.tool);
      case "bug": return viewBug();
      case "apk": return viewApk();
      case "accounts": return viewAccounts();
      case "tool": return viewTool(r.tool);
      case "privacy": return staticPage("Privacy Policy", "<p>NAILONG TOOLS processes many files locally in your browser. Account data is stored in Firebase when configured, or only on this device in local mode. We do not sell personal data.</p>");
      case "terms": return staticPage("Terms of Service", "<p>Use these tools lawfully. Do not upload content you do not have rights to. Tools are provided as-is.</p>");
      case "about": return staticPage("About", `<p>NAILONG TOOLS v148.027.00 is an all-in-one online tools platform. Registry currently lists ${tools().length} tools. Architecture supports 1000+ tools.</p>`);
      case "contact": return staticPage("Contact", "<p>Contact your site admin after deployment. Add a real email in this page when you publish.</p>");
      default: app.innerHTML = shell(`<div class="empty"><h2>404</h2><p>Page not found.</p><button class="btn-sm" data-go="home">Back to Home</button></div>`); bindShell();
    }
  }

  window.addEventListener("hashchange", render);
  window.NTRender = render;

  if (!location.hash) location.hash = "#/home";
  else render();
})();
