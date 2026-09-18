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
        <div class="brand-title">𝑻𝑶𝑶𝑳𝑺 〆 𝑵𝑨𝑰𝑳𝑶𝑵𝑮<small>v148.027.00</small></div>
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
      <p class="sub" style="margin-top:14px">Masuk pakai username dan password.</p>
    `);
    $("#doLogin").onclick = async () => {
      try {
        showMsg("Signing in...", "info");
        await NTAuth.login({ username: $("#email").value, email: $("#email").value, password: $("#pass").value });
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
      const steps = ["Checking account...", "Account verified", "Welcome", "Loading tools...", "𝑻𝑶𝑶𝑳𝑺 〆 𝑵𝑨𝑰𝑳𝑶𝑵𝑮"];
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
        <div>𝑻𝑶𝑶𝑳𝑺 〆 𝑵𝑨𝑰𝑳𝑶𝑵𝑮<b>v148.027.00</b></div></div>
      <div class="search-mini"><i class="fa-solid fa-magnifying-glass"></i><input id="topSearch" placeholder="Search tools... (/ )"></div>
      <div style="flex:1"></div>
      ${NTMusic.widget()}
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
    const icon = t.icon || "fa-solid fa-wrench";
    return `<article class="card tool-box" data-open="${t.id}" title="${escapeHtml(t.name)}">
      <button class="fav ${on?"on":""}" data-fav="${t.id}" title="Favorite">★</button>
      <div class="ico"><i class="${icon}"></i></div>
      <h4>${escapeHtml(t.name)}</h4>
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
        <video id="heroVid" autoplay muted loop playsinline webkit-playsinline preload="auto"
          poster="data:image/jpeg;base64,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" disablepictureinpicture>
          <source src="assets/nailong-banner.mp4" type="video/mp4">
          <source src="assets/1000079216.mp4" type="video/mp4">
          <source src="nailong-banner.mp4" type="video/mp4">
          <source src="1000079216.mp4" type="video/mp4">
          <source src="assets/banner/nailong-banner.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        <div class="caption">
          <h2>𝑻𝑶𝑶𝑳𝑺 〆 𝑵𝑨𝑰𝑳𝑶𝑵𝑮</h2>
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
    const kick = () => {
      v.muted = true;
      v.volume = 0;
      const p = v.play();
      if (p && p.catch) p.catch(() => { try { v.load(); v.play().catch(()=>{}); } catch(e){} });
    };
    ["pause","ended","stalled","suspend","waiting"].forEach((ev)=>v.addEventListener(ev, () => setTimeout(kick, 120)));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
    document.addEventListener("click", kick, { once:true });
    kick();
    setTimeout(kick, 400);
    setTimeout(kick, 1200);
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
        else if (k === "ai" || (t.category === "AI Tools")) {
          setOut(NTLocalAI.answer(v, t.id));
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
      <div class="sheet-item" data-go="apk"><i class="fa-solid fa-mobile-screen"></i>Pasang ke HP (nanti APK)</div>
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
        <p>Transfer <b>${escapeHtml(plan.label)}</b> ke QRIS di bawah. Ganti file <code>assets/qris.jpg</code> dengan QRIS aslimu.</p>
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
        <p>Sekarang fokus ke website dulu. APK dibuat setelah tampilan website sudah sesuai.</p>
        <p class="sub">Sementara ini bisa pasang website ke HP lewat Chrome → Add to Home screen / Install app.</p>
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
    NTMusic.bind();
    $("#ntMusicShow")?.addEventListener("click", () => { NTMusic.showAgain(); render(); });
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
    document.title = tool ? `${tool.name} - 𝑻𝑶𝑶𝑳𝑺 〆 𝑵𝑨𝑰𝑳𝑶𝑵𝑮` : `𝑻𝑶𝑶𝑳𝑺 〆 𝑵𝑨𝑰𝑳𝑶𝑵𝑮`
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
