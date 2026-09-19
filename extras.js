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

      if (t.kind === "brat") {
        const extra = document.getElementById("extra");
        if (extra) extra.innerHTML = `
          <p class="sub">PNG statis atau GIF animasi (latar putih).</p>
          <div style="display:flex;gap:8px;margin:8px 0">
            <button class="btn-sm" id="bratStatic" type="button">Static</button>
            <button class="btn-sm" id="bratGif" type="button" style="background:#222;color:#fff">GIF</button>
          </div>
          <canvas id="bratCv" width="540" height="540" style="width:100%;max-width:360px;border-radius:12px;background:#fff"></canvas>
          <div style="margin-top:8px"><a id="bratDl" class="btn-sm" download="brat.png">Unduh</a></div>`;
        let mode = "static";
        let anim;
        const drawBrat = (ctx, text, w, h, jitter) => {
          ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,w,h);
          ctx.fillStyle = "#111";
          ctx.font = "italic " + Math.round(w*0.085) + "px Arial Narrow, Arial, sans-serif";
          ctx.filter = "blur(0.5px)";
          const words = String(text||"brat").toLowerCase().split(/\s+/);
          let line="", y = h*0.22 + (jitter||0), x0 = w*0.07, max = w*0.86, lh = w*0.1;
          const flush = () => { if (line) { ctx.fillText(line, x0, y); y += lh; line=""; } };
          for (const word of words) {
            const test = line ? line+" "+word : word;
            if (ctx.measureText(test).width > max) { flush(); line = word; } else line = test;
          }
          flush();
          ctx.filter = "none";
        };
        const showPng = () => {
          const text = (document.getElementById("inp")||{}).value || "brat";
          const c = document.getElementById("bratCv");
          const x = c.getContext("2d");
          drawBrat(x, text, c.width, c.height, 0);
          const big = document.createElement("canvas"); big.width=1080; big.height=1080;
          drawBrat(big.getContext("2d"), text, 1080, 1080, 0);
          const a = document.getElementById("bratDl");
          a.href = big.toDataURL("image/png"); a.download = "brat.png";
          const out = document.getElementById("out");
          if (out) out.textContent = "BRAT static siap diunduh.";
        };
        const lzwGif = (indexed, minCode) => {
          const clear = 1 << minCode, eoi = clear + 1;
          let codeSize = minCode + 1, next = eoi + 1;
          const dict = new Map();
          const out = [];
          let acc = 0, bits = 0;
          const emit = (code) => {
            acc |= code << bits; bits += codeSize;
            while (bits >= 8) { out.push(acc & 255); acc >>= 8; bits -= 8; }
          };
          const reset = () => { dict.clear(); codeSize = minCode + 1; next = eoi + 1; };
          const keyOf = (arr) => arr.join(",");
          emit(clear);
          let w = [indexed[0]];
          for (let i = 1; i < indexed.length; i++) {
            const wk = w.concat(indexed[i]);
            if (dict.has(keyOf(wk))) w = wk;
            else {
              emit(w.length === 1 ? w[0] : dict.get(keyOf(w)));
              if (next < 4096) {
                dict.set(keyOf(wk), next);
                if (next === (1 << codeSize) && codeSize < 12) codeSize++;
                next++;
              } else { emit(clear); reset(); }
              w = [indexed[i]];
            }
          }
          emit(w.length === 1 ? w[0] : dict.get(keyOf(w)));
          emit(eoi);
          if (bits) out.push(acc & 255);
          return out;
        };
        const framesToGif = (frames, w, h, delay) => {
          const b = [];
          const put = (...n) => n.forEach((v) => b.push(v & 255));
          const str = (s) => { for (let i=0;i<s.length;i++) put(s.charCodeAt(i)); };
          str("GIF89a");
          put(w, w>>8, h, h>>8, 0x81, 0, 0, 255,255,255, 17,17,17, 0,0,0, 0,0,0);
          put(0x21,0xff,0x0b); str("NETSCAPE2.0"); put(3,1,0,0,0);
          frames.forEach((px) => {
            put(0x21,0xf9,4,4, delay, delay>>8, 0, 0);
            put(0x2c,0,0,0,0, w, w>>8, h, h>>8, 0, 2);
            const comp = lzwGif(px, 2);
            for (let i=0;i<comp.length;i+=255) {
              const n = Math.min(255, comp.length-i);
              put(n);
              for (let j=0;j<n;j++) put(comp[i+j]);
            }
            put(0);
          });
          put(0x3b);
          return new Blob([new Uint8Array(b)], {type:"image/gif"});
        };
        const showAnim = () => {
          const text = (document.getElementById("inp")||{}).value || "brat";
          const c = document.getElementById("bratCv");
          const x = c.getContext("2d");
          const out = document.getElementById("out");
          if (out) out.textContent = "Membuat GIF...";
          const fw = 360, fh = 360;
          const tmp = document.createElement("canvas"); tmp.width = fw; tmp.height = fh;
          const tx = tmp.getContext("2d", {willReadFrequently:true});
          const frames = [];
          for (let i=0;i<12;i++) {
            drawBrat(tx, text, fw, fh, Math.sin(i/2)*10);
            const data = tx.getImageData(0,0,fw,fh).data;
            const idx = new Array(fw*fh);
            for (let p=0,q=0;p<data.length;p+=4,q++) idx[q] = data[p] < 200 ? 1 : 0;
            frames.push(idx);
          }
          const finish = (url) => {
            drawBrat(x, text, c.width, c.height, 0);
            const a = document.getElementById("bratDl");
            a.href = url; a.download = "brat.gif";
            const img = document.createElement("img");
            img.src = url; img.className = "preview-img";
            if (out) { out.innerHTML = ""; out.appendChild(img); const p=document.createElement("p"); p.textContent="GIF siap. Klik Unduh."; out.appendChild(p); }
          };
          if (window.gifshot) {
            const imgs=[];
            for (let i=0;i<8;i++){
              const f=document.createElement("canvas"); f.width=360; f.height=360;
              drawBrat(f.getContext("2d"), text, 360, 360, Math.sin(i/2)*10);
              imgs.push(f.toDataURL("image/png"));
            }
            gifshot.createGIF({images:imgs,gifWidth:360,gifHeight:360,interval:0.08,numFrames:8}, function(obj){
              if(!obj.error) finish(obj.image);
              else finish(URL.createObjectURL(framesToGif(frames, fw, fh, 8)));
            });
            return;
          }
          const blob = framesToGif(frames, fw, fh, 8);
          const url = URL.createObjectURL(blob);
          drawBrat(x, text, c.width, c.height, 0);
          const a = document.getElementById("bratDl");
          a.href = url; a.download = "brat.gif";
          const img = document.createElement("img");
          img.src = url; img.className = "preview-img";
          if (out) { out.innerHTML = ""; out.appendChild(img); const p=document.createElement("p"); p.textContent="GIF siap. Klik Unduh."; out.appendChild(p); }
        };
        document.getElementById("bratStatic")?.addEventListener("click", () => { mode="static"; cancelAnimationFrame(anim); showPng(); });
        document.getElementById("bratGif")?.addEventListener("click", () => { mode="gif"; showAnim(); });
        document.getElementById("run")?.addEventListener("click", () => { mode==="gif" ? showAnim() : showPng(); });
        showPng();
      }

      if (t.kind === "iqc") {
        const extra = document.getElementById("extra");
        if (extra) extra.innerHTML = `
          <label>Operator</label>
          <select id="op" class="input">
            <option>Axis</option><option>Telkomsel</option><option>Indosat</option>
            <option>XL</option><option>Three</option><option>Smartfren</option>
          </select>
          <label>Jam</label><input class="input" id="jam" value="12:00">
          <label>Baterai %</label><input class="input" id="bat" type="number" value="65">`;
        document.getElementById("run")?.addEventListener("click", () => {
          const msg = (document.getElementById("inp")||{}).value || "Hai";
          const op = (document.getElementById("op")||{}).value || "Axis";
          const jam = (document.getElementById("jam")||{}).value || "12:00";
          const bat = Math.max(0, Math.min(100, Number((document.getElementById("bat")||{}).value||65)));
          const c = document.createElement("canvas"); c.width=540; c.height=960;
          const x = c.getContext("2d");
          x.fillStyle = "#000"; x.fillRect(0,0,540,960);
          x.fillStyle = "#fff"; x.font = "600 18px Arial";
          x.fillText(op, 24, 42); x.fillText(jam, 240, 42);
          x.fillStyle = "#3ddc84"; x.fillRect(470, 28, 46*(bat/100), 16);
          x.strokeStyle = "#fff"; x.strokeRect(468, 26, 50, 20);
          x.fillStyle = "#1c1c1e"; x.beginPath();
          if (x.roundRect) x.roundRect(24, 120, 400, 90, 18); else x.rect(24,120,400,90);
          x.fill();
          x.fillStyle = "#fff"; x.font = "22px Arial";
          const words = String(msg).split(/\s+/); let line="", y=155;
          for (const w of words) {
            const test = line?line+" "+w:w;
            if (x.measureText(test).width > 360) { x.fillText(line, 40, y); line=w; y+=28; } else line=test;
          }
          if (line) x.fillText(line, 40, y);
          const img = document.createElement("img");
          img.src = c.toDataURL("image/png"); img.className = "preview-img";
          const out = document.getElementById("out");
          if (out) { out.innerHTML=""; out.appendChild(img); }
        });
      }

      if (t.kind === "quote-img" || t.kind === "nokia" || t.kind === "poster-color") {
        document.getElementById("run")?.addEventListener("click", () => {
          const v = (document.getElementById("inp")||{}).value || "NAILONG TOOLS";
          const c = document.createElement("canvas");
          c.width = 900; c.height = 600;
          const x = c.getContext("2d");
          if (t.kind === "brat") {
            c.width = 1080; c.height = 1080;
            x.fillStyle = "#ffffff"; x.fillRect(0,0,1080,1080);
            const words = String(v).toLowerCase();
            x.fillStyle = "#111";
            x.font = "italic 92px Arial Narrow, Arial, sans-serif";
            x.filter = "blur(0.6px)";
            wrap(x, words, 70, 220, 940, 110);
            x.filter = "none";
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

    if (t.kind === "ic-browser") {
      const extra = document.getElementById("extra");
      if (extra) extra.innerHTML = `<input class="input" id="url" placeholder="https://contoh.com"><button class="btn-sm" id="goUrl" style="margin-top:8px">Buka</button><iframe class="browser-frame" id="frame" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>`;
      const open = () => {
        let u = (document.getElementById("url")||document.getElementById("inp")).value.trim();
        if (!u) return;
        if (!/^https?:\/\//i.test(u)) u = "https://" + u;
        const f = document.getElementById("frame");
        if (f) f.src = u;
      };
      document.getElementById("goUrl")?.addEventListener("click", open);
      document.getElementById("run")?.addEventListener("click", open);
    }
    if (t.kind === "url-open") {
      const extra = document.getElementById("extra");
      if (extra) extra.innerHTML = `
        <p class="sub">Tempel tautan, lalu proses. Video resmi muncul di sini. Unduh hanya jika tautannya file langsung.</p>
        <div id="urlPrev" class="url-prev"></div>`;
      const inp = document.getElementById("inp");
      if (inp && !inp.placeholder) inp.placeholder = "https://...";
      const show = (html) => {
        const box = document.getElementById("urlPrev");
        if (box) box.innerHTML = html;
        const out = document.getElementById("out");
        if (out) out.textContent = "";
      };
      const run = () => {
        let u = ((document.getElementById("inp")||{}).value || "").trim();
        if (!u) { show("<p class='sub'>Tempel URL dulu.</p>"); return; }
        if (!/^https?:\/\//i.test(u)) u = "https://" + u;
        let host = "", path = "";
        try { const x = new URL(u); host = x.hostname; path = x.pathname; } catch {}
        const direct = /\.(mp4|webm|mov|m4v|mp3|wav|m4a|jpg|jpeg|png|gif|webp|pdf|zip|rar|7z|mkv)(\?|$)/i.test(u);
        if (direct) {
          const isVid = /\.(mp4|webm|mov|m4v|mkv)(\?|$)/i.test(u);
          const isAud = /\.(mp3|wav|m4a)(\?|$)/i.test(u);
          const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(u);
          let media = "";
          if (isVid) media = `<video class="url-media" controls src="${u}"></video>`;
          else if (isAud) media = `<audio class="url-media" controls src="${u}"></audio>`;
          else if (isImg) media = `<img class="preview-img" src="${u}" alt="">`;
          show(media + `<p><a class="btn-sm" href="${u}" download target="_blank" rel="noopener">Unduh</a> <a class="btn-sm" href="${u}" target="_blank" rel="noopener">Buka</a></p>`);
          return;
        }
        let yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i);
        let tk = u.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i) || u.match(/tiktok\.com\/.*\/video\/(\d+)/i);
        let ig = u.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/i);
        if (yt) {
          show(`<iframe class="url-frame" src="https://www.youtube.com/embed/${yt[1]}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe><p class="sub">Pemutar resmi YouTube. Unduh file tidak disediakan.</p>`);
          return;
        }
        if (tk) {
          show(`<iframe class="url-frame" src="https://www.tiktok.com/embed/v2/${tk[1]}" allow="encrypted-media" allowfullscreen></iframe><p class="sub">Pemutar resmi TikTok. Simpan lewat aplikasi TikTok jika perlu.</p>`);
          return;
        }
        if (ig) {
          show(`<iframe class="url-frame" src="https://www.instagram.com/p/${ig[1]}/embed" allowfullscreen></iframe><p class="sub">Tampilan resmi Instagram. Simpan lewat aplikasi Instagram jika perlu.</p>`);
          return;
        }
        if (/terabox|1024tera|teraboxapp/i.test(host)) {
          show(`<p class="sub">Folder/berkas Terabox dibuka di situs resmi.</p><p><a class="btn-sm" href="${u}" target="_blank" rel="noopener">Buka di Terabox</a></p>`);
          window.open(u, "_blank", "noopener");
          return;
        }
        show(`<p class="sub">Bukan file langsung. Dibuka di tab baru.</p><p><a class="btn-sm" href="${u}" target="_blank" rel="noopener">Buka tautan</a></p>`);
        window.open(u, "_blank", "noopener");
      };
      document.getElementById("run")?.addEventListener("click", run);
    }

    if (t.kind === "tweet-card") {
      document.getElementById("run")?.addEventListener("click", () => {
        const v = (document.getElementById("inp")||{}).value || "Halo dari Nailong";
        const c = document.createElement("canvas"); c.width=900; c.height=420;
        const x = c.getContext("2d");
        x.fillStyle="#000"; x.fillRect(0,0,900,420);
        x.fillStyle="#fff"; x.font="700 28px Arial"; x.fillText("Tweet iseng", 40, 70);
        x.font="22px Arial";
        const words=v.split(/\s+/); let line="", y=130;
        for (const w of words){ const test=line?line+" "+w:w; if(x.measureText(test).width>820){x.fillText(line,40,y);line=w;y+=32;} else line=test; }
        if(line) x.fillText(line,40,y);
        x.fillStyle="#888"; x.font="16px Arial"; x.fillText("Bukan Twitter/X resmi. Hanya kartu parody.", 40, 390);
        const img=document.createElement("img"); img.src=c.toDataURL(); img.className="preview-img";
        const out=document.getElementById("out"); if(out){out.innerHTML="";out.appendChild(img);}
      });
    }
    if (t.kind === "obfuscate") {
      document.getElementById("run")?.addEventListener("click", () => {
        const v = (document.getElementById("inp")||{}).value || "";
        const b = btoa(unescape(encodeURIComponent(v)));
        const out=document.getElementById("out");
        if(out) out.textContent = "<script>document.write(decodeURIComponent(escape(atob(\""+b+"\"))))<\/script>";
      });
    }
    if (t.kind === "ss-web") {
      document.getElementById("run")?.addEventListener("click", () => {
        let u=(document.getElementById("inp")||{}).value.trim();
        const out=document.getElementById("out");
        if(!u){ if(out) out.textContent="Tempel URL."; return; }
        if(!/^https?:\/\//i.test(u)) u="https://"+u;
        const img=document.createElement("img");
        img.className="preview-img";
        img.alt="preview";
        img.src="https://image.thum.io/get/width/800/noanimate/"+encodeURIComponent(u);
        if(out){ out.innerHTML=""; out.appendChild(img); }
      });
    }
    if (t.kind === "ml-winrate") {
      const extra=document.getElementById("extra");
      if(extra) extra.innerHTML=`<label>Menang</label><input class="input" id="win" type="number" value="60"><label>Kalah</label><input class="input" id="lose" type="number" value="40">`;
      document.getElementById("run")?.addEventListener("click", () => {
        const w=Number((document.getElementById("win")||{}).value||0);
        const l=Number((document.getElementById("lose")||{}).value||0);
        const t=w+l;
        const wr=t? (w/t*100).toFixed(2):"0.00";
        const need=Math.ceil((0.7*(t)-w)/0.3);
        const out=document.getElementById("out");
        if(out) out.textContent="Total "+t+" match\nWinrate "+wr+"%\nPerkiraan menang berturut agar 70%: "+(need>0?need:0);
      });
    }
    if (t.kind === "prompt-pack") {
      document.getElementById("run")?.addEventListener("click", () => {
        const pack=[
          "Jelaskan topik ini dengan bahasa sederhana untuk pelajar.",
          "Buat kerangka tugas dari ide berikut, 5 poin.",
          "Ringkas teks ini jadi 5 kalimat.",
          "Buat caption sopan untuk postingan ini.",
          "Tanyakan 8 pertanyaan latihan tentang materi ini."
        ];
        const out=document.getElementById("out");
        if(out) out.textContent=pack.map((s,i)=>(i+1)+". "+s).join("\n");
      });
    }
    if (t.kind === "meta-gen") {
      document.getElementById("run")?.addEventListener("click", () => {
        const v=(document.getElementById("inp")||{}).value || "TOOLS NAILONG";
        const [title,...rest]=v.split("\n");
        const desc=(rest.join(" ")||title).slice(0,160);
        const out=document.getElementById("out");
        if(out) out.textContent=`<title>${title}</title>\n<meta name="description" content="${desc}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">`;
      });
    }
    if (t.kind === "markdown") {
      document.getElementById("run")?.addEventListener("click", () => {
        let v=(document.getElementById("inp")||{}).value || "# Halo";
        v=v.replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>");
        v=v.replace(/\*\*(.*?)\*\*/g,"<b>$1</b>").replace(/\*(.*?)\*/g,"<i>$1</i>");
        v=v.replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\n/g,"<br>");
        const out=document.getElementById("out");
        if(out) out.innerHTML=v;
      });
    }
    if (t.kind === "diff") {
      const extra=document.getElementById("extra");
      if(extra) extra.innerHTML=`<textarea class="tall" id="inp2" placeholder="Teks B"></textarea>`;
      document.getElementById("run")?.addEventListener("click", () => {
        const a=((document.getElementById("inp")||{}).value||"").split(/\n/);
        const b=((document.getElementById("inp2")||{}).value||"").split(/\n/);
        const n=Math.max(a.length,b.length);
        const lines=[];
        for(let i=0;i<n;i++){
          if((a[i]||"")===(b[i]||"")) lines.push("  "+(a[i]||""));
          else lines.push("- "+(a[i]||"(kosong)")+"\n+ "+(b[i]||"(kosong)"));
        }
        const out=document.getElementById("out"); if(out) out.textContent=lines.join("\n");
      });
    }
    if (t.kind === "contrast") {
      const extra=document.getElementById("extra");
      if(extra) extra.innerHTML=`<label>Teks</label><input class="input" id="c1" value="#111111"><label>Latar</label><input class="input" id="c2" value="#ffd000">`;
      document.getElementById("run")?.addEventListener("click", () => {
        const hex=(s)=>{s=s.replace("#",""); if(s.length===3)s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2]; const n=parseInt(s,16); return [(n>>16)&255,(n>>8)&255,n&255];};
        const lum=(rgb)=>{const a=rgb.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];};
        const L1=lum(hex((document.getElementById("c1")||{}).value||"#000"));
        const L2=lum(hex((document.getElementById("c2")||{}).value||"#fff"));
        const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
        const out=document.getElementById("out");
        if(out) out.textContent="Rasio "+ratio.toFixed(2)+":1\nAA teks biasa: "+(ratio>=4.5?"lulus":"kurang")+"\nAA judul: "+(ratio>=3?"lulus":"kurang");
      });
    }
    if (t.kind === "og-card") {
      document.getElementById("run")?.addEventListener("click", () => {
        const v=(document.getElementById("inp")||{}).value || "TOOLS 〆 NAILONG";
        const c=document.createElement("canvas"); c.width=1200; c.height=630;
        const x=c.getContext("2d");
        x.fillStyle="#070708"; x.fillRect(0,0,1200,630);
        x.fillStyle="#ffd000"; x.fillRect(0,0,18,630);
        x.fillStyle="#fff"; x.font="700 64px Arial"; x.fillText(v.slice(0,32), 60, 280);
        x.fillStyle="#ffb000"; x.font="28px Arial"; x.fillText("NAILONG TOOLS  ·  v148.027.00", 60, 360);
        const img=document.createElement("img"); img.src=c.toDataURL(); img.className="preview-img";
        const out=document.getElementById("out"); if(out){out.innerHTML="";out.appendChild(img);}
      });
    }
    }
  };

  const orig = window.NTRender;
})();
