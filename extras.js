/* Extra working tool UIs that hook after the main renderer */
(function () {
  const helpers = {
    invoice() {
      return `<div class="panel">
        <input class="input" id="bizName" placeholder="Business name">
        <input class="input" id="custName" placeholder="Customer name">
        <textarea class="tall" id="items" placeholder="Item, qty, price — one per line&#10;Design,1,50"></textarea>
        <button class="btn-sm" id="mk">Generate</button>
        <div id="doc" class="out"></div>
        <button class="btn-sm" id="print">Print / Save as PDF</button>
      </div>`;
    }
  };

  window.NTExtras = {
    enhance(t) {
      const extra = document.getElementById("extra");
      const box = document.getElementById("appBox") || document.getElementById("calcBox");
      if (["invoice","receipt","quote","pricelist"].includes(t.kind)) {
        const host = document.querySelector(".tool-page");
        if (!host) return;
        const panel = document.createElement("div");
        panel.innerHTML = helpers.invoice();
        host.appendChild(panel);
        document.getElementById("mk").onclick = () => {
          const rows = document.getElementById("items").value.split(/\n/).map((l) => l.split(","));
          let total = 0;
          const lines = rows.map((r) => {
            const amt = Number(r[1] || 1) * Number(r[2] || 0);
            total += amt;
            return `${r[0] || "Item"} × ${r[1] || 1} = ${amt}`;
          });
          document.getElementById("doc").textContent =
            `${t.name}\n${document.getElementById("bizName").value}\nBill to: ${document.getElementById("custName").value}\n\n${lines.join("\n")}\n\nTOTAL: ${total.toFixed(2)}\nNAILONG TOOLS`;
        };
        document.getElementById("print").onclick = () => window.print();
      }
      if (t.kind === "palette") {
        const run = document.getElementById("run");
        if (run) run.addEventListener("click", () => {
          const colors = Array.from({ length: 5 }, () => "#" + NTEngine.rand(6, "0123456789abcdef"));
          document.getElementById("out").innerHTML = colors.map((c) => `<div style="display:flex;gap:8px;align-items:center;margin:6px 0"><i style="width:36px;height:36px;border-radius:8px;background:${c}"></i>${c}</div>`).join("");
        });
      }
      if (t.kind === "contrast") {
        const extraEl = document.getElementById("extra");
        if (extraEl) extraEl.innerHTML = `<input class="input" id="c1" value="#000000"><input class="input" id="c2" value="#ffd000">`;
        document.getElementById("run")?.addEventListener("click", () => {
          const a = NTEngine.hexToRgb(document.getElementById("c1").value);
          const b = NTEngine.hexToRgb(document.getElementById("c2").value);
          const lum = (c) => {
            const s = [c.r, c.g, c.b].map((v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
            return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];
          };
          const L1 = lum(a), L2 = lum(b);
          const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
          document.getElementById("out").textContent = `Contrast ${ratio.toFixed(2)}:1 · AA text ${ratio>=4.5?"pass":"fail"} · AAA ${ratio>=7?"pass":"fail"}`;
        });
      }
      if (t.kind === "css-grad") {
        document.getElementById("run")?.addEventListener("click", () => {
          const css = "linear-gradient(90deg, #ffd000, #ff7a18)";
          document.getElementById("out").textContent = `background: ${css};`;
          document.getElementById("out").style.background = css;
        });
      }
      if (t.kind === "css-shadow") {
        document.getElementById("run")?.addEventListener("click", () => {
          document.getElementById("out").textContent = "box-shadow: 0 10px 30px rgba(0,0,0,.35);";
        });
      }
      if (t.kind === "css-radius") {
        document.getElementById("run")?.addEventListener("click", () => {
          document.getElementById("out").textContent = "border-radius: 16px;";
        });
      }
      if (t.kind === "social-sizes" || t.kind === "banner-sizes" || t.kind === "logo-sizes" || t.kind === "font-pair") {
        document.getElementById("run")?.addEventListener("click", () => {
          const maps = {
            "social-sizes": "Instagram post 1080×1080\nInstagram story 1080×1920\nYouTube thumb 1280×720\nX / Twitter 1600×900",
            "banner-sizes": "Leaderboard 728×90\nMedium rectangle 300×250\nWide skyscraper 160×600\nBillboard 970×250",
            "logo-sizes": "Favicon 32×32\nApp icon 512×512\nNavbar 200×60\nPrint 2000×2000",
            "font-pair": "Heading: Inter ExtraBold\nBody: Inter Regular\n\nHeading: Poppins\nBody: Open Sans"
          };
          document.getElementById("out").textContent = maps[t.kind];
        });
      }
      if (t.kind === "sku" || t.kind === "inv-no") {
        document.getElementById("run")?.addEventListener("click", () => {
          document.getElementById("out").textContent = (t.kind==="sku"?"SKU-":"INV-") + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + NTEngine.rand(4,"0123456789");
        });
      }
      if (t.kind === "picker") {
        document.getElementById("run")?.addEventListener("click", () => {
          const items = document.getElementById("inp").value.split(/\n/).map((s)=>s.trim()).filter(Boolean);
          document.getElementById("out").textContent = items[Math.floor(Math.random()*items.length)] || "Add items, one per line";
        });
      }
      if (t.kind === "rand-num") {
        document.getElementById("run")?.addEventListener("click", () => {
          const [a,b] = (document.getElementById("inp").value || "1 100").split(/\s+/).map(Number);
          const min = Math.min(a||1,b||100), max = Math.max(a||1,b||100);
          document.getElementById("out").textContent = String(Math.floor(Math.random()*(max-min+1))+min);
        });
      }
      if (t.kind === "decision") {
        document.getElementById("run")?.addEventListener("click", () => {
          document.getElementById("out").textContent = ["Yes","No","Maybe","Try another option"][Math.floor(Math.random()*4)];
        });
      }
      if (t.kind === "leap") {
        document.getElementById("run")?.addEventListener("click", () => {
          const y = Number(document.getElementById("inp").value);
          document.getElementById("out").textContent = ((y%4===0 && y%100!==0) || y%400===0) ? y+" is a leap year" : y+" is not a leap year";
        });
      }
      if (t.kind === "weeknum") {
        document.getElementById("run")?.addEventListener("click", () => {
          const d = new Date(document.getElementById("inp").value || Date.now());
          const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
          const dayNum = t.getUTCDay() || 7;
          t.setUTCDate(t.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(t.getUTCFullYear(),0,1));
          const week = Math.ceil((((t - yearStart) / 86400000) + 1)/7);
          document.getElementById("out").textContent = "ISO week " + week;
        });
      }
      if (t.kind === "multable") {
        document.getElementById("run")?.addEventListener("click", () => {
          const n = Number(document.getElementById("inp").value || 9);
          let s = "";
          for (let i=1;i<=n;i++){ for(let j=1;j<=n;j++) s += String(i*j).padStart(4," "); s += "\n"; }
          document.getElementById("out").textContent = s;
        });
      }

      if (t.kind === "quote-img" || t.kind === "brat" || t.kind === "nokia" || t.kind === "poster-color") {
        document.getElementById("run")?.addEventListener("click", () => {
          const v = (document.getElementById("inp")||{}).value || "NAILONG TOOLS";
          const c = document.createElement("canvas");
          c.width = 900; c.height = 600;
          const x = c.getContext("2d");
          if (t.kind === "brat") {
            x.fillStyle = "#8aff00"; x.fillRect(0,0,900,600);
            x.fillStyle = "#111"; x.font = "700 64px Arial";
            wrap(x, v, 60, 160, 780, 72);
          } else if (t.kind === "nokia") {
            x.fillStyle = "#9bbb3c"; x.fillRect(0,0,900,600);
            x.fillStyle = "#1c2a0c"; x.fillRect(80,70,740,460);
            x.fillStyle = "#c6e37a"; x.font = "28px monospace";
            x.fillText("Pesan baru", 110, 130);
            wrap(x, v, 110, 190, 680, 36);
          } else {
            x.fillStyle = "#0b0b0c"; x.fillRect(0,0,900,600);
            x.fillStyle = "#ffd000"; x.font = "700 48px Arial";
            wrap(x, '"'+v+'"', 70, 180, 760, 58);
            x.fillStyle = "#ff7a18"; x.font = "20px Arial";
            x.fillText("NAILONG TOOLS", 70, 540);
          }
          const img = document.createElement("img");
          img.src = c.toDataURL("image/png");
          img.className = "preview-img";
          const out = document.getElementById("out");
          if (out) { out.innerHTML = ""; out.appendChild(img); }
        });
      }
      if (t.kind === "tts") {
        document.getElementById("run")?.addEventListener("click", () => {
          const v = (document.getElementById("inp")||{}).value || "";
          const u = new SpeechSynthesisUtterance(v);
          u.lang = "id-ID";
          speechSynthesis.cancel();
          speechSynthesis.speak(u);
          document.getElementById("out").textContent = "Membacakan teks...";
        });
      }
      if (t.kind === "dice") {
        document.getElementById("run")?.addEventListener("click", () => {
          document.getElementById("out").textContent = "Dadu: " + (1+Math.floor(Math.random()*6));
        });
      }
      if (t.kind === "coin") {
        document.getElementById("run")?.addEventListener("click", () => {
          document.getElementById("out").textContent = Math.random()<.5 ? "Angka" : "Gambar";
        });
      }
      if (t.kind === "pick") {
        document.getElementById("run")?.addEventListener("click", () => {
          const list = ((document.getElementById("inp")||{}).value||"").split(/\n+/).map(s=>s.trim()).filter(Boolean);
          document.getElementById("out").textContent = list.length ? list[Math.floor(Math.random()*list.length)] : "Isi daftar dulu, satu baris satu item.";
        });
      }
      if (t.kind === "checklist") {
        document.getElementById("run")?.addEventListener("click", () => {
          const list = ((document.getElementById("inp")||{}).value||"").split(/\n+/).map(s=>s.trim()).filter(Boolean);
          document.getElementById("out").innerHTML = list.map(s=>"<div>☐ "+s+"</div>").join("") || "Tulis item, satu baris satu tugas.";
        });
      }
      if (t.kind === "world-clock") {
        document.getElementById("run")?.addEventListener("click", () => {
          const z = [["WIB","Asia/Jakarta"],["WITA","Asia/Makassar"],["WIT","Asia/Jayapura"],["UTC","UTC"],["London","Europe/London"],["Tokyo","Asia/Tokyo"]];
          document.getElementById("out").textContent = z.map(([n,tz])=>n+": "+new Date().toLocaleString("id-ID",{timeZone:tz,hour:"2-digit",minute:"2-digit",second:"2-digit"})).join("\n");
        });
      }
      if (t.kind === "percent") {
        document.getElementById("run")?.addEventListener("click", () => {
          const v = (document.getElementById("inp")||{}).value || "";
          const m = v.match(/([\d.,]+)\D+([\d.,]+)/);
          if (!m) { document.getElementById("out").textContent = "Contoh: 20% dari 150000"; return; }
          const a=+m[1].replace(",","."), b=+m[2].replace(",", ".");
          document.getElementById("out").textContent = a+"% dari "+b+" = "+(b*a/100);
        });
      }
      if (t.kind === "ip-lookup") {
        document.getElementById("run")?.addEventListener("click", async () => {
          try {
            const r = await fetch("https://ipwho.is/");
            const j = await r.json();
            document.getElementById("out").textContent = JSON.stringify({ip:j.ip,country:j.country,city:j.city,isp:j.connection&&j.connection.isp},null,2);
          } catch(e) { document.getElementById("out").textContent = String(e); }
        });
      }
      function wrap(x, text, x0, y0, max, lh) {
        const words = String(text).split(/\s+/);
        let line="", y=y0;
        for (const w of words) {
          const test = line ? line+" "+w : w;
          if (x.measureText(test).width > max) { x.fillText(line, x0, y); line=w; y+=lh; }
          else line=test;
        }
        if (line) x.fillText(line, x0, y);
      }

    }
  };

  const orig = window.NTRender;
})();
