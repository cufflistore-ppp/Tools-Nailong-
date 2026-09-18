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

      if (["iqc","sertifikat","fakedev","lobby","ustadz","virus-scan","remove-bg"].includes(t.kind)) {
        const extraEl = document.getElementById("extra") || document.getElementById("out");
        const host = document.querySelector(".tool-page") || document.getElementById("appBox");
        if (host && !document.getElementById("nxExtra")) {
          const d = document.createElement("div");
          d.id = "nxExtra";
          d.className = "panel";
          if (t.kind === "iqc" || t.kind === "fakedev" || t.kind === "remove-bg") {
            d.innerHTML = `<input class="input" id="nm" placeholder="Nama"><textarea class="tall" id="bio" placeholder="Bio / quote"></textarea><input id="pic" type="file" accept="image/*"><button class="btn-sm" id="goX">Buat</button>`;
          } else if (t.kind === "lobby") {
            d.innerHTML = `<select id="game" class="input"><option>FF</option><option>ML</option><option>PUBG</option><option>FC</option></select><input class="input" id="nm" placeholder="Nama pemain"><input class="input" id="bio" placeholder="Rank / skor (iseng)"><button class="btn-sm" id="goX">Buat kartu iseng</button><p class="sub">Ini gambar iseng, bukan lobby game asli.</p>`;
          } else if (t.kind === "sertifikat") {
            d.innerHTML = `<input class="input" id="nm" placeholder="Nama"><input class="input" id="bio" placeholder="Alasan kocak"><button class="btn-sm" id="goX">Buat sertifikat</button>`;
          } else if (t.kind === "ustadz") {
            d.innerHTML = `<textarea class="tall" id="bio" placeholder="Tulis pertanyaan harian"></textarea><button class="btn-sm" id="goX">Tanya</button>`;
          } else {
            d.innerHTML = `<textarea class="tall" id="bio" placeholder="Tempel URL, domain, IP, atau hash"></textarea><input id="pic" type="file"><button class="btn-sm" id="goX">Cek dasar</button><p class="sub">Cek ringan di browser. Bukan antivirus profesional.</p>`;
          }
          host.appendChild(d);
        }
        document.getElementById("goX")?.addEventListener("click", async () => {
          const nm = (document.getElementById("nm")||{}).value || "Nailong";
          const bio = (document.getElementById("bio")||{}).value || "";
          const out = document.getElementById("out");
          if (t.kind === "ustadz") {
            const q = bio.toLowerCase();
            let a = "Kerjakan yang baik, jaga lisan, dan jangan menunda kebaikan kecil.";
            if (/malas|capek/.test(q)) a = "Istirahat yang cukup, lalu lanjut satu tugas kecil. Jangan dihabisi sekaligus.";
            if (/bohong|tipu/.test(q)) a = "Jangan menipu. Lebih baik jujur meski terasa berat.";
            if (/belajar/.test(q)) a = "Belajar pelan tapi rutin lebih baik daripada sehari penuh lalu berhenti.";
            if (/game/.test(q)) a = "Boleh main, atur waktunya. Jangan sampai shalat atau tugas tertinggal.";
            if (out) out.textContent = "Pertanyaan: " + bio + "\n\nJawaban singkat: " + a + "\n\nIni kartu iseng, bukan fatwa.";
            return;
          }
          if (t.kind === "virus-scan") {
            const text = bio.trim();
            const f = document.getElementById("pic") && document.getElementById("pic").files[0];
            const lines = ["Cek dasar NAILONG — bukan jaminan 100%."];
            if (f) {
              const buf = await f.arrayBuffer();
              const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map(b=>b.toString(16).padStart(2,"0")).join("");
              const danger = /\.(exe|apk|bat|cmd|scr|js)$/i.test(f.name);
              lines.push("File: " + f.name);
              lines.push("Ukuran: " + f.size + " byte");
              lines.push("SHA-256: " + hash);
              lines.push(danger ? "Perhatian: jenis file ini sering dipakai program. Jangan buka kalau sumbernya tidak jelas." : "Jenis file biasa. Tetap hati-hati kalau asalnya tidak dikenal.");
            }
            if (text) {
              lines.push("Input: " + text);
              if (/^https?:\/\//i.test(text) || text.includes(".")) {
                try { const u = new URL(text.startsWith("http") ? text : "https://" + text); lines.push("Host: " + u.hostname); } catch(e) { lines.push("URL tidak rapi."); }
                if (/login|verif|hadiah|gratis-saldo|wallet-auth|free-money/i.test(text)) lines.push("Ada kata mencurigakan. Jangan isi password di situs aneh.");
                if (/^\d+\.\d+\.\d+\.\d+/.test(text)) lines.push("Ini alamat IP. Situs resmi biasanya pakai nama, bukan angka saja.");
                try {
                  const r = await fetch("https://ipwho.is/" + encodeURIComponent(text.replace(/^https?:\/\//,"").split("/")[0]));
                  const j = await r.json();
                  if (j && j.success !== false) lines.push("Perkiraan lokasi IP: " + (j.country||"-") + " / " + (j.city||"-"));
                } catch(e) {}
              }
              if (/^[a-f0-9]{32,64}$/i.test(text)) lines.push("Ini format hash. Cek lanjut bisa di layanan hash publik. Di sini hanya dikenali polanya.");
            }
            if (out) out.textContent = lines.join("\n");
            return;
          }
          const c = document.createElement("canvas");
          c.width = 900; c.height = 560;
          const x = c.getContext("2d");
          const drawPic = async () => {
            const inp = document.getElementById("pic");
            if (!inp || !inp.files[0]) return null;
            const url = URL.createObjectURL(inp.files[0]);
            const img = new Image();
            await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=url; });
            return img;
          };
          if (t.kind === "remove-bg") {
            const img = await drawPic();
            if (!img) { if (out) out.textContent = "Pilih foto dulu."; return; }
            const w = Math.min(900, img.width), h = Math.round(img.height * (w/img.width));
            c.width = w; c.height = h;
            x.drawImage(img,0,0,w,h);
            const data = x.getImageData(0,0,w,h);
            const px = data.data;
            const sample = (ix,iy) => { const i=((iy*w)+ix)*4; return [px[i],px[i+1],px[i+2]]; };
            const corners = [sample(2,2), sample(w-3,2), sample(2,h-3), sample(w-3,h-3)];
            const avg = [0,1,2].map(ch => corners.reduce((s,p)=>s+p[ch],0)/4);
            for (let i=0;i<px.length;i+=4) {
              const d = Math.abs(px[i]-avg[0])+Math.abs(px[i+1]-avg[1])+Math.abs(px[i+2]-avg[2]);
              if (d < 90) px[i+3] = 0;
            }
            x.putImageData(data,0,0);
          } else if (t.kind === "sertifikat") {
            x.fillStyle = "#111"; x.fillRect(0,0,900,560);
            x.strokeStyle = "#ffd000"; x.lineWidth = 8; x.strokeRect(24,24,852,512);
            x.fillStyle = "#ffd000"; x.font = "700 36px Arial"; x.fillText("SERTIFIKAT KOCAK", 250, 120);
            x.fillStyle = "#fff"; x.font = "22px Arial"; x.fillText("Diberikan kepada", 340, 200);
            x.fillStyle = "#ffd000"; x.font = "700 48px Arial"; x.fillText(nm, 80, 280);
            x.fillStyle = "#ddd"; x.font = "20px Arial"; x.fillText(bio || "Karena berhasil jadi bahan guyonan hari ini.", 80, 360);
            x.fillStyle = "#888"; x.font = "16px Arial"; x.fillText("Gambar iseng NAILONG — bukan ijazah resmi.", 80, 500);
          } else if (t.kind === "lobby") {
            const game = (document.getElementById("game")||{}).value || "FF";
            x.fillStyle = "#0b0d12"; x.fillRect(0,0,900,560);
            x.fillStyle = "#ffd000"; x.font = "700 28px Arial"; x.fillText("KARTU ISENG  ·  " + game, 40, 70);
            x.fillStyle = "#fff"; x.font = "700 52px Arial"; x.fillText(nm, 40, 180);
            x.fillStyle = "#ffb000"; x.font = "28px Arial"; x.fillText(bio || "Rank: iseng", 40, 250);
            x.fillStyle = "#888"; x.font = "18px Arial"; x.fillText("Bukan lobby resmi FF/ML/PUBG/FC. Hanya poster.", 40, 500);
          } else if (t.kind === "fakedev") {
            x.fillStyle = "#12100b"; x.fillRect(0,0,900,560);
            const img = await drawPic();
            x.fillStyle = "#ffd000"; x.beginPath(); x.arc(140,180,80,0,6.28); x.fill();
            if (img) x.drawImage(img, 70, 110, 140, 140);
            x.fillStyle = "#ffd000"; x.font = "700 40px Arial"; x.fillText(nm, 260, 160);
            x.fillStyle = "#ddd"; x.font = "22px Arial"; 
            const words = (bio||"Developer iseng di NAILONG TOOLS").split(" ");
            let line="", yy=210;
            for (const w of words) {
              const test=line?line+" "+w:w;
              if (x.measureText(test).width>560) { x.fillText(line,260,yy); line=w; yy+=32; } else line=test;
            }
            if (line) x.fillText(line,260,yy);
            x.fillStyle = "#888"; x.fillText("Kartu profil iseng — bukan akun resmi.", 260, 500);
          } else if (t.kind === "iqc") {
            x.fillStyle = "#0e0c08"; x.fillRect(0,0,900,560);
            const img = await drawPic();
            if (img) x.drawImage(img, 0, 0, 900, 560);
            x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0,0,900,560);
            x.fillStyle = "#ffd000"; x.font = "700 42px Arial"; x.fillText(nm, 50, 420);
            x.fillStyle = "#fff"; x.font = "24px Arial"; x.fillText(bio || "Quote kartu IQC", 50, 470);
          }
          const imgOut = document.createElement("img");
          imgOut.src = c.toDataURL("image/png");
          imgOut.className = "preview-img";
          if (out) { out.innerHTML = ""; out.appendChild(imgOut); }
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
